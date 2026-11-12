"""Local embeddings with bge-m3 (GPU when available)."""

from functools import lru_cache

import numpy as np

from votoclaro_rag.config import EMBED_DEVICE, EMBED_MODEL


@lru_cache(maxsize=1)
def _model():
    import torch
    from sentence_transformers import SentenceTransformer

    # EMBED_DEVICE=cpu on Hugging Face ZeroGPU: there torch reports CUDA as
    # available (emulated outside @spaces.GPU), but a query embeds in 0.15 s
    # on CPU, so we never spend GPU quota on it.
    device = EMBED_DEVICE or ("cuda" if torch.cuda.is_available() else "cpu")
    model = SentenceTransformer(EMBED_MODEL, device=device)
    if device == "cuda":
        model.half()  # fp16: half the VRAM, same retrieval quality
    return model


def embed(texts: list[str], batch_size: int = 16) -> np.ndarray:
    """Unit-length float32 vectors, one row per text."""
    vecs = _model().encode(
        texts, batch_size=batch_size, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=len(texts) > 64
    )
    return vecs.astype(np.float32)
