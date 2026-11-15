# VotoClaro — working guide

Non-partisan app showing how the Portuguese Parliament (Assembleia da República) votes,
aimed at 16–30 year olds. This file is how the repo **actually** works today.
`.claude/CLAUDE.md` is the original product vision. Parts of it, such as Supabase, the
`deputados/{id}/votos` endpoints and push notifications, are not built.
`.claude/DESIGN.md` is the visual design system: the "Azulejo" world (2026-11-14), which replaced the short-lived "ballot paper".
`PRODUCT.md` (product truth) and `.impeccable/surfaces/votoclaro.md` (the direction contract) go with it.
`.claude/SKILLS.md` (component contracts) predates the redesign; where they disagree, DESIGN.md wins.

## Layout

```
votoclaro/   Expo app (iOS, Android, web). Web is deployed to Vercel.
votoclaro/api/  Vercel functions: per-vote link-preview image (og.ts) and crawler meta tags (votacao.ts).
backend/     Python RAG API ("Perguntar" tab). Deployed to a Hugging Face Space.
.github/workflows/refresh-rag.yml   weekly data refresh of the Space (runs from main only)
PREVIEW_REPORT.md                   what the preview/ui-overhaul branch changed vs main
```

There is no Supabase. The app reads live data straight from the **openAR API**
(`https://api.openar.pt/v1`, XVII legislature), which is built on Parliament's open data.
Votes are recorded **per parliamentary group, not per deputy**.

## App (`votoclaro/`)

- Stack: Expo **SDK 54 (pinned for Expo Go compatibility, so don't upgrade casually)**, Expo
  Router, React Query, Zustand, TypeScript. Styling uses `StyleSheet` with tokens from
  `constants/` (`Colors`, `Spacing`, `Typography`), not NativeWind.
- Tabs live in `app/(tabs)/`: `index` (feed), `deputados`, `comparar`, `perguntar` (RAG chat).
  The party affinity quiz was removed on 2026-11-13. The detail screens are `votacao/[id]` (needs the `iniciativaId` param too) and `deputado/[id]`.
- Data: `lib/parlamento-api.ts` (openAR client) → `lib/parlamentoAdapters.ts` → `hooks/`.
  Pure logic lives in `lib/` (`feed`, `comparar`, `perguntar`) and is unit-tested.
- Shared UI comes from `components/ui.tsx` (`Cartao`, `Botao`, `Chip`, `Aviso`, `useCores()` …). Reuse these.
- Commands (run in `votoclaro/`):
  ```bash
  npm test            # jest (jest-expo)
  npm run typecheck   # tsc --noEmit
  npx expo start      # phone testing on WSL2 needs the port-forward or --tunnel
  ```
- Env: `EXPO_PUBLIC_RAG_API_URL` (`.env.local` for dev, `.env.production` for the Vercel build).
  It is embedded in the bundle, so **never put secrets in `EXPO_PUBLIC_*`**. A new backend host must also
  be added to `connect-src` in the CSP in `vercel.json`.
- Vercel builds every pushed branch: a preview deploy per branch, with production from `main`.

## Backend (`backend/`)

- FastAPI `POST /ask` → LLM agent (`agent.py`, Groq via an OpenAI-compatible API, with a model
  fallback chain) → tools (`tools.py`): `search_bills` (hybrid BM25 + bge-m3 vectors over bill
  text), `get_votes` / `find_votes` (SQL). Everything lives in one SQLite file, `data/votoclaro.db`.
- `fontes.py` resolves each `[Projeto de Lei n.º N, Artigo X.º]` citation in an answer to the
  initiative, section text and vote. The app uses it to make citations tappable. The citation regex
  must match `CITACAO` in `votoclaro/lib/perguntar.ts`.
- Commands (run in `backend/`; there is no global `uv`, use the venv):
  ```bash
  .venv/bin/python -m pytest -q
  .venv/bin/votoclaro ask "Como votou o PS no Projeto de Lei 511?" -v
  .venv/bin/uvicorn votoclaro_rag.api:app --port 8000
  ```
  A new eval kind in `evals/answers.jsonl` must also be added to the allowed set in
  `tests/test_evals.py::test_eval_sets_are_well_formed`.
- Deploy: the Space is `vscocmp/votoclaro-rag` (`https://vscocmp-votoclaro-rag.hf.space`).
  `deploy/push_space.sh` uploads code **and the local DB**. The weekly CI refresh may have put
  newer data on the Space than you have locally, so for code-only changes upload just `src/`:
  `.venv/bin/hf upload vscocmp/votoclaro-rag <clean copy of src> src --repo-type space`.
- Secrets (`GROQ_API_KEY`) live only in `backend/.env` and the Space settings. Never commit or upload them.

## Rules that matter

- **Political neutrality.** Show facts (public votes), never opinions. Use no evaluative wording, give
  no voting advice, and don't favour any party in ranking. Party colours come from `constants/CORES_PARTIDOS.ts`.
- **RAG answers are untrusted text.** Render them as plain text, never as HTML or Markdown. Only open
  `https://` links on parlamento.pt (`urlOficial` in `lib/perguntar.ts`).
- User-facing copy is **European Portuguese (pt-PT)**. Identifiers are a mix of Portuguese
  (domain: `votacao`, `deputado`, `iniciativa`, `posicao`) and English; follow the file you're in.
- Accessibility: every pressable has an `accessibilityLabel`, and vote colours must pass WCAG AA (see
  the `*Ink` colours in `constants/Colors.ts`).
- Design: follow `.claude/DESIGN.md`. In short: Bright Snow paper, azulejo tiles in Ultramarine, a Portuguese landmark
  image per tab (`assets/edificios/`, real images only), big Ultramarine headlines, soft 14px cards, pill filters.
  Votes are drawn in ink on an engraved hemicycle (solid / hatched / empty / grey), **never green/red**. No shadows,
  eyebrow labels or sketch-style SVG drawings. Motion uses the transitions.dev scale via `anim()` in `components/ui.tsx`.
  The design skills are installed in `.claude/skills/` (impeccable, transitions-dev, web-design-guidelines).
- Branches: work happens on `preview/*` branches. Don't push to `main` without asking.
