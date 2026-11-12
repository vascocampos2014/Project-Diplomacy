"""SQLite storage: structured data (initiatives, votes) next to the text index.

One file holds everything:
  iniciativas / votacoes  structured data, answered with SQL (exact counts, who voted how)
  chunks                  bill text split into passages
  chunks_fts              FTS5 keyword index over chunks (BM25)
  chunks_vec              sqlite-vec vector index over chunks (semantic search)
"""

import sqlite3

import sqlite_vec

from votoclaro_rag.config import DATA_DIR, DB_PATH, EMBED_DIM

SCHEMA = f"""
CREATE TABLE IF NOT EXISTS iniciativas (
    id           INTEGER PRIMARY KEY,
    tipo         TEXT NOT NULL,      -- J, P, R, D, S
    tipo_desc    TEXT,
    numero       TEXT NOT NULL,
    titulo       TEXT NOT NULL,
    estado       TEXT,
    data_entrada TEXT,
    link_texto   TEXT,
    texto        TEXT,               -- full extracted text, NULL until downloaded
    texto_erro   TEXT                -- why the text could not be fetched, if it failed
);

CREATE TABLE IF NOT EXISTS votacoes (
    id            INTEGER PRIMARY KEY,
    iniciativa_id INTEGER NOT NULL,
    data          TEXT,
    resultado     TEXT NOT NULL,     -- Aprovado | Rejeitado
    unanime       INTEGER NOT NULL,
    descricao     TEXT,
    a_favor       TEXT NOT NULL,     -- JSON array of party codes
    contra        TEXT NOT NULL,
    abstencao     TEXT NOT NULL,
    ausencias     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS votacoes_iniciativa ON votacoes(iniciativa_id);
CREATE INDEX IF NOT EXISTS votacoes_data ON votacoes(data);

CREATE TABLE IF NOT EXISTS chunks (
    id            INTEGER PRIMARY KEY,
    iniciativa_id INTEGER NOT NULL,
    seq           INTEGER NOT NULL,  -- position within the bill
    secao         TEXT,              -- "Exposição de motivos", "Artigo 2.º", ...
    texto         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS chunks_iniciativa ON chunks(iniciativa_id);

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    texto, content='chunks', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(
    embedding float[{EMBED_DIM}] distance_metric=cosine
);
"""


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)
    conn.executescript(SCHEMA)
    return conn
