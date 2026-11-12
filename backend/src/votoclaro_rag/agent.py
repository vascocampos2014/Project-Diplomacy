"""The answering loop: the LLM picks tools, reads their results, and answers
with citations. Provider-agnostic via the OpenAI-compatible chat API."""

import json
import logging
import re
import threading
import time
from dataclasses import dataclass, field
from datetime import date

from openai import APIStatusError, OpenAI, RateLimitError

from votoclaro_rag.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_MODELS
from votoclaro_rag.tools import TOOL_SPECS, run_tool

log = logging.getLogger(__name__)

MAX_STEPS = 6  # tool rounds before forcing an answer; caps cost on free-tier quotas

SYSTEM = f"""És o assistente do VotoClaro, uma app apartidária sobre a Assembleia da República portuguesa.
Hoje é {date.today().isoformat()}. Os dados cobrem a XVII legislatura.

Regras:
1. Responde APENAS com base nos resultados das ferramentas. Nunca uses conhecimento próprio sobre política, partidos ou leis.
2. Cita cada afirmação com a referência entre parênteses retos, p. ex. [Projeto de Lei n.º 672, Artigo 2.º] ou [Projeto de Resolução n.º 1239, votação de 2026-10-21].
3. Se as ferramentas não trouxerem a resposta, diz claramente que não encontraste essa informação nos dados. Não adivinhes.
4. És neutro: descreves o que as iniciativas propõem e como cada partido votou. Não dás opiniões, não avalias partidos nem políticas e nunca recomendas em quem votar. Se te pedirem isso, explica com simpatia que não o fazes e oferece os factos.
5. Uma iniciativa pode ter várias votações. Usa o campo "fase" para escolher a certa: se perguntarem pela votação final global, usa a de fase "votação final global" e não a da generalidade. Se não perguntarem a fase e os votos diferirem, diz como votaram em cada fase. A posição de voto é a do grupo parlamentar. Uma entrada como "1-PS" significa que um deputado desse partido votou de forma diferente do seu grupo.
6. Para perguntas sobre conteúdo usa search_bills; sobre votos usa get_votes ou find_votes. Combina-as quando a pergunta pede as duas coisas.
7. Responde na língua da pergunta, de forma curta e clara para jovens dos 16 aos 30 anos."""


@dataclass
class AskResult:
    answer: str
    tool_calls: list[dict] = field(default_factory=list)
    prompt_tokens: int = 0
    completion_tokens: int = 0
    seconds: float = 0.0
    model: str = LLM_MODEL  # the model that wrote the final answer
    models_tried: list[str] = field(default_factory=list)  # in order, including ones that hit a limit


def _client() -> OpenAI:
    if not LLM_API_KEY:
        raise RuntimeError("Falta a chave do LLM: define GROQ_API_KEY (ou LLM_API_KEY) em backend/.env")
    # Retries are decided per call in _complete: none while a fallback model
    # is left (switching is faster than waiting), a few on the last one.
    return OpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY, max_retries=0)


# --- Model fallback ---------------------------------------------------------
# When a model hits its quota, skip it until the provider says it resets
# (Retry-After), so later questions don't waste a request finding out again.

DEFAULT_COOLDOWN = 60.0
MAX_COOLDOWN = 6 * 3600.0
_cooldown_until: dict[str, float] = {}
_cooldown_lock = threading.Lock()


class AllModelsUnavailable(RateLimitError):
    """Every model in the chain is rate-limited or failing. Subclasses
    RateLimitError so callers that map it to HTTP 429 keep working."""


def _retry_after(err: APIStatusError) -> float:
    headers = getattr(err.response, "headers", None) or {}
    try:
        secs = float(headers.get("retry-after", ""))
    except ValueError:
        return DEFAULT_COOLDOWN
    return min(max(secs, 1.0), MAX_COOLDOWN)


def _cool_down(model: str, seconds: float) -> None:
    with _cooldown_lock:
        _cooldown_until[model] = time.monotonic() + seconds


