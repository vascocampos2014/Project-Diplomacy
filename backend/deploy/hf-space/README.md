---
title: VotoClaro RAG
emoji: 🏛️
colorFrom: indigo
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
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

## API

```
POST /ask      {"pergunta": "Como votou o PS no Projeto de Lei 511?"}
            -> {"resposta": "...", "ferramentas": [...], "segundos": 9.7, "modelo": "openai/gpt-oss-120b"}
GET  /health   {"ok": true}
```

Only the VotoClaro web app is allowed to call it from a browser (CORS).

Data: [openAR](https://openar.pt), built on the Assembleia da República's open data.
