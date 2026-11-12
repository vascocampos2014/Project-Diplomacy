"""HTTP API for the app: POST /ask. Run with `uvicorn votoclaro_rag.api:app`."""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIStatusError, RateLimitError
from pydantic import BaseModel, Field

from votoclaro_rag.agent import ask

app = FastAPI(title="VotoClaro RAG")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8081,https://project-diplomacy-votoclaro.vercel.app").split(","),
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class Pergunta(BaseModel):
    pergunta: str = Field(min_length=3, max_length=500)


class Resposta(BaseModel):
    resposta: str
    ferramentas: list[dict]
    segundos: float
    modelo: str


@app.post("/ask", response_model=Resposta)
def post_ask(body: Pergunta) -> Resposta:
    try:
        r = ask(body.pergunta)
    except RateLimitError:
        raise HTTPException(429, "Limite de pedidos ao modelo atingido. Tenta daqui a pouco.")
    except APIStatusError as e:
        raise HTTPException(502, f"Erro do fornecedor do modelo ({e.status_code}).")
    return Resposta(resposta=r.answer, ferramentas=r.tool_calls, segundos=r.seconds, modelo=r.model)


@app.get("/health")
def health() -> dict:
    return {"ok": True}
