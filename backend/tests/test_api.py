import httpx
import pytest
from fastapi.testclient import TestClient
from openai import RateLimitError

from votoclaro_rag import api
from votoclaro_rag.agent import AskResult


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(api, "ask", lambda q: AskResult(answer=f"resposta a: {q}", tool_calls=[{"name": "find_votes", "arguments": {}}], seconds=0.5))
    api._hits.clear()
    return TestClient(api.app)


def test_ask_ok(client):
    r = client.post("/ask", json={"pergunta": "Como votou o PS?"})
    assert r.status_code == 200
    body = r.json()
    assert body["resposta"] == "resposta a: Como votou o PS?"
    assert body["ferramentas"][0]["name"] == "find_votes"


@pytest.mark.parametrize("payload", [{}, {"pergunta": ""}, {"pergunta": "oi"}, {"pergunta": "x" * 501}, {"question": "wrong field"}])
def test_ask_validates_input(client, payload):
    assert client.post("/ask", json=payload).status_code == 422


def test_rate_limit_from_provider_maps_to_429(client, monkeypatch):
    def boom(q):
        raise RateLimitError("limit", response=httpx.Response(429, request=httpx.Request("POST", "http://x")), body=None)

    monkeypatch.setattr(api, "ask", boom)
    r = client.post("/ask", json={"pergunta": "pergunta válida"})
    assert r.status_code == 429


def test_per_client_rate_limit(client, monkeypatch):
    monkeypatch.setattr(api, "RATE_LIMIT", 3)
    codes = [client.post("/ask", json={"pergunta": "pergunta válida"}).status_code for _ in range(5)]
    assert codes == [200, 200, 200, 429, 429]


def test_unexpected_errors_do_not_leak_details(client, monkeypatch):
    def boom(q):
        raise RuntimeError("secret internal path /home/x/.env")

    monkeypatch.setattr(api, "ask", boom)
    r = TestClient(api.app, raise_server_exceptions=False).post("/ask", json={"pergunta": "pergunta válida"})
    assert r.status_code == 500 and "secret" not in r.text


def test_cors_allows_only_configured_origins(client):
    ok = client.options("/ask", headers={"Origin": "https://project-diplomacy-votoclaro.vercel.app", "Access-Control-Request-Method": "POST"})
    bad = client.options("/ask", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == "https://project-diplomacy-votoclaro.vercel.app"
    assert "access-control-allow-origin" not in bad.headers


def test_health(client):
    assert client.get("/health").json() == {"ok": True}
