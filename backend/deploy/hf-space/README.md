---
title: VotoClaro RAG
emoji: 🏛️
colorFrom: indigo
colorTo: gray
sdk: gradio
sdk_version: 6.25.0
python_version: "3.12"
app_file: app.py
pinned: false
models:
- BAAI/bge-m3
# Download the embedding model while building, not on the first question.
preload_from_hub:
- BAAI/bge-m3 config.json,config_sentence_transformers.json,modules.json,sentence_bert_config.json,special_tokens_map.json,tokenizer.json,tokenizer_config.json,sentencepiece.bpe.model,pytorch_model.bin,1_Pooling/config.json
short_description: Ask in Portuguese how the Portuguese Parliament voted
---

# VotoClaro RAG API

This is the question-answering backend of **[VotoClaro](https://project-diplomacy-votoclaro.vercel.app)**, a
non-partisan app that shows how the Portuguese Parliament (Assembleia da República) votes.

Ask a question in plain Portuguese, such as *"Quem votou contra a eliminação das portagens da A1?"*. The API
answers only from the official bill texts and roll-call votes of the XVII legislature, and cites each fact.

## How it works

- **Hybrid retrieval.**
  - 3,652 chunks from 196 bill texts, embedded with [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3) (multilingual) in sqlite-vec.
  - Combined with SQLite FTS5 BM25 using weighted reciprocal rank fusion.
  - Retrieval eval: recall@5 100%, MRR 0.88.
- **Agent with tools.** An LLM decides which tools to call:
  - `search_bills` (content);
  - `get_votes` (how each party voted, labelled by stage);
  - `find_votes` (filter votes by party, position, result and date).
- **Guardrails.**
  - Answers only from tool results, with citations, and says so when the data has no answer.
  - Never gives opinions or voting advice.
  - Answer eval: 12/12 on votes, content, unanswerable and neutrality cases.
- **Free-tier friendly.** Uses Groq. If a model hits its quota, the API falls back from `gpt-oss-120b` to `qwen3.8-27b` and then `gpt-oss-20b`.
- **Abuse limits.**
  - 10 questions per minute per visitor, and a daily cap for the whole server.
  - No interactive docs in production.

## Try it

Use the chat on this page, or call the API:


```
POST /ask      {"pergunta": "Como votou o PS no Projeto de Lei 511?"}
            -> {"resposta": "...", "ferramentas": [...], "segundos": 9.7, "modelo": "openai/gpt-oss-120b"}
GET  /health   {"ok": true}
```

Browsers can only call it from the VotoClaro web app (CORS). The chat page and the API share the same limits.
The Space runs on ZeroGPU hardware but never uses the GPU: embedding a question takes about 0.15 s on CPU, and the
LLM runs on Groq.

Data: [openAR](https://openar.pt), built on the Assembleia da República's open data.
