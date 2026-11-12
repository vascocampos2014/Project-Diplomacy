#!/usr/bin/env bash
# Upload the RAG API to a Hugging Face Space.
#
# One-time setup (you):
#   1. Create the Space at https://huggingface.co/new-space
#      (name: votoclaro-rag, SDK: Gradio, template: Blank, hardware: ZeroGPU, public).
#      Docker and CPU Basic Spaces are paid since 2026; ZeroGPU is free for
#      accounts older than 30 days with a verified email.
#   2. In the Space: Settings > Variables and secrets > New secret
#      GROQ_API_KEY = a key made just for the Space.
#   3. Log in from this machine with a token that can write:
#      .venv/bin/hf auth login
#
# Then, from backend/:   deploy/push_space.sh [owner/space]
# To only assemble the files and inspect them:   STAGE_ONLY=/some/dir deploy/push_space.sh
#
# It copies only what the Space needs into a temporary folder: app.py,
# requirements.txt, the Space README, the Python package and the SQLite
# database. (For a Docker host instead, add deploy/docker/Dockerfile.) It never
# uploads .env, the downloaded PDFs, evals or tests.
set -euo pipefail

SPACE="${1:-vscocmp/votoclaro-rag}"
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -n "${STAGE_ONLY:-}" ]]; then
  STAGE="$STAGE_ONLY"; mkdir -p "$STAGE"
else
  STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
fi

test -f "$BACKEND/data/votoclaro.db" || { echo "Missing data/votoclaro.db: run 'votoclaro ingest' and 'votoclaro index' first." >&2; exit 1; }

cp "$BACKEND/deploy/hf-space/app.py" "$BACKEND/deploy/hf-space/requirements.txt" "$BACKEND/deploy/hf-space/README.md" "$BACKEND/pyproject.toml" "$STAGE/"
cp -r "$BACKEND/src" "$STAGE/src"
find "$STAGE/src" -name '__pycache__' -prune -exec rm -rf {} +
mkdir -p "$STAGE/data"
# A consistent copy even if the database is open elsewhere.
"$BACKEND/.venv/bin/python" -c "import sqlite3,sys; s=sqlite3.connect(sys.argv[1]); d=sqlite3.connect(sys.argv[2]); s.backup(d); d.close(); s.close()" \
  "$BACKEND/data/votoclaro.db" "$STAGE/data/votoclaro.db"

# Safety net: refuse to upload anything that looks like a secret.
if grep -rIlE 'gsk_[A-Za-z0-9]{20,}|GROQ_API_KEY=[^[:space:]]+' "$STAGE"; then
  echo "Refusing to upload: a file above looks like it contains an API key." >&2
  exit 1
fi

if [[ -n "${STAGE_ONLY:-}" ]]; then
  echo "Assembled in $STAGE (not uploaded):"; (cd "$STAGE" && find . -type f | sort); exit 0
fi

echo "Uploading to https://huggingface.co/spaces/$SPACE:"
(cd "$STAGE" && find . -type f | sort)
"$BACKEND/.venv/bin/hf" upload "$SPACE" "$STAGE" . --repo-type space --commit-message "Deploy VotoClaro RAG API"
echo "Done. Build logs: https://huggingface.co/spaces/$SPACE?logs=build"