def available_models(models: list[str]) -> list[str]:
    now = time.monotonic()
    with _cooldown_lock:
        return [m for m in models if _cooldown_until.get(m, 0.0) <= now]


def _should_fall_back(err: APIStatusError) -> bool:
    # 413: this request alone is bigger than the model's per-minute token
    # budget (Groq free tier); a model with a bigger budget can still take it.
    if isinstance(err, RateLimitError) or err.status_code in (404, 413) or err.status_code >= 500:
        return True
    # Groq answers 400 "tool_use_failed" when a model emits a malformed tool
    # call; another model may well get it right.
    return err.status_code == 400 and "tool_use_failed" in str(err)


def _complete(client, models: list[str], state: dict, result: "AskResult", **kwargs):
    """One chat completion, trying models in order from state["i"]. The
    conversation so far is plain OpenAI-format messages, so a fallback model
    can pick it up mid-way, after tool calls made by another model."""
    candidates = available_models(models[state["i"]:]) or models[-1:]
    for n, model in enumerate(candidates):
        last = n == len(candidates) - 1
        if not result.models_tried or result.models_tried[-1] != model:
            result.models_tried.append(model)
        caller = client.with_options(max_retries=2 if last else 0) if hasattr(client, "with_options") else client
        try:
            res = caller.chat.completions.create(model=model, **kwargs)
        except APIStatusError as err:
            if not _should_fall_back(err):
                raise
            if isinstance(err, RateLimitError):
                _cool_down(model, _retry_after(err))
            log.warning("model %s unavailable (%s), %s", model, err.status_code, "giving up" if last else "falling back")
            if last:
                raise AllModelsUnavailable(
                    "Todos os modelos atingiram o limite.", response=err.response, body=getattr(err, "body", None)
                ) from err
            continue
        state["i"] = models.index(model)  # stay on the model that worked for the rest of this question
        result.model = model
        return res
    raise AssertionError("unreachable")


# Some models (gpt-oss) cite with 【…】 and use narrow no-break spaces and
# non-breaking hyphens. Normalise so citations are uniform and text renders
# and searches like ordinary Portuguese.
_TIDY = str.maketrans({"【": "[", "】": "]", "\u202f": " ", "\u00a0": " ", "\u2011": "-", "\u2010": "-"})


_THINK = re.compile(r"<think>.*?</think>", re.DOTALL)


def tidy_answer(text: str) -> str:
    # Qwen-style reasoning models can put their reasoning in <think> tags.
    text = _THINK.sub("", text).translate(_TIDY)
    # Some answers wrap citations twice: [[Projeto de Lei n.º 511, ...]].
    text = re.sub(r"\[\[([^\[\]]+)\]\]", r"[\1]", text)
    return text.strip()


def ask(question: str, model: str | None = None) -> AskResult:
    """Answer a question. With no model, use the fallback chain (LLM_MODELS);
    with one (the evals), use only that model."""
    client = _client()
    models = [model] if model else LLM_MODELS
    state = {"i": 0}
    messages: list[dict] = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    result = AskResult(answer="", model=models[0])
    start = time.monotonic()

    for step in range(MAX_STEPS + 1):
        last = step == MAX_STEPS
        res = _complete(
            client,
            models,
            state,
            result,
            messages=messages,
            tools=None if last else TOOL_SPECS,
            temperature=0.1,
        )
        if res.usage:
            result.prompt_tokens += res.usage.prompt_tokens
            result.completion_tokens += res.usage.completion_tokens
        msg = res.choices[0].message

        if not msg.tool_calls:
            result.answer = tidy_answer(msg.content or "")
            break

        messages.append(
            {
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {"id": c.id, "type": "function", "function": {"name": c.function.name, "arguments": c.function.arguments}}
                    for c in msg.tool_calls
                ],
            }
        )
        for call in msg.tool_calls:
            try:
                args = json.loads(call.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            output = run_tool(call.function.name, args)
            result.tool_calls.append({"name": call.function.name, "arguments": args})
            messages.append({"role": "tool", "tool_call_id": call.id, "content": output})

    result.seconds = round(time.monotonic() - start, 2)
    return result
