"""HTTP API for the app: POST /ask. Run with `uvicorn votoclaro_rag.api:app`."""

import logging
import os
import threading
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import APIStatusError, RateLimitError
from pydantic import BaseModel, Field

from votoclaro_rag.agent import ask

log = logging.getLogger(__name__)

# In production (the Hugging Face Space sets VOTOCLARO_ENV=production) the
# interactive /docs page is off, so the API isn't advertised to strangers.
PRODUCTION = os.getenv("VOTOCLARO_ENV") == "production"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Load the embedding model in the background at start-up, so the first
    # visitor after the server wakes doesn't wait for it on their question.
    if os.getenv("WARMUP", "1" if PRODUCTION else "0") == "1":
        threading.Thread(target=_warmup, daemon=True).start()
    yield


def _warmup() -> None:
    try:
        from votoclaro_rag.embed import embed

        embed(["aquecimento"])
        log.info("embedding model loaded")
    except Exception:  # never stop the server over this
        log.exception("warm-up failed")


app = FastAPI(
    title="VotoClaro RAG",
    lifespan=lifespan,
    docs_url=None if PRODUCTION else "/docs",
    redoc_url=None,
    openapi_url=None if PRODUCTION else "/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8081,https://project-diplomacy-votoclaro.vercel.app").split(","),
    # Vercel preview deployments of this project get their own subdomains.
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://project-diplomacy-votoclaro-[a-z0-9-]+\.vercel\.app"),
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# Every question costs LLM quota, so cap questions per client. In-memory and
# per process: enough for one small server; use Redis or the host's rate
# limiting if this ever runs on several instances.
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))
_hits: dict[str, deque] = defaultdict(deque)
_hits_lock = threading.Lock()


# A cap for the whole server per UTC day, so one abuser (or many proxies)
# can't use up the shared Groq quota for everyone. 0 disables it.
DAILY_LIMIT = int(os.getenv("DAILY_LIMIT", "300"))
_day = {"date": "", "count": 0}


def _allow_today() -> bool:
    today = datetime.now(timezone.utc).date().isoformat()
    with _hits_lock:
        if _day["date"] != today:
            _day.update(date=today, count=0)
        if DAILY_LIMIT and _day["count"] >= DAILY_LIMIT:
            return False
        _day["count"] += 1
        return True


# Behind a reverse proxy (Hugging Face Spaces) every request arrives from the
# proxy's address, so the real visitor is in X-Forwarded-For. Only the
# entries appended by proxies we trust count: the left end of the header is
# whatever the client sent and can be faked. TRUSTED_PROXY_HOPS=1 means "the
# last entry was written by our one proxy". 0 (the default) ignores the
# header and uses the socket address.
TRUSTED_PROXY_HOPS = int(os.getenv("TRUSTED_PROXY_HOPS", "0"))


def client_ip(request: Request) -> str:
    socket_ip = request.client.host if request.client else "unknown"
    if TRUSTED_PROXY_HOPS <= 0:
        return socket_ip
    chain = [h.strip() for h in request.headers.get("x-forwarded-for", "").split(",") if h.strip()]
    if len(chain) < TRUSTED_PROXY_HOPS:
        return socket_ip
    return chain[-TRUSTED_PROXY_HOPS]


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
    if not _allow(client_ip(request)):
        raise HTTPException(429, "Demasiadas perguntas seguidas. Espera um minuto.")
    if not _allow_today():
        raise HTTPException(429, "O limite diário de perguntas foi atingido. Volta amanhã.")
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
