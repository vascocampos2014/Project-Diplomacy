"""Hybrid retrieval: BM25 (exact words: law numbers, names, acronyms) plus
vector search (meaning: "rendas" ~ "arrendamento"), fused with Reciprocal Rank
Fusion. RRF only uses ranks, so the two very different score scales never need
to be calibrated against each other."""

import os
import re
from dataclasses import dataclass

from votoclaro_rag.db import connect
from votoclaro_rag.embed import embed

RRF_K = 60  # standard constant from the RRF paper; damps the weight of top ranks
# Keyword hits count less than semantic ones: on paraphrased questions BM25 adds
# noise from common words, but it still rescues exact terms (numbers, acronyms).
# Tuned with `votoclaro eval retrieval`.
KEYWORD_WEIGHT = float(os.getenv("KEYWORD_WEIGHT", "0.5"))


@dataclass
class Hit:
    chunk_id: int
    iniciativa_id: int
    referencia: str  # "Projeto de Lei n.º 672"
    titulo: str
    secao: str
    texto: str
    score: float


def search(
    query: str, k: int = 6, candidates: int = 30, mode: str = "hybrid", max_per_bill: int | None = None
) -> list[Hit]:
    """max_per_bill caps passages from one bill, so a question touching several
    bills ("which parties proposed cutting VAT on gas?") sees all of them
    instead of five passages of the best-matching one."""
    conn = connect()
    ranked: list[tuple[float, list[int]]] = []
    if mode in ("hybrid", "vector"):
        ranked.append((1.0, _vector(conn, query, candidates)))
    if mode in ("hybrid", "keyword"):
        ranked.append((KEYWORD_WEIGHT if mode == "hybrid" else 1.0, _keyword(conn, query, candidates)))

    scores: dict[int, float] = {}
    for weight, ids in ranked:
        for rank, cid in enumerate(ids):
            scores[cid] = scores.get(cid, 0.0) + weight / (RRF_K + rank + 1)

    ordered = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    if not ordered:
        return []
    bill_of = dict(
        conn.execute(
            f"SELECT id, iniciativa_id FROM chunks WHERE id IN ({','.join('?' * len(ordered))})",
            [cid for cid, _ in ordered],
        ).fetchall()
    )
    top: list[tuple[int, float]] = []
    per_bill: dict[int, int] = {}
    for cid, score in ordered:
        bill = bill_of[cid]
        if max_per_bill and per_bill.get(bill, 0) >= max_per_bill:
            continue
        per_bill[bill] = per_bill.get(bill, 0) + 1
        top.append((cid, score))
        if len(top) == k:
            break
    rows = {
        r["id"]: r
        for r in conn.execute(
            f"""SELECT c.id, c.iniciativa_id, c.secao, c.texto, i.tipo_desc, i.numero, i.titulo
                FROM chunks c JOIN iniciativas i ON i.id = c.iniciativa_id
                WHERE c.id IN ({",".join("?" * len(top))})""",
            [cid for cid, _ in top],
        )
    }
    return [
        Hit(
            chunk_id=cid,
            iniciativa_id=rows[cid]["iniciativa_id"],
            referencia=f"{rows[cid]['tipo_desc']} n.º {rows[cid]['numero']}",
            titulo=rows[cid]["titulo"],
            secao=rows[cid]["secao"],
            texto=rows[cid]["texto"],
            score=score,
        )
        for cid, score in top
    ]


def _vector(conn, query: str, n: int) -> list[int]:
    vec = embed([query])[0]
    rows = conn.execute(
        "SELECT rowid FROM chunks_vec WHERE embedding MATCH ? AND k = ? ORDER BY distance", (vec.tobytes(), n)
    )
    return [r["rowid"] for r in rows]


def _keyword(conn, query: str, n: int) -> list[int]:
    # Quote every term so user input can't break FTS5 syntax; OR them so a
    # passage doesn't need every word. BM25 ranks passages matching more terms higher.
    terms = [t for t in re.findall(r"\w+", query) if len(t) > 2]
    if not terms:
        return []
    match = " OR ".join(f'"{t}"' for t in terms)
    rows = conn.execute(
        "SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY bm25(chunks_fts) LIMIT ?", (match, n)
    )
    return [r["rowid"] for r in rows]
