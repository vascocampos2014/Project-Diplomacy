"""Fetch votes and initiatives from openAR, then download and extract bill texts."""

import json
import logging

from votoclaro_rag.config import RAW_DIR
from votoclaro_rag.db import connect
from votoclaro_rag.openar import OpenAR
from votoclaro_rag.text import extract_pdf

log = logging.getLogger(__name__)

TIPOS = {
    "J": "Projeto de Lei",
    "P": "Proposta de Lei",
    "R": "Projeto de Resolução",
    "D": "Projeto de Deliberação",
    "S": "Proposta de Resolução",
}


def sync_votes(api: OpenAR) -> int:
    """Store every vote of the legislature plus basic initiative metadata.

    Cheap (a dozen requests) and complete, so the structured tools can answer
    "how did X vote" for every initiative, even ones whose text isn't indexed.
    """
    conn = connect()
    n = 0
    with conn:
        for v in api.votacoes():
            conn.execute(
                """INSERT INTO iniciativas (id, tipo, tipo_desc, numero, titulo)
                   VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING""",
                (v["iniciativaId"], v["iniciativaTipo"], TIPOS.get(v["iniciativaTipo"]), v["iniciativaNumero"], v["iniciativaTitulo"]),
            )
            conn.execute(
                """INSERT OR REPLACE INTO votacoes
                   (id, iniciativa_id, data, resultado, unanime, descricao, a_favor, contra, abstencao, ausencias)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    int(v["id"]), v["iniciativaId"], v["data"], v["resultado"], int(v["unanime"]), v.get("descricao"),
                    json.dumps(v["aFavor"]), json.dumps(v["contra"]), json.dumps(v["abstencao"]), json.dumps(v["ausencias"]),
                ),
            )
            n += 1
    return n


def fetch_texts(api: OpenAR, limit: int) -> tuple[int, int]:
    """Download and extract the text of the `limit` most recently voted
    initiatives that don't have one yet. Returns (ok, failed)."""
    conn = connect()
    rows = conn.execute(
        """SELECT i.id FROM iniciativas i JOIN votacoes v ON v.iniciativa_id = i.id
           WHERE i.texto IS NULL AND i.texto_erro IS NULL
           GROUP BY i.id ORDER BY MAX(v.data) DESC, i.id DESC LIMIT ?""",
        (limit,),
    ).fetchall()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    ok = failed = 0
    for row in rows:
        iid = row["id"]
        try:
            meta = api.iniciativa(iid)
            link = meta.get("linkTexto")
            if not link:
                raise ValueError("sem linkTexto")
            pdf_path = RAW_DIR / f"{iid}.pdf"
            if not pdf_path.exists():
                pdf_path.write_bytes(api.download(link))
            texto = extract_pdf(pdf_path.read_bytes())
            if len(texto) < 200:
                raise ValueError(f"texto demasiado curto ({len(texto)} caracteres), provavelmente PDF digitalizado")
            with conn:
                conn.execute(
                    """UPDATE iniciativas SET estado = ?, data_entrada = ?, link_texto = ?, texto = ? WHERE id = ?""",
                    (meta.get("estado"), meta.get("dataEntrada"), link, texto, iid),
                )
            ok += 1
        except Exception as e:  # one bad PDF must not stop the run
            log.warning("iniciativa %s: %s", iid, e)
            with conn:
                conn.execute("UPDATE iniciativas SET texto_erro = ? WHERE id = ?", (str(e)[:300], iid))
            failed += 1
        if (ok + failed) % 20 == 0:
            log.info("%d/%d textos", ok + failed, len(rows))
    return ok, failed
