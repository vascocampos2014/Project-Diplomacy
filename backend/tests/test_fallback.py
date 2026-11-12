"""Model fallback: when a model hits its quota (or fails), the next one in
the chain answers, and exhausted models are skipped until they reset."""

import json
from types import SimpleNamespace as NS

import httpx
import pytest
from openai import BadRequestError, InternalServerError, RateLimitError

from votoclaro_rag import agent

CHAIN = ["big", "mid", "small"]


def _err(cls, status, headers=None, msg="erro"):
    req = httpx.Request("POST", "http://llm/chat/completions")
    return cls(msg, response=httpx.Response(status, request=req, headers=headers or {}), body=None)


def _reply(content=None, tool_calls=None):
    return NS(choices=[NS(message=NS(content=content, tool_calls=tool_calls))], usage=NS(prompt_tokens=10, completion_tokens=5))


def _tool(name, args):
    return NS(id="t1", type="function", function=NS(name=name, arguments=json.dumps(args)))


class ScriptedLLM:
    """Replies per model: each script item is a response or an exception."""

    def __init__(self, scripts):
        self.scripts = {m: list(s) for m, s in scripts.items()}
        self.calls: list[str] = []
        self.retries: list[int] = []
        self.chat = NS(completions=NS(create=self._create))

    def with_options(self, max_retries):
        self.retries.append(max_retries)
        return self

    def _create(self, model, **kwargs):
        self.calls.append(model)
        item = self.scripts[model].pop(0)
        if isinstance(item, Exception):
            raise item
        return item


@pytest.fixture
def llm(monkeypatch):
    agent._cooldown_until.clear()
    monkeypatch.setattr(agent, "LLM_MODELS", CHAIN)

    def install(scripts):
        fake = ScriptedLLM(scripts)
        monkeypatch.setattr(agent, "_client", lambda: fake)
        return fake

    yield install
    agent._cooldown_until.clear()


def test_uses_the_first_model_when_it_works(llm, seeded_db):
    fake = llm({"big": [_reply("ok")]})
    r = agent.ask("x")
    assert (r.answer, r.model, r.models_tried, fake.calls) == ("ok", "big", ["big"], ["big"])


def test_rate_limit_falls_back_to_the_next_model(llm, seeded_db):
    fake = llm({"big": [_err(RateLimitError, 429)], "mid": [_reply("do mid")]})
    r = agent.ask("x")
    assert r.answer == "do mid" and r.model == "mid"
    assert r.models_tried == ["big", "mid"] and fake.calls == ["big", "mid"]


def test_no_retries_while_a_fallback_is_left(llm, seeded_db):
    fake = llm({"big": [_err(RateLimitError, 429)], "mid": [_reply("ok")]})
    agent.ask("x")
    assert fake.retries == [0, 0]  # big, then mid (small still left)


def test_switches_mid_conversation_and_keeps_tool_results(llm, seeded_db):
    fake = llm(
        {
            "big": [_reply(tool_calls=[_tool("get_votes", {"iniciativa_id": 2})]), _err(RateLimitError, 429)],
            "mid": [_reply("Resposta com votos.")],
        }
    )
    r = agent.ask("Como votaram?")
    assert r.answer == "Resposta com votos." and r.model == "mid"
    assert r.tool_calls == [{"name": "get_votes", "arguments": {"iniciativa_id": 2}}]
    assert fake.calls == ["big", "big", "mid"]


def test_stays_on_the_working_model_for_the_rest_of_the_question(llm, seeded_db):
    fake = llm(
        {
            "big": [_err(InternalServerError, 503)],
            "mid": [_reply(tool_calls=[_tool("find_votes", {})]), _reply("fim")],
        }
    )
    agent.ask("x")
    assert fake.calls == ["big", "mid", "mid"]


def test_exhausted_model_is_skipped_by_the_next_question(llm, seeded_db):
    fake = llm({"big": [_err(RateLimitError, 429, {"retry-after": "120"})], "mid": [_reply("1"), _reply("2")]})
    agent.ask("primeira")
    r = agent.ask("segunda")
    assert r.models_tried == ["mid"] and fake.calls == ["big", "mid", "mid"]


def test_cooldown_expires(llm, seeded_db, monkeypatch):
    clock = [1000.0]
    monkeypatch.setattr(agent.time, "monotonic", lambda: clock[0])
    fake = llm({"big": [_err(RateLimitError, 429, {"retry-after": "30"}), _reply("voltou")], "mid": [_reply("1")]})
    agent.ask("a")
    clock[0] += 31
    assert agent.ask("b").model == "big"
    assert fake.calls == ["big", "mid", "big"]


def test_retry_after_is_bounded():
    assert agent._retry_after(_err(RateLimitError, 429, {"retry-after": "999999"})) == agent.MAX_COOLDOWN
    assert agent._retry_after(_err(RateLimitError, 429, {"retry-after": "soon"})) == agent.DEFAULT_COOLDOWN
    assert agent._retry_after(_err(RateLimitError, 429)) == agent.DEFAULT_COOLDOWN


def test_all_models_limited_raises_a_rate_limit_error(llm, seeded_db):
    fake = llm({m: [_err(RateLimitError, 429)] for m in CHAIN})
    with pytest.raises(RateLimitError) as e:
        agent.ask("x")
    assert isinstance(e.value, agent.AllModelsUnavailable)
    assert fake.calls == CHAIN and fake.retries == [0, 0, 2]  # retries only on the last one


def test_when_all_are_cooling_down_it_still_tries_the_last_model(llm, seeded_db):
    for m in CHAIN:
        agent._cool_down(m, 600)
    fake = llm({"small": [_reply("tentei")]})
    assert agent.ask("x").answer == "tentei" and fake.calls == ["small"]


def test_bad_request_from_us_is_not_retried_on_other_models(llm, seeded_db):
    fake = llm({"big": [_err(BadRequestError, 400, msg="context too long")]})
    with pytest.raises(BadRequestError):
        agent.ask("x")
    assert fake.calls == ["big"]


def test_malformed_tool_call_falls_back(llm, seeded_db):
    fake = llm({"big": [_err(BadRequestError, 400, msg="Error code: 400 - tool_use_failed")], "mid": [_reply("ok")]})
    assert agent.ask("x").model == "mid" and fake.calls == ["big", "mid"]


def test_explicit_model_uses_only_that_model(llm, seeded_db):
    fake = llm({"mid": [_err(RateLimitError, 429)]})
    with pytest.raises(RateLimitError):
        agent.ask("x", model="mid")
    assert fake.calls == ["mid"]


def test_think_tags_are_removed():
    assert agent.tidy_answer("<think>\nraciocínio\n</think>\n\nO PS votou a favor.") == "O PS votou a favor."


def test_config_chain_has_no_duplicates(monkeypatch):
    import importlib

    from votoclaro_rag import config

    monkeypatch.setenv("LLM_MODEL", "a")
    monkeypatch.setenv("LLM_FALLBACK_MODELS", " b, a ,b,, c ")
    try:
        importlib.reload(config)
        assert config.LLM_MODELS == ["a", "b", "c"]
    finally:
        monkeypatch.undo()
        importlib.reload(config)


def test_request_too_large_for_one_model_falls_back_without_cooldown(llm, seeded_db):
    from openai import APIStatusError

    fake = llm({"big": [_err(APIStatusError, 413, msg="Request too large")], "mid": [_reply("ok")]})
    assert agent.ask("x").model == "mid" and fake.calls == ["big", "mid"]
    assert "big" not in agent._cooldown_until
