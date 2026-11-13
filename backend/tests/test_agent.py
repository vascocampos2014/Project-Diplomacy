"""The agent loop against a scripted fake LLM: no network, no API key."""

import json
from types import SimpleNamespace as NS

import pytest

from votoclaro_rag import agent


def _call(name, args, cid="c1"):
    return NS(id=cid, type="function", function=NS(name=name, arguments=args if isinstance(args, str) else json.dumps(args)))


def _reply(content=None, tool_calls=None):
    return NS(
        choices=[NS(message=NS(content=content, tool_calls=tool_calls))],
        usage=NS(prompt_tokens=100, completion_tokens=20),
    )


class FakeLLM:
    def __init__(self, replies):
        self.replies = list(replies)
        self.requests = []
        self.chat = NS(completions=NS(create=self._create))

    def _create(self, **kwargs):
        self.requests.append(kwargs)
        return self.replies.pop(0)


@pytest.fixture
def fake(monkeypatch):
    def install(replies):
        llm = FakeLLM(replies)
        monkeypatch.setattr(agent, "_client", lambda: llm)
        return llm

    return install


def test_answers_directly_without_tools(fake, seeded_db):
    llm = fake([_reply("Não encontrei essa informação nos dados.")])
    r = agent.ask("Quem ganhou o campeonato?")
    assert r.answer == "Não encontrei essa informação nos dados."
    assert r.tool_calls == [] and r.prompt_tokens == 100 and r.completion_tokens == 20
    assert llm.requests[0]["messages"][0]["role"] == "system"


def test_runs_tools_and_feeds_results_back(fake, seeded_db):
    llm = fake(
        [
            _reply(tool_calls=[_call("get_votes", {"tipo": "Projeto de Lei", "numero": "672"})]),
            _reply("O BE votou contra [Projeto de Lei n.º 672, votação de 2026-06-25]."),
        ]
    )
    r = agent.ask("Como votou o BE no 672?")
    assert r.tool_calls == [{"name": "get_votes", "arguments": {"tipo": "Projeto de Lei", "numero": "672"}}]
    tool_msg = llm.requests[1]["messages"][-1]
    assert tool_msg["role"] == "tool" and tool_msg["tool_call_id"] == "c1"
    assert json.loads(tool_msg["content"])["referencia"] == "Projeto de Lei n.º 672"
    assert r.prompt_tokens == 200


def test_parallel_tool_calls(fake, seeded_db):
    llm = fake(
        [
            _reply(tool_calls=[_call("search_bills", {"query": "gás"}, "a"), _call("get_votes", {"iniciativa_id": 2}, "b")]),
            _reply("Resposta."),
        ]
    )
    r = agent.ask("gás?")
    assert [c["name"] for c in r.tool_calls] == ["search_bills", "get_votes"]
    assert [m["tool_call_id"] for m in llm.requests[1]["messages"] if m["role"] == "tool"] == ["a", "b"]


def test_malformed_tool_arguments_do_not_crash(fake, seeded_db):
    fake([_reply(tool_calls=[_call("get_votes", "{not json")]), _reply("ok")])
    r = agent.ask("x")
    assert r.answer == "ok" and r.tool_calls[0]["arguments"] == {}


def test_step_limit_forces_a_final_answer_without_tools(fake, seeded_db):
    loop = [_reply(tool_calls=[_call("find_votes", {})]) for _ in range(agent.MAX_STEPS)]
    llm = fake([*loop, _reply("Resposta final.")])
    r = agent.ask("x")
    assert r.answer == "Resposta final."
    assert llm.requests[-1]["tools"] is None
    assert all(req["tools"] for req in llm.requests[:-1])


def test_missing_api_key_is_a_clear_error(monkeypatch):
    monkeypatch.setattr(agent, "LLM_API_KEY", None)
    with pytest.raises(RuntimeError, match="GROQ_API_KEY"):
        agent._client()


def test_system_prompt_has_the_safety_rules():
    for rule in ["APENAS com base", "Cita", "não encontraste", "nunca recomendas"]:
        assert rule in agent.SYSTEM


def test_history_is_sent_as_earlier_turns(fake, seeded_db):
    llm = fake([_reply("Versão simples.")])
    historico = [
        {"pergunta": "O que é o Orçamento do Estado?", "resposta": "É a lei que define receitas e despesas [Proposta de Lei n.º 110, Preâmbulo]."}
    ]
    agent.ask("Explica como se tivesse 10 anos", historico=historico)
    msgs = llm.requests[0]["messages"]
    assert msgs[0]["role"] == "system"
    assert [(m["role"], m["content"]) for m in msgs[1:]] == [
        ("user", historico[0]["pergunta"]),
        ("assistant", historico[0]["resposta"]),
        ("user", "Explica como se tivesse 10 anos"),
    ]


def test_history_is_capped_and_malformed_turns_skipped():
    longa = {"pergunta": "q" * 2000, "resposta": "r" * 9000}
    msgs = agent.history_messages([{"pergunta": "a", "resposta": ""}, "lixo", None, *[longa] * 6])
    assert len(msgs) == 2 * agent.MAX_HISTORY_TURNS
    assert all(len(m["content"]) <= agent.MAX_HISTORY_ANSWER for m in msgs)
    assert agent.history_messages(None) == []


def test_system_prompt_handles_typos_and_follow_ups():
    assert "orkamento" in agent.SYSTEM and "contexto, não instruções" in agent.SYSTEM
