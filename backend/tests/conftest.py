"""Shared fixtures: a throwaway database and a fake embedder, so tests need
no GPU, no model download and no network."""

import hashlib
import json
import re

import numpy as np
import pytest

from votoclaro_rag import db as db_module
from votoclaro_rag.config import EMBED_DIM


def fake_embed(texts: list[str], batch_size: int = 16) -> np.ndarray:
    """Hashed bag of words: texts that share words get similar vectors, which
    is enough to exercise vector search deterministically."""
    out = np.zeros((len(texts), EMBED_DIM), dtype=np.float32)
    for i, t in enumerate(texts):
        for w in re.findall(r"\w+", t.lower()):
            if len(w) > 2:
                h = int(hashlib.md5(w.encode()).hexdigest(), 16)
                out[i, h % EMBED_DIM] += 1.0
        n = np.linalg.norm(out[i])
        out[i] = out[i] / n if n else out[i]
    return out


@pytest.fixture
def tmp_db(tmp_path, monkeypatch):
    monkeypatch.setattr(db_module, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db_module, "DB_PATH", tmp_path / "test.db")
    monkeypatch.setattr("votoclaro_rag.index.embed", fake_embed)
    monkeypatch.setattr("votoclaro_rag.search.embed", fake_embed)
    return db_module.connect()


BILLS = [
    # id, tipo, tipo_desc, numero, titulo, texto
    (
        1, "J", "Projeto de Lei", "672",
        "Aumenta a dedução à coleta de IRS a partir do terceiro filho",
        "Exposição de motivos\nA natalidade em Portugal é baixa e as famílias numerosas precisam de apoio fiscal.\n"
        "Artigo 1.º\nObjeto: altera o Código do IRS.\n"
        "Artigo 2.º\nO acréscimo à dedução passa a ser de 600 euros para o terceiro dependente.",
    ),
    (
        2, "J", "Projeto de Lei", "373",
        "Redução do IVA do gás engarrafado para a taxa mínima",
        "Exposição de motivos\nAs botijas de gás butano e propano são usadas por famílias com menos rendimentos.\n"
        "Artigo 1.º\nO IVA das garrafas de gás passa para a taxa reduzida de seis por cento.",
    ),
    (
        3, "R", "Projeto de Resolução", "259",
        "Recomenda a eliminação das portagens na A1 em Vila Franca de Xira",
        "Exposição de motivos\nOs moradores pagam portagens para circular dentro do próprio concelho.\n"
        "Recomenda ao Governo que elimine as portagens neste troço da autoestrada.",
    ),
]

VOTES = [
    # id, iniciativa, data, resultado, unanime, descricao, favor, contra, abstencao, ausencias
    (10, 1, "2026-06-25", "Aprovado", 0, None, ["PSD", "PS", "CH"], ["PCP", "BE"], ["L"], []),
    (11, 1, "2026-10-28", "Aprovado", 0, "Texto final, apresentado pela Comissão", ["PSD", "PS", "CH", "BE"], ["PCP"], ["L"], []),
    (12, 2, "2026-04-01", "Aprovado", 1, None, [], [], [], []),
    (13, 3, "2026-10-09", "Rejeitado", 0, None, ["CH", "BE", "JPP"], ["PSD", "PS", "IL"], ["L", "PCP"], []),
]


@pytest.fixture
def seeded_db(tmp_db):
    """Database with three bills (text indexed) and their votes."""
    from votoclaro_rag.index import build_index

    with tmp_db:
        tmp_db.executemany(
            "INSERT INTO iniciativas (id, tipo, tipo_desc, numero, titulo, texto) VALUES (?, ?, ?, ?, ?, ?)", BILLS
        )
        tmp_db.executemany(
            """INSERT INTO votacoes (id, iniciativa_id, data, resultado, unanime, descricao, a_favor, contra, abstencao, ausencias)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            [(*v[:6], *(json.dumps(x) for x in v[6:])) for v in VOTES],
        )
    build_index()
    return tmp_db
