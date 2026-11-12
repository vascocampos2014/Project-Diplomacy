"""HTTP API for the app: POST /ask. Run with `uvicorn votoclaro_rag.api:app`."""

import logging
import os
import threading
import time
from collections import defaultdict, deque

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import APIStatusError, RateLimitError
from pydantic import BaseModel, Field

from votoclaro_rag.agent import ask

log = logging.getLogger(__name__)

app = FastAPI(title="VotoClaro RAG")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8081,https://project-diplomacy-votoclaro.vercel.app").split(","),
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# Every question costs LLM quota, so cap questions per client. In-memory and
# per process: enough for one small server; use Redis or the host's rate
# limiting if this ever runs on several instances.
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))
_hits: dict[str, deque] = defaultdict(deque)
_hits_lock = threading.Lock()


def _allow(client: str) -> bool:
    now = time.monotonic()
    with _hits_lock:
        q = _hits[client]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE_LIMIT:
            return False
        q.append(now)
        return True


class Pergunta(BaseModel):
    pergunta: str = Field(min_length=3, max_length=500)


class Resposta(BaseModel):
    resposta: str
    ferramentas: list[dict]
    segundos: float
    modelo: str


@app.post("/ask", response_model=Resposta)
def post_ask(body: Pergunta, request: Request) -> Resposta:
    # The socket address, not X-Forwarded-For: that header is set by the
    # client and would let anyone dodge the limit. Behind a trusted proxy,
    # run uvicorn with --proxy-headers so request.client is the real address.
    client = request.client.host if request.client else "unknown"
    if not _allow(client):
        raise HTTPException(429, "Demasiadas perguntas seguidas. Espera um minuto.")
    try:
        r = ask(body.pergunta)
    except RateLimitError:
        raise HTTPException(429, "Limite de pedidos ao modelo atingido. Tenta daqui a pouco.")
    except APIStatusError as e:
        log.warning("LLM provider error %s", e.status_code)
        raise HTTPException(502, "O serviço de respostas está indisponível de momento.")
    return Resposta(resposta=r.answer, ferramentas=r.tool_calls, segundos=r.seconds, modelo=r.model)


@app.get("/health")
def health() -> dict:
    return {"ok": True}
