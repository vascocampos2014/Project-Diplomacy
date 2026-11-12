"""VotoClaro RAG on a Hugging Face Space (Gradio SDK, ZeroGPU hardware).

One server, two doors to the same agent:
- POST /ask and GET /health: the JSON API the VotoClaro app calls.
- /: a chat page, so anyone browsing the Space can try it.

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

import gradio as gr  # noqa: E402
import uvicorn  # noqa: E402
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

app = gr.mount_gradio_app(api.app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
