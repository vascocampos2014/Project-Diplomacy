"""VotoClaro RAG on a Hugging Face Space (Gradio SDK, ZeroGPU hardware).

One server, two doors to the same agent:
- POST /ask and GET /health: the JSON API the VotoClaro app calls.
- /: a chat page, so anyone browsing the Space can try it.

Gradio is launched the normal way (ZeroGPU only starts through
gr.Blocks.launch), with server-side rendering off so this one Python server
owns the port, and our two routes are added to Gradio's FastAPI app.

Both share the same limits: per visitor per minute and per day for the whole
server. Nothing here uses the GPU: embedding a question takes about 0.15 s on
CPU and the LLM runs on Groq, so the ZeroGPU daily quota is never spent.
"""

import os
import sys

# Production settings, before the package reads its config.
os.environ.setdefault("VOTOCLARO_ENV", "production")
os.environ.setdefault("VOTOCLARO_DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
os.environ.setdefault("EMBED_DEVICE", "cpu")
os.environ.setdefault("TRUSTED_PROXY_HOPS", "1")
os.environ.setdefault("DAILY_LIMIT", "300")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

# ZeroGPU refuses to start unless the app declares at least one GPU function.
# `spaces` must be imported before anything initialises CUDA. This function
# is never called: everything here runs on CPU, so no GPU quota is spent.
try:
    import spaces  # noqa: E402

    @spaces.GPU(duration=5)
    def _gpu_nunca_usada() -> bool:
        return True
except ImportError:  # outside Hugging Face
    pass

import gradio as gr  # noqa: E402
from openai import APIStatusError, RateLimitError  # noqa: E402

from votoclaro_rag import api  # noqa: E402
from votoclaro_rag.agent import ask  # noqa: E402

EXEMPLOS = [
    "O que propõe o Projeto de Lei 672?",
    "Que iniciativas propuseram baixar o IVA do gás engarrafado?",
    "Quem votou contra a eliminação das portagens da A1 em Vila Franca de Xira?",
    "Em que partido devo votar?",
]

DESCRICAO = (
    "Pergunta como votou o Parlamento português. As respostas vêm só dos textos das iniciativas e das "
    "votações da XVII legislatura, com fontes. Geradas por IA: podem ter erros, confirma nas fontes. "
    "Não dá opiniões nem recomendações de voto. "
    "Parte da app [VotoClaro](https://project-diplomacy-votoclaro.vercel.app)."
)


def responder(mensagem: str, _historico, request: gr.Request) -> str:
    pergunta = (mensagem or "").strip()
    if not 3 <= len(pergunta) <= 500:
        return "A pergunta tem de ter entre 3 e 500 caracteres."
    socket_ip = request.client.host if request and request.client else "unknown"
    bloqueio = api.check_limits(api.client_ip_from(request.headers.get("x-forwarded-for") if request else None, socket_ip))
    if bloqueio:
        return bloqueio
    try:
        # Each question is answered on its own (the API is stateless too).
        return ask(pergunta).answer
    except RateLimitError:
        return "Limite de pedidos ao modelo atingido. Tenta daqui a pouco."
    except APIStatusError:
        return "O serviço de respostas está indisponível de momento."


demo = gr.ChatInterface(
    responder,
    title="VotoClaro · Perguntar ao Parlamento",
    description=DESCRICAO,
    examples=EXEMPLOS,
    cache_examples=False,
)

if __name__ == "__main__":
    import threading

    threading.Thread(target=api._warmup, daemon=True).start()
    demo.queue(default_concurrency_limit=4)
    demo.launch(
        server_name="0.0.0.0",
        server_port=int(os.getenv("PORT", "7860")),
        ssr_mode=False,
        prevent_thread_lock=True,
        # No auto-generated FastAPI docs in production.
        app_kwargs={"docs_url": None, "redoc_url": None, "openapi_url": None},
    )
    # Our JSON API on the same server. Routes are matched per request, so
    # adding them after start-up is fine, and Gradio has no catch-all route.
    # CORS here is Gradio's: on a public host it allows any origin. That is
    # fine because nothing relies on cookies and the limits are server-side.
    demo.app.add_api_route("/ask", api.post_ask, methods=["POST"], response_model=api.Resposta)
    demo.app.add_api_route("/health", api.health, methods=["GET"])
    demo.block_thread()
