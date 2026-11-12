"""Weekly refresh of the RAG data on the Hugging Face Space.

1. Download the database the Space is serving now (the source of truth).
2. Top it up: new votes from openAR, texts of bills that don't have one yet
   (newest first, so coverage also grows into older bills), and embeddings
   for the new passages only.
3. Quality gate: database integrity, every passage has a vector, and the
   retrieval eval still passes. If anything fails, nothing is uploaded.
4. Upload the database only if something changed. The Space then restarts
   with it.

Run from backend/ (with the package installed in editable mode, so the eval
sets in evals/ are found):

    python deploy/refresh_space.py --dry-run     # everything except the upload
    HF_TOKEN=... python deploy/refresh_space.py  # what the GitHub Action runs
"""

import argparse
import hashlib
import os
import shutil
import sys
import tempfile
from pathlib import Path

SPACE = os.getenv("HF_SPACE", "vscocmp/votoclaro-rag")
DB_IN_SPACE = "data/votoclaro.db"
MIN_RECALL = float(os.getenv("MIN_RECALL", "0.95"))  # hybrid recall@5 on evals/retrieval.jsonl


def _hash_votes(conn) -> str:
    h = hashlib.sha256()
    for row in conn.execute(
        "SELECT id, data, resultado, a_favor, contra, abstencao, ausencias, descricao FROM votacoes ORDER BY id"
    ):
        h.update(repr(tuple(row)).encode())
    return h.hexdigest()[:16]


def stats(conn) -> dict:
    q = lambda sql: conn.execute(sql).fetchone()[0]  # noqa: E731
    return {
        "votacoes": q("SELECT COUNT(*) FROM votacoes"),
        "ultima_votacao": q("SELECT MAX(data) FROM votacoes"),
        "iniciativas": q("SELECT COUNT(*) FROM iniciativas"),
        "com_texto": q("SELECT COUNT(*) FROM iniciativas WHERE texto IS NOT NULL"),
        "chunks": q("SELECT COUNT(*) FROM chunks"),
        "vetores": q("SELECT COUNT(*) FROM chunks_vec"),
        # Catches votes whose content changed without changing the count.
        "assinatura_votos": _hash_votes(conn),
    }


def quality_problems(conn, after: dict, recall: float | None) -> list[str]:
    problems = []
    if conn.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
        problems.append("a base de dados falhou o integrity_check")
    if after["vetores"] != after["chunks"]:
        problems.append(f"{after['chunks']} chunks mas {after['vetores']} vetores")
    if recall is not None and recall < MIN_RECALL:
        problems.append(f"recall@5 híbrido {recall:.0%} abaixo do mínimo {MIN_RECALL:.0%}")
    return problems


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--dry-run", action="store_true", help="do everything except the upload")
    p.add_argument("--texts", type=int, default=15, help="max new bill texts to fetch per run (CPU embedding: ~1 min each)")
    p.add_argument("--workdir", help="where to put the database (default: a temporary folder)")
    args = p.parse_args()

    workdir = Path(args.workdir or tempfile.mkdtemp(prefix="votoclaro-refresh-"))
    workdir.mkdir(parents=True, exist_ok=True)
    # Must be set before the package reads its config.
    os.environ["VOTOCLARO_DATA_DIR"] = str(workdir)

    from huggingface_hub import HfApi, hf_hub_download

    from votoclaro_rag.db import connect
    from votoclaro_rag.evals import run_retrieval
    from votoclaro_rag.index import build_index
    from votoclaro_rag.ingest import fetch_texts, sync_votes
    from votoclaro_rag.openar import OpenAR

    print(f"1. A descarregar a base de dados de {SPACE}")
    cached = hf_hub_download(SPACE, DB_IN_SPACE, repo_type="space")
    shutil.copyfile(cached, workdir / "votoclaro.db")  # contents only: the cache copy is read-only
    conn = connect()
    before = stats(conn)
    print(f"   antes: {before}")

    print("2. A atualizar")
    api = OpenAR()
    print(f"   votações sincronizadas: {sync_votes(api)}")
    ok, failed = fetch_texts(api, args.texts)
    print(f"   textos novos: {ok} extraídos, {failed} falharam")
    print(f"   chunks novos: {build_index()}")
    after = stats(conn)
    print(f"   depois: {after}")

    if after == before:
        print("Sem alterações: nada a enviar.")
        return 0

    print("3. Verificação de qualidade")
    recall = run_retrieval()["hybrid"]["recall"]
    print(f"   recall@5 híbrido: {recall:.0%} (mínimo {MIN_RECALL:.0%})")
    problems = quality_problems(conn, after, recall)
    if problems:
        print("Falhou a verificação, nada foi enviado:\n - " + "\n - ".join(problems), file=sys.stderr)
        return 1

    conn.execute("VACUUM")
    conn.close()
    if args.dry_run:
        print(f"--dry-run: não enviado. Base de dados nova em {workdir / 'votoclaro.db'}")
        return 0

    print(f"4. A enviar para {SPACE}")
    novas = after["votacoes"] - before["votacoes"]
    HfApi().upload_file(
        path_or_fileobj=str(workdir / "votoclaro.db"),
        path_in_repo=DB_IN_SPACE,
        repo_id=SPACE,
        repo_type="space",
        commit_message=f"Atualização semanal: +{novas} votações, +{after['chunks'] - before['chunks']} passagens "
        f"(até {after['ultima_votacao']})",
    )
    print("Enviado. O Space reinicia com os dados novos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
