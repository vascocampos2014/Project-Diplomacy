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
    api._day.update(date="", count=0)
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


def test_daily_cap_for_the_whole_server(client, monkeypatch):
    monkeypatch.setattr(api, "DAILY_LIMIT", 2)
    monkeypatch.setattr(api, "RATE_LIMIT", 100)
    codes = [client.post("/ask", json={"pergunta": "pergunta válida"}).status_code for _ in range(3)]
    assert codes == [200, 200, 429]
    assert "diário" in client.post("/ask", json={"pergunta": "pergunta válida"}).json()["detail"]


def test_daily_cap_resets_on_a_new_day(client, monkeypatch):
    monkeypatch.setattr(api, "DAILY_LIMIT", 1)
    api._day.update(date="2000-01-01", count=999)
    assert client.post("/ask", json={"pergunta": "pergunta válida"}).status_code == 200


def _req(xff=None, host="10.0.0.1"):
    from starlette.requests import Request

    headers = [(b"x-forwarded-for", xff.encode())] if xff else []
    return Request({"type": "http", "headers": headers, "client": (host, 1234)})


def test_client_ip_ignores_forwarded_header_by_default(monkeypatch):
    monkeypatch.setattr(api, "TRUSTED_PROXY_HOPS", 0)
    assert api.client_ip(_req("1.2.3.4")) == "10.0.0.1"


def test_client_ip_behind_one_proxy_uses_the_entry_it_added(monkeypatch):
    monkeypatch.setattr(api, "TRUSTED_PROXY_HOPS", 1)
    # A client faking "9.9.9.9" can't hide: the proxy appends the real address.
    assert api.client_ip(_req("9.9.9.9, 5.6.7.8")) == "5.6.7.8"
    assert api.client_ip(_req("5.6.7.8")) == "5.6.7.8"
    assert api.client_ip(_req(None)) == "10.0.0.1"


def test_production_hides_the_docs(monkeypatch):
    import importlib

    from fastapi.testclient import TestClient

    monkeypatch.setenv("VOTOCLARO_ENV", "production")
    monkeypatch.setenv("WARMUP", "0")
    try:
        prod = importlib.reload(api)
        c = TestClient(prod.app)
        assert c.get("/docs").status_code == 404
        assert c.get("/openapi.json").status_code == 404
        assert c.get("/health").json() == {"ok": True}
    finally:
        monkeypatch.undo()
        importlib.reload(api)


def test_cors_allows_production_and_vercel_previews_only(client):
    def origin_ok(origin):
        r = client.options("/ask", headers={"Origin": origin, "Access-Control-Request-Method": "POST"})
        return r.headers.get("access-control-allow-origin") == origin

    assert origin_ok("https://project-diplomacy-votoclaro.vercel.app")
    assert origin_ok("https://project-diplomacy-votoclaro-git-preview-ui-overhaul-vasco-1298.vercel.app")
    assert not origin_ok("https://evil.example")
    assert not origin_ok("https://project-diplomacy-votoclaro-x.vercel.app.evil.example")


def test_errors_are_short_and_never_echo_the_request(client):
    r = client.post("/ask", json={"pergunta": "x" * 1000})
    assert r.status_code == 422
    assert r.json() == {"detail": "A pergunta tem de ter entre 3 e 500 caracteres."}
    for bad in (b'{"pergunta": ', b'{"q": "abc"}', b'{"pergunta": 123}', b"pergunta=abc"):
        r = client.post("/ask", content=bad, headers={"Content-Type": "application/json"})
        assert r.status_code == 422 and "input" not in r.text


def test_oversized_body_is_refused_before_reading(client):
    r = client.post("/ask", content=b'{"pergunta": "' + b"x" * 10_000 + b'"}', headers={"Content-Type": "application/json"})
    assert r.status_code == 413
    assert len(r.content) < 100


def test_ipv6_visitors_are_limited_per_64_block(monkeypatch):
    assert api.limit_key("2001:db8:1:2:aaaa::1") == api.limit_key("2001:db8:1:2:ffff:1:2:3") == "2001:db8:1:2::/64"
    assert api.limit_key("2001:db8:1:3::1") != api.limit_key("2001:db8:1:2::1")
    assert api.limit_key("::ffff:1.2.3.4") == "1.2.3.4"
    assert api.limit_key("5.6.7.8") == "5.6.7.8" and api.limit_key("unknown") == "unknown"
    monkeypatch.setattr(api, "RATE_LIMIT", 3)
    api._hits.clear()
    # Rotating addresses inside one /64 does not reset the limit.
    assert [api._allow(f"2001:db8:9:9::{i:x}") for i in range(1, 6)] == [True, True, True, False, False]


def test_limiter_forgets_idle_clients(monkeypatch):
    monkeypatch.setattr(api, "MAX_TRACKED_CLIENTS", 100)
    api._hits.clear()
    for i in range(150):
        api._hits[f"10.0.{i // 256}.{i % 256}"]  # idle entries, as left by past visitors
    api._allow("1.1.1.1")
    assert len(api._hits) <= 2


def test_provider_connection_failure_is_a_clean_502(client, monkeypatch):
    from openai import APIConnectionError

    def boom(q):
        raise APIConnectionError(request=httpx.Request("POST", "http://x"))

    monkeypatch.setattr(api, "ask", boom)
    r = client.post("/ask", json={"pergunta": "pergunta válida"})
    assert r.status_code == 502 and "indisponível" in r.json()["detail"]


def test_unexpected_errors_do_not_leak_details(client, monkeypatch):
    def boom(q):
        raise RuntimeError("segredo interno /app/src/ficheiro.py")

    monkeypatch.setattr(api, "ask", boom)
    r = client.post("/ask", json={"pergunta": "pergunta válida"})
    assert r.status_code == 500 and "segredo" not in r.text
