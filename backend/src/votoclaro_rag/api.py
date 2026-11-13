"""HTTP API for the app: POST /ask. Run with `uvicorn votoclaro_rag.api:app`."""

import ipaddress
import logging
import os
import threading
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import APIError, RateLimitError
from pydantic import BaseModel, Field, ValidationError

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


def client_ip_from(forwarded_for: str | None, socket_ip: str) -> str:
    if TRUSTED_PROXY_HOPS <= 0:
        return socket_ip
    chain = [h.strip() for h in (forwarded_for or "").split(",") if h.strip()]
    if len(chain) < TRUSTED_PROXY_HOPS:
        return socket_ip
    return chain[-TRUSTED_PROXY_HOPS]


def client_ip(request: Request) -> str:
    socket_ip = request.client.host if request.client else "unknown"
    return client_ip_from(request.headers.get("x-forwarded-for"), socket_ip)


def check_limits(client: str) -> str | None:
    """The message to show if this client may not ask now, else None.
    Shared by POST /ask and the Space's chat page."""
    if not _allow(client):
        return "Demasiadas perguntas seguidas. Espera um minuto."
    if not _allow_today():
        return "O limite diário de perguntas foi atingido. Volta amanhã."
    return None


MAX_TRACKED_CLIENTS = 20_000


def limit_key(client: str) -> str:
    """The unit a visitor is limited by. One IPv6 connection usually owns a
    whole /64 (about 1.8e19 addresses), so per-address limits would be free
    to dodge by rotating addresses: limit the /64 instead."""
    try:
        ip = ipaddress.ip_address(client)
    except ValueError:
        return client
    if ip.version == 4:
        return str(ip)
    if ip.ipv4_mapped is not None:  # ::ffff:1.2.3.4 is just an IPv4 visitor
        return str(ip.ipv4_mapped)
    return str(ipaddress.ip_network(f"{ip}/64", strict=False))


def _allow(client: str) -> bool:
    now = time.monotonic()
    key = limit_key(client)
    with _hits_lock:
        if len(_hits) > MAX_TRACKED_CLIENTS:
            # Forget clients with no recent questions, so many addresses
            # can't grow this dict until the server runs out of memory.
            for k in [k for k, q in _hits.items() if not q or now - q[-1] > 60]:
                del _hits[k]
        q = _hits[key]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE_LIMIT:
            return False
        q.append(now)
        return True


class Turno(BaseModel):
    pergunta: str = Field(max_length=500)
    resposta: str = Field(max_length=4000)


class Pergunta(BaseModel):
    pergunta: str = Field(min_length=3, max_length=500)
    # Earlier turns of the conversation, oldest first (the agent keeps the
    # last few). Optional: without it each question stands alone.
    historico: list[Turno] = Field(default_factory=list, max_length=10)


class Resposta(BaseModel):
    resposta: str
    ferramentas: list[dict]
    segundos: float
    modelo: str


# The body is read and validated by hand (not by FastAPI's automatic
# validation) so that: oversized bodies are refused before being read, and
# errors are one short sentence instead of echoing the whole request back.
MAX_BODY_BYTES = 48 * 1024  # a question plus up to 10 earlier turns
PERGUNTA_INVALIDA = "A pergunta tem de ter entre 3 e 500 caracteres."


def _erro(status: int, mensagem: str) -> JSONResponse:
    return JSONResponse({"detail": mensagem}, status_code=status)


async def _ler_pergunta(request: Request) -> Pergunta | JSONResponse:
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > MAX_BODY_BYTES:
        return _erro(413, "Pedido demasiado grande.")
    body = b""
    async for parte in request.stream():
        body += parte
        if len(body) > MAX_BODY_BYTES:
            return _erro(413, "Pedido demasiado grande.")
    try:
        return Pergunta.model_validate_json(body)
    except ValidationError:
        return _erro(422, PERGUNTA_INVALIDA)


def _responder(pergunta: str, client: str, historico: list[dict] | None = None) -> JSONResponse:
    bloqueio = check_limits(client)
    if bloqueio:
        return _erro(429, bloqueio)
    try:
        r = ask(pergunta, historico=historico) if historico else ask(pergunta)
    except RateLimitError:
        return _erro(429, "Limite de pedidos ao modelo atingido. Tenta daqui a pouco.")
    except APIError as e:  # error responses, timeouts, connection failures
        log.warning("LLM provider error: %s", type(e).__name__)
        return _erro(502, "O serviço de respostas está indisponível de momento.")
    except Exception:
        log.exception("unexpected error answering a question")
        return _erro(500, "Ocorreu um erro inesperado. Tenta de novo.")
    resposta = Resposta(resposta=r.answer, ferramentas=r.tool_calls, segundos=r.seconds, modelo=r.model)
    return JSONResponse(resposta.model_dump())


async def post_ask(request: Request) -> JSONResponse:
    body = await _ler_pergunta(request)
    if isinstance(body, JSONResponse):
        return body
    historico = [t.model_dump() for t in body.historico]
    # ask() blocks on network calls: run it off the event loop.
    return await run_in_threadpool(_responder, body.pergunta, client_ip(request), historico)


app.add_api_route("/ask", post_ask, methods=["POST"])


@app.get("/health")
def health() -> dict:
    return {"ok": True}
