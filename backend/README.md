# VotoClaro RAG backend

Ask questions in plain Portuguese about what the Assembleia da República is
voting on: *"O que propõe o Projeto de Lei 672 e como votou o BE?"*

The answer is grounded in the official bill texts and the official vote
records, cites its sources, says so when the data has no answer, and refuses
to give voting advice.

## How it works

```
openAR API ──► ingest ──► SQLite ◄── tools ◄── LLM agent ◄── POST /ask
 (votes,        PDF→text   ├─ iniciativas, votacoes   (SQL)
  bill PDFs)    chunk      ├─ chunks + FTS5 (BM25)    (keyword)
                embed      └─ sqlite-vec (bge-m3)     (semantic)
```

**Two kinds of question need two kinds of tool.** "What does this bill
propose?" is a retrieval problem. "How did PS vote?" has one exact answer
in a table, and searching text for it would only approximate that answer. So the LLM
gets three tools and decides which ones to use:

| Tool | Backed by | Answers |
|---|---|---|
| `search_bills(query)` | hybrid retrieval over bill text | what a bill proposes and why |
| `get_votes(bill)` | SQL | each party's position in each vote on a bill |
| `find_votes(words, party, result, dates)` | SQL | a party's voting record on a topic |

**Retrieval details**

- **Chunking:** each bill is split by section (preamble, then each *Artigo*),
  then packed into ~1,200-character chunks with overlap. Party letterheads
  and page numbers are stripped first.
- **Contextual chunk headers:** each chunk is embedded together with its bill's
  title, so "Artigo 2.º ... passa a ter a seguinte redação" still knows what
  it is about.
- **Hybrid search:** BM25 (FTS5) and vector search (bge-m3, running locally on the
  GPU) are fused with Reciprocal Rank Fusion. The keyword side is weighted at 0.5,
  a value tuned with the retrieval eval.
- **Diversity:** at most 2 passages per bill, so comparison questions see
  every relevant bill.

**LLM:** any OpenAI-compatible endpoint (Groq by default, which has a free tier). Switch
provider or model with `LLM_BASE_URL`, `LLM_API_KEY` and `LLM_MODEL`.

## Evaluation

```bash
votoclaro eval retrieval   # free, no LLM: is the right bill retrieved?
votoclaro eval answers     # end to end: facts, citations, "I don't know", neutrality
```

Retrieval eval: 22 paraphrased questions written so they avoid the bill's own
words, over 196 bills and 3,652 chunks:

| Mode | Recall@5 | MRR |
|---|---|---|
| keyword (BM25) | 82% | 0.62 |
| vector (bge-m3) | 100% | 0.95 |
| hybrid (RRF, keyword weight 1.0) | 100% | 0.86 |
| **hybrid (keyword weight 0.5)** | 100% | 0.88 |

On paraphrased questions, vector search alone ranks best. Hybrid is kept
because users also type exact references ("Projeto de Resolução 1311"),
where BM25 adds a strong exact match. That case isn't in this set yet, so
the next step is to add exact-reference questions and re-tune the weight.

Answer eval: 12 cases across votes, content, mixed, unanswerable and
neutrality. Results are written to `evals/results/` per model, so models can be
compared on accuracy, tokens and latency.

## Run it

```bash
cp .env.example .env              # add a free GROQ_API_KEY
python3 -m venv --without-pip .venv && pip3 --python .venv/bin/python install uv
.venv/bin/uv sync --python .venv/bin/python

.venv/bin/votoclaro ingest --limit 200   # ~6 min: all votes + 200 bill texts
.venv/bin/votoclaro index                # ~8 min first time (downloads bge-m3)
.venv/bin/votoclaro search "IVA do gás engarrafado"
.venv/bin/votoclaro ask "Como votou o PS no Projeto de Lei 511?" -v
.venv/bin/uvicorn votoclaro_rag.api:app --port 8000
.venv/bin/pytest
```

## Data

Data comes from [openAR](https://api.openar.pt), which is built on the
Assembleia da República's open data. It covers the XVII legislature. The
official record lists each parliamentary group's position, not the vote of
each individual deputy.
