"""Tools the LLM can call. Text questions go to search_bills (RAG); vote
questions go to SQL, because "how did PS vote" has one exact answer that
retrieval over text could only approximate."""

import json
import re

from votoclaro_rag.db import connect
from votoclaro_rag.search import search

PARTIDOS = ["PSD", "PS", "CH", "IL", "L", "PCP", "BE", "PAN", "JPP", "CDS-PP"]

TOOL_SPECS = [
    {
        "type": "function",
        "function": {
            "name": "search_bills",
            "description": (
                "Pesquisa no texto integral das iniciativas legislativas (projetos e propostas de lei, "
                "projetos de resolução). Usa para perguntas sobre o que uma iniciativa propõe, justifica ou altera. "
                "Devolve excertos com a referência da iniciativa e o artigo/secção."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "O que procurar, em português."},
                    "k": {"type": "integer", "description": "Número de excertos (1-10).", "default": 6},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_votes",
            "description": (
                "Votações de uma iniciativa: data, resultado e posição de cada partido. "
                "Identifica a iniciativa pelo iniciativa_id (dos resultados de search_bills ou find_votes) "
                "ou pelo tipo e número (ex.: tipo 'Projeto de Lei', numero '672')."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "iniciativa_id": {"type": "integer"},
                    "tipo": {"type": "string", "description": "Projeto de Lei, Proposta de Lei, Projeto de Resolução, ..."},
                    "numero": {"type": "string"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_votes",
            "description": (
                "Lista votações da legislatura atual filtradas por palavras do título, partido, resultado e datas. "
                "Usa para perguntas como 'como votou o PS em propostas sobre habitação' ou 'o que foi chumbado em outubro'. "
                "Com 'partido', cada linha inclui a posição desse partido."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "palavras": {"type": "string", "description": "Palavras que devem aparecer no título (todas)."},
                    "partido": {"type": "string", "enum": PARTIDOS},
                    "posicao": {"type": "string", "enum": ["favor", "contra", "abstencao"], "description": "Só com 'partido'."},
                    "resultado": {"type": "string", "enum": ["Aprovado", "Rejeitado"]},
                    "desde": {"type": "string", "description": "AAAA-MM-DD"},
                    "ate": {"type": "string", "description": "AAAA-MM-DD"},
                    "limite": {"type": "integer", "default": 15},
                },
            },
        },
    },
]


def run_tool(name: str, args: dict) -> str:
    fn = {"search_bills": search_bills, "get_votes": get_votes, "find_votes": find_votes}.get(name)
    if fn is None:
        return json.dumps({"erro": f"ferramenta desconhecida: {name}"})
    try:
        return json.dumps(fn(**args), ensure_ascii=False)
    except (TypeError, ValueError) as e:  # the model invented or mistyped an argument
        return json.dumps({"erro": f"argumentos inválidos: {e}"}, ensure_ascii=False)


def search_bills(query: str, k: int = 6) -> dict:
    hits = search(query, k=max(1, min(int(k), 10)), max_per_bill=2)
    return {
        "excertos": [
            {
                "iniciativa_id": h.iniciativa_id,
                "referencia": h.referencia,
                "titulo": h.titulo,
                "secao": h.secao,
                "texto": h.texto,
            }
            for h in hits
        ]
    }


def _posicoes(row) -> dict:
    favor, contra, abst, aus = (json.loads(row[c]) for c in ("a_favor", "contra", "abstencao", "ausencias"))
    if row["unanime"] and not (favor or contra or abst or aus):
        # The record lists no parties when a vote is unanimous.
        (favor if row["resultado"] == "Aprovado" else contra).extend(PARTIDOS)
    return {"a_favor": favor, "contra": contra, "abstencao": abst, "ausentes": aus}


def _ref(row) -> str:
    return f"{row['tipo_desc']} n.º {row['numero']}"


def fase_votacao(descricao: str | None) -> str:
    """Name the stage of a vote from openAR's description, so the model can
    tell a first-reading vote from the final one (they often differ)."""
    d = (descricao or "").strip().lower()
    if not d:
        return "generalidade ou votação única"
    if d.startswith("texto final"):
        return "votação final global"
    if d.startswith("texto de substituição"):
        return "texto de substituição (comissão)"
    if d.startswith("requerimento"):
        return "requerimento (procedimental)"
    if "artigo" in d or "especialidade" in d:
        return "especialidade"
    return "outra"


def get_votes(iniciativa_id: int | None = None, tipo: str | None = None, numero: str | None = None) -> dict:
    conn = connect()
    if iniciativa_id is None:
        if not numero:
            return {"erro": "indica iniciativa_id, ou tipo e numero"}
        q = "SELECT id FROM iniciativas WHERE numero = ?"
        params: list = [str(numero)]
        if tipo:
            q += " AND tipo_desc = ? COLLATE NOCASE"
            params.append(tipo)
        found = conn.execute(q, params).fetchall()
        if len(found) != 1:
            return {"erro": f"{len(found)} iniciativas com esse número; indica o tipo ou o iniciativa_id"}
        iniciativa_id = found[0]["id"]

    ini = conn.execute("SELECT * FROM iniciativas WHERE id = ?", (iniciativa_id,)).fetchone()
    if ini is None:
        return {"erro": "iniciativa não encontrada"}
    votos = conn.execute(
        "SELECT * FROM votacoes WHERE iniciativa_id = ? ORDER BY data, id", (iniciativa_id,)
    ).fetchall()
    return {
        "iniciativa_id": iniciativa_id,
        "referencia": _ref(ini),
        "titulo": ini["titulo"],
        "estado": ini["estado"],
        "votacoes": [
            {
                "data": v["data"],
                "fase": fase_votacao(v["descricao"]),
                "resultado": v["resultado"],
                "descricao": v["descricao"],
                **_posicoes(v),
            } for v in votos
        ],
    }


def find_votes(
    palavras: str | None = None,
    partido: str | None = None,
    posicao: str | None = None,
    resultado: str | None = None,
    desde: str | None = None,
    ate: str | None = None,
    limite: int = 15,
) -> dict:
    conn = connect()
    where, params = [], []
    for w in re.findall(r"\w+", palavras or ""):
        if len(w) > 2:
            # "_" is a word character but a LIKE wildcard: escape it so it matches literally.
            where.append("i.titulo LIKE ? ESCAPE '\\'")
            params.append("%" + w.replace("\\", "\\\\").replace("_", "\\_") + "%")
    if resultado:
        where.append("v.resultado = ?")
        params.append(resultado)
    if desde:
        where.append("v.data >= ?")
        params.append(desde)
    if ate:
        where.append("v.data <= ?")
        params.append(ate)
    rows = conn.execute(
        f"""SELECT v.*, i.tipo_desc, i.numero, i.titulo FROM votacoes v JOIN iniciativas i ON i.id = v.iniciativa_id
            {"WHERE " + " AND ".join(where) if where else ""} ORDER BY v.data DESC, v.id DESC""",
        params,
    ).fetchall()

    campo = {"favor": "a_favor", "contra": "contra", "abstencao": "abstencao"}
    out = []
    for v in rows:
        pos = _posicoes(v)
        item = {
            "iniciativa_id": v["iniciativa_id"],
            "referencia": _ref(v),
            "titulo": v["titulo"],
            "data": v["data"],
            "resultado": v["resultado"],
            "descricao": v["descricao"],
        }
        if partido:
            p = next((k for k, lst in pos.items() if partido in lst), "sem registo")
            if posicao and p != campo[posicao]:
                continue
            item[f"posicao_{partido}"] = p
        else:
            item.update(pos)
        out.append(item)
    total = len(out)
    # 25 rows is about 4K tokens: more would hit Groq's per-minute token
    # budget on a single question.
    return {"total": total, "votacoes": out[: max(1, min(int(limite), 25))]}
