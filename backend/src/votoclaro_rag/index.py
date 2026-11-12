"""Chunk every downloaded bill text and index it for keyword and vector search."""

import logging

from votoclaro_rag.db import connect
from votoclaro_rag.embed import embed
from votoclaro_rag.text import chunk

log = logging.getLogger(__name__)


def header(row) -> str:
    """Prepended to every chunk before embedding, so a passage like
    "Artigo 2.º ... passa a ter a seguinte redação" still carries which bill
    it belongs to (a "contextual chunk header")."""
    return f"{row['tipo_desc']} n.º {row['numero']}: {row['titulo']}"


def build_index() -> int:
    """Index bills that have text but no chunks yet. Returns chunks added."""
    conn = connect()
    rows = conn.execute(
        """SELECT * FROM iniciativas
           WHERE texto IS NOT NULL AND id NOT IN (SELECT DISTINCT iniciativa_id FROM chunks)"""
    ).fetchall()

    added = 0
    for row in rows:
        pieces = chunk(row["texto"])
        if not pieces:
            continue
        head = header(row)
        vectors = embed([f"{head}\n{c.secao}\n{c.texto}" for c in pieces])
        with conn:
            for c, vec in zip(pieces, vectors):
                cur = conn.execute(
                    "INSERT INTO chunks (iniciativa_id, seq, secao, texto) VALUES (?, ?, ?, ?)",
                    (row["id"], c.seq, c.secao, c.texto),
                )
                cid = cur.lastrowid
                # The keyword index also gets the header, so a search for the
                # bill's subject matches its articles too.
                conn.execute("INSERT INTO chunks_fts (rowid, texto) VALUES (?, ?)", (cid, f"{head}\n{c.texto}"))
                conn.execute("INSERT INTO chunks_vec (rowid, embedding) VALUES (?, ?)", (cid, vec.tobytes()))
        added += len(pieces)
    log.info("%d iniciativas, %d chunks indexados", len(rows), added)
    return added
