"""Turn the citations in an answer into links to what they cite.

The model cites in plain text: [Projeto de Lei n.º 672, Artigo 2.º] or
[Projeto de Resolução n.º 1239, votação de 2026-10-21]. For each one we find
the initiative and, when the citation names it, the article/section (with its
text, so the app can show the exact passage) or the vote (so the app can open
that vote's screen). Anything we can't resolve is simply left out: the app
then shows the citation as plain text, as before.
"""

import re
import sqlite3

from votoclaro_rag.db import connect
from votoclaro_rag.text import chunk

# Same pattern the app uses to find citations (votoclaro/lib/perguntar.ts).
CITACAO = re.compile(r"\[((?:Projeto|Proposta) de (?:Lei|Resolução)[^\]]*n\.º\s*\d+[^\]]*)\]")
_REF = re.compile(r"((?:Projeto|Proposta) de (?:Lei|Resolução))\s+n\.º\s*(\d+)\s*,?\s*(.*)", re.DOTALL)
_ARTIGO = re.compile(r"Artigo\s+(\d+)\.?\s*[ºo°]?(-[A-Z])?", re.IGNORECASE)
_DATA = re.compile(r"\d{4}-\d{2}-\d{2}")
_VOTO = re.compile(r"vota[çc][ãa]o|generalidade|especialidade|final global", re.IGNORECASE)
_SECOES = ("Exposição de motivos", "Nota justificativa", "Preâmbulo")

MAX_EXCERTO = 2500
MAX_FONTES = 12
PAGINA_INICIATIVA = "https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID={}"
_DOC_HOST = "https://app.parlamento.pt/"


def _secao_pedida(resto: str) -> str | None:
    m = _ARTIGO.search(resto)
    if m:
        return f"Artigo {m.group(1)}.º{(m.group(2) or '').upper()}"
    for s in _SECOES:
        if s.lower() in resto.lower():
            return s
    return None


def _excerto(texto: str | None, secao: str) -> str | None:
    if not texto:
        return None
    # One chunk per section (no splitting), then the first section with that name.
    for c in chunk(texto, max_chars=10**9, overlap=0):
        if c.secao.lower() == secao.lower():
            t = c.texto.strip()
            return t if len(t) <= MAX_EXCERTO else t[:MAX_EXCERTO].rsplit(" ", 1)[0] + " …"
    return None


def _votacao(conn: sqlite3.Connection, iniciativa_id: int, resto: str) -> int | None:
    votos = conn.execute(
        "SELECT id, data, descricao FROM votacoes WHERE iniciativa_id = ? ORDER BY data, id", (iniciativa_id,)
    ).fetchall()
    if not votos:
        return None
    data = _DATA.search(resto)
    if data:
        do_dia = [v for v in votos if v["data"] == data.group(0)]
        if do_dia:
            # Several votes on the same day: the last is usually the final one.
            return do_dia[-1]["id"]
    if "final global" in resto.lower():
        finais = [v for v in votos if (v["descricao"] or "").lower().startswith("texto final")]
        if finais:
            return finais[-1]["id"]
    return votos[-1]["id"]


def _documento(link: str | None) -> str | None:
    if not link:
        return None
    link = link.replace("http://", "https://", 1)
    return link if link.startswith(_DOC_HOST) else None


def _resolver(conn: sqlite3.Connection, citacao: str) -> dict | None:
    m = _REF.match(citacao)
    if not m:
        return None
    tipo, numero, resto = m.group(1), m.group(2), m.group(3)
    # The same number can exist in an older legislature: prefer the newest id.
    ini = conn.execute(
        "SELECT * FROM iniciativas WHERE tipo_desc = ? COLLATE NOCASE AND numero = ? ORDER BY id DESC LIMIT 1",
        (tipo, numero),
    ).fetchone()
    if ini is None:
        return None
    secao = _secao_pedida(resto)
    fala_de_voto = bool(_VOTO.search(resto) or _DATA.search(resto))
    return {
        "citacao": citacao,
        "iniciativa_id": ini["id"],
        "referencia": f"{ini['tipo_desc']} n.º {ini['numero']}",
        "titulo": ini["titulo"],
        "secao": secao,
        "excerto": _excerto(ini["texto"], secao) if secao else None,
        "votacao_id": _votacao(conn, ini["id"], resto) if fala_de_voto else None,
        "url_documento": _documento(ini["link_texto"]),
        "url_iniciativa": PAGINA_INICIATIVA.format(ini["id"]),
    }


def resolver_fontes(resposta: str) -> list[dict]:
    """One entry per distinct citation in the answer, in order of appearance."""
    citacoes = list(dict.fromkeys(m.group(1).strip() for m in CITACAO.finditer(resposta)))[:MAX_FONTES]
    if not citacoes:
        return []
    conn = connect()
    return [f for f in (_resolver(conn, c) for c in citacoes) if f]
