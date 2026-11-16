# VotoClaro

**See how the Portuguese Parliament votes, in seconds.** · [Live app →](https://project-diplomacy-votoclaro.vercel.app)

VotoClaro is a non-partisan app for young voters (16–30) that turns the official records of the Assembleia da República into something anyone can read. It shows every recent vote, whether it passed, and how each party voted, with no editorial spin. You can also ask questions in plain Portuguese and get answers that cite the actual bills.

> The app's user-facing text is in European Portuguese.

## Features

- **Feed**: the latest parliamentary votes, each with its result and party positions drawn on a hemicycle
- **Vote detail**: what the initiative is about, how each group voted, and a link to the official record
- **Deputies**: browse the members of the current (XVII) legislature
- **Compare**: see how parties line up across topics
- **Perguntar ("Ask")**: an agentic RAG assistant over bill texts and voting records. Every answer cites `[Projeto de Lei n.º N, Artigo X.º]`, and each citation opens the source.
- **Shareable links**: every vote gets its own link-preview image, generated server-side

## Architecture

```
votoclaro/   Expo (React Native) app: iOS, Android and web. The web build is deployed on Vercel.
  app/         Expo Router screens: feed, deputados, comparar, perguntar
  lib/         openAR API client, adapters, and unit-tested pure logic
  api/         Vercel functions for Open Graph images and crawler meta tags
backend/     Python RAG API (FastAPI), deployed as a Hugging Face Space
  src/votoclaro_rag/   ingest → index (BM25 + bge-m3 vectors in SQLite) → LLM agent with tools
  evals/       retrieval and answer evaluation sets
.github/workflows/refresh-rag.yml   weekly data refresh
```

- **Data**: live from the [openAR API](https://api.openar.pt), which is built on Parliament's open data. Votes are recorded per parliamentary group.
- **Ask pipeline**: FastAPI `POST /ask` → an LLM agent (Groq through an OpenAI-compatible API, with model fallback) → tools for hybrid search over bill text (`sqlite-vec` + BM25) and SQL lookups of votes.

## Running locally

### App

```sh
cd votoclaro
npm install
cp .env.example .env.local   # point EXPO_PUBLIC_RAG_API_URL at your backend
npx expo start               # press w for web, or scan the QR code with Expo Go
npm test                     # Jest
```

### Backend

Requires Python 3.12+.

```sh
cd backend
python -m venv .venv && .venv/bin/pip install -e .
cp .env.example .env         # add a free GROQ_API_KEY
.venv/bin/votoclaro ask "Como votou o PS no Projeto de Lei 511?" -v
.venv/bin/uvicorn votoclaro_rag.api:app --port 8000
.venv/bin/python -m pytest -q
```

## Principles

- **Political neutrality**: only public facts are shown. No evaluative wording, no voting advice, and no party is ranked above another. Vote colours are never green or red.
- **Safe AI output**: RAG answers are rendered as plain text, never as HTML or Markdown, and only official `parlamento.pt` links can be opened.
- **Accessibility**: every interactive element has an accessible label, and vote colours meet WCAG AA contrast.
- **No secrets in the client**: `EXPO_PUBLIC_*` values ship in the bundle, so the LLM key stays on the backend.

## Tech

Expo SDK 54 · React Native · Expo Router · React Query · Zustand · TypeScript · Vercel · Python · FastAPI · sqlite-vec · sentence-transformers (bge-m3) · Groq · Hugging Face Spaces · GitHub Actions
