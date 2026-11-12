"""The answering loop: the LLM picks tools, reads their results, and answers
with citations. Provider-agnostic via the OpenAI-compatible chat API."""

import json
import time
from dataclasses import dataclass, field
from datetime import date

from openai import OpenAI

from votoclaro_rag.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
from votoclaro_rag.tools import TOOL_SPECS, run_tool

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
    model: str = LLM_MODEL


def _client() -> OpenAI:
    if not LLM_API_KEY:
        raise RuntimeError("Falta a chave do LLM: define GROQ_API_KEY (ou LLM_API_KEY) em backend/.env")
    return OpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY, max_retries=3)


# Some models (gpt-oss) cite with 【…】 and use narrow no-break spaces and
# non-breaking hyphens. Normalise so citations are uniform and text renders
# and searches like ordinary Portuguese.
_TIDY = str.maketrans({"【": "[", "】": "]", "\u202f": " ", "\u00a0": " ", "\u2011": "-", "\u2010": "-"})


def tidy_answer(text: str) -> str:
    return text.translate(_TIDY).strip()


def ask(question: str, model: str = LLM_MODEL) -> AskResult:
    client = _client()
    messages: list[dict] = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    result = AskResult(answer="", model=model)
    start = time.monotonic()

    for step in range(MAX_STEPS + 1):
        last = step == MAX_STEPS
        res = client.chat.completions.create(
            model=model,
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
