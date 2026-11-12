"""Settings, read from environment variables (and backend/.env)."""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

DATA_DIR = Path(os.getenv("VOTOCLARO_DATA_DIR", BACKEND_DIR / "data"))
RAW_DIR = DATA_DIR / "raw"  # downloaded bill PDFs, cached between runs
DB_PATH = DATA_DIR / "votoclaro.db"

OPENAR_URL = "https://api.openar.pt/v1"
LEGISLATURA = os.getenv("VOTOCLARO_LEGISLATURA", "XVII")

# Embeddings run locally: bge-m3 is multilingual (the corpus is Portuguese) and
# outputs 1024-dim vectors. Free and unlimited, unlike the LLM.
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-m3")
EMBED_DIM = 1024

# Any OpenAI-compatible endpoint works. Groq by default (free tier); switch to
# Gemini, OpenRouter, a local Ollama, etc. by changing these three values.
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY") or os.getenv("GROQ_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")

# Fallback chain. On Groq each model has its own free quota (e.g. 8K tokens/min,
# 200K tokens/day), so when one is exhausted the next one usually still works.
# Comma-separated; empty disables fallback.
LLM_FALLBACK_MODELS = [
    m.strip()
    for m in os.getenv("LLM_FALLBACK_MODELS", "qwen/qwen3.8-27b,openai/gpt-oss-20b").split(",")
    if m.strip() and m.strip() != LLM_MODEL
]
LLM_MODELS = [LLM_MODEL, *dict.fromkeys(LLM_FALLBACK_MODELS)]
