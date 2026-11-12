import json

import httpx
import pytest

from votoclaro_rag import ingest, openar
from votoclaro_rag.index import build_index


def _vote(i, ini, titulo="Título de teste", **kw):
    return {
        "id": str(i), "iniciativaId": ini, "iniciativaTitulo": titulo, "iniciativaNumero": str(ini), "iniciativaTipo": "J",
        "data": "2026-10-01", "resultado": "Aprovado", "unanime": False, "descricao": None,
        "aFavor": ["PS"], "contra": ["CH"], "abstencao": [], "ausencias": [], **kw,
    }


class FakeAPI:
    def __init__(self, votes, metas, pdfs):
        self._votes, self._metas, self._pdfs = votes, metas, pdfs

    def votacoes(self):
        yield from self._votes

    def iniciativa(self, iid):
        return self._metas[iid]

    def download(self, url):
        return self._pdfs[url]


def test_sync_votes_stores_votes_and_initiatives(tmp_db):
    api = FakeAPI([_vote(1, 100), _vote(2, 100), _vote(3, 200)], {}, {})
    assert ingest.sync_votes(api) == 3
    assert tmp_db.execute("SELECT COUNT(*) FROM votacoes").fetchone()[0] == 3
    row = tmp_db.execute("SELECT * FROM iniciativas WHERE id = 100").fetchone()
    assert row["tipo_desc"] == "Projeto de Lei"
    assert json.loads(tmp_db.execute("SELECT a_favor FROM votacoes WHERE id = 1").fetchone()[0]) == ["PS"]


def test_sync_votes_is_idempotent(tmp_db):
    api = FakeAPI([_vote(1, 100)], {}, {})
    ingest.sync_votes(api)
    ingest.sync_votes(api)
    assert tmp_db.execute("SELECT COUNT(*) FROM votacoes").fetchone()[0] == 1


def test_fetch_texts_records_success_and_failures(tmp_db, tmp_path, monkeypatch):
    monkeypatch.setattr(ingest, "RAW_DIR", tmp_path / "raw")
    long_text = "Exposição de motivos\n" + "Texto da iniciativa. " * 30
    monkeypatch.setattr(ingest, "extract_pdf", lambda b: long_text if b == b"good" else "curto")
    api = FakeAPI(
        [_vote(1, 100), _vote(2, 200), _vote(3, 300)],
        {
            100: {"linkTexto": "http://x/100", "estado": "Aprovado", "dataEntrada": "2026-01-01"},
            200: {"linkTexto": None},
            300: {"linkTexto": "http://x/300"},
        },
        {"http://x/100": b"good", "http://x/300": b"bad"},
    )
    ingest.sync_votes(api)
    ok, failed = ingest.fetch_texts(api, limit=10)
    assert (ok, failed) == (1, 2)
    errors = dict(tmp_db.execute("SELECT id, texto_erro FROM iniciativas WHERE texto_erro IS NOT NULL").fetchall())
    assert "linkTexto" in errors[200] and "curto" in errors[300]
    assert (tmp_path / "raw" / "100.pdf").read_bytes() == b"good"
    # Failed ones are not retried on the next run; finished ones are skipped.
    assert ingest.fetch_texts(api, limit=10) == (0, 0)


def test_index_is_incremental(tmp_db):
    tmp_db.execute("INSERT INTO iniciativas (id, tipo, tipo_desc, numero, titulo, texto) VALUES (1, 'J', 'Projeto de Lei', '1', 'T', 'Artigo 1.º\nTexto.')")
    tmp_db.commit()
    assert build_index() == 1
    assert build_index() == 0
    assert tmp_db.execute("SELECT COUNT(*) FROM chunks_vec").fetchone()[0] == 1
    assert tmp_db.execute("SELECT COUNT(*) FROM chunks_fts").fetchone()[0] == 1


def _transport(handler):
    client = openar.OpenAR()
    client._http = httpx.Client(transport=httpx.MockTransport(handler), follow_redirects=True)
    return client


def test_openar_paginates(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    pages = []

    def handler(req):
        page = int(req.url.params["page"])
        pages.append(page)
        return httpx.Response(200, json={"data": [{"id": page}] * 2, "total": 5})

    assert len(list(_transport(handler).votacoes(page_size=2))) == 6
    assert pages == [1, 2, 3]


def test_openar_retries_after_429(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    monkeypatch.setattr(openar.time, "sleep", lambda s: None)
    calls = []

    def handler(req):
        calls.append(1)
        return httpx.Response(429, headers={"Retry-After": "0"}) if len(calls) < 3 else httpx.Response(200, json={"id": 1})

    assert _transport(handler).iniciativa(1) == {"id": 1}
    assert len(calls) == 3


def test_openar_download_upgrades_to_https(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    seen = []

    def handler(req):
        seen.append(req.url.scheme)
        return httpx.Response(200, content=b"%PDF")

    assert _transport(handler).download("http://app.parlamento.pt/doc.pdf") == b"%PDF"
    assert seen == ["https"]


def test_openar_raises_on_server_error(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    with pytest.raises(httpx.HTTPStatusError):
        _transport(lambda req: httpx.Response(500)).iniciativa(1)


def test_openar_download_refuses_other_hosts(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    client = _transport(lambda req: httpx.Response(200, content=b"x"))
    with pytest.raises(ValueError, match="fora de"):
        client.download("http://169.254.169.254/latest/meta-data")
    with pytest.raises(ValueError, match="fora de"):
        client.download("https://app.parlamento.pt.evil.example/doc.pdf")


def test_openar_download_follows_redirects_only_within_parliament(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    fetched = []

    def handler(req):
        fetched.append(str(req.url))
        if req.url.path == "/old.pdf":
            return httpx.Response(302, headers={"Location": "https://www.parlamento.pt/new.pdf"})
        if req.url.path == "/evil.pdf":
            return httpx.Response(302, headers={"Location": "https://attacker.example/steal"})
        if req.url.path == "/to-http.pdf":
            return httpx.Response(302, headers={"Location": "http://app.parlamento.pt/x.pdf"})
        return httpx.Response(200, content=b"%PDF ok")

    client = _transport(handler)
    assert client.download("https://app.parlamento.pt/old.pdf") == b"%PDF ok"
    with pytest.raises(ValueError, match="fora de"):
        client.download("https://app.parlamento.pt/evil.pdf")
    with pytest.raises(ValueError, match="fora de"):
        client.download("https://app.parlamento.pt/to-http.pdf")
    assert not any("attacker" in u for u in fetched)


def test_openar_download_stops_at_the_size_limit(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    monkeypatch.setattr(openar, "MAX_DOC_BYTES", 1000)
    big = _transport(lambda req: httpx.Response(200, content=b"x" * 5000))
    with pytest.raises(ValueError, match="demasiado grande"):
        big.download("https://app.parlamento.pt/big.pdf")


def test_openar_download_refuses_redirect_loops(monkeypatch):
    monkeypatch.setattr(openar, "_MIN_INTERVAL", 0)
    loop = _transport(lambda req: httpx.Response(302, headers={"Location": "https://app.parlamento.pt/loop.pdf"}))
    with pytest.raises(ValueError, match="redirecionamentos"):
        loop.download("https://app.parlamento.pt/loop.pdf")
