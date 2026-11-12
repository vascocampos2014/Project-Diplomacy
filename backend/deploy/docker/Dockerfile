# VotoClaro RAG API as a plain Docker image (for hosts like Cloud Run or Fly.io).
# Build context: the folder that deploy/push_space.sh assembles (STAGE_ONLY).
# Hugging Face now charges for Docker Spaces; the free Space uses app.py (Gradio).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Spaces run the container as user 1000.
RUN useradd -m -u 1000 user
WORKDIR /app

# CPU-only PyTorch: the Space has no GPU, and the CUDA build is ~5x bigger.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

COPY --chown=user pyproject.toml ./
COPY --chown=user src ./src
RUN pip install .

# Bake the embedding model into the image so start-up never downloads it.
# Only the files sentence-transformers needs (no ONNX, ColBERT or images).
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download('BAAI/bge-m3', local_dir='/app/models/bge-m3', allow_patterns=['*.json', 'pytorch_model.bin', 'sentencepiece.bpe.model', '1_Pooling/*'], ignore_patterns=['onnx/*'])" \
    && chown -R user /app/models

COPY --chown=user data/votoclaro.db ./data/votoclaro.db

USER user
ENV VOTOCLARO_ENV=production \
    VOTOCLARO_DATA_DIR=/app/data \
    EMBED_MODEL=/app/models/bge-m3 \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    TRUSTED_PROXY_HOPS=1 \
    DAILY_LIMIT=300 \
    RATE_LIMIT_PER_MINUTE=10

EXPOSE 7860
CMD ["uvicorn", "votoclaro_rag.api:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
