# Preview branch `preview/ui-overhaul` — what changed

Nothing in this branch has reached production. `main` is still at `bbff787`,
which is the earlier feed/title/404 fix. Merge this branch only after you've
checked the preview.

## Commits

| Commit | What |
|---|---|
| `e52ebae` | RAG backend (Python): ingest, hybrid search, agent with tools, API, evals |
| `32ea0a3` | Backend tests (68) and security hardening |
| `53dde48` | Web security: CSP and headers, dependency fixes |
| `1a6b0d4` | UI overhaul, quiz on real votes, Compare tab, bug fixes |
| `c2d4477` | Web tests (80) |
| `edb6273` | RAG: correct vote stage, tidy citations (answer eval 12/12) |
| `d0df5be` | RAG: model fallback chain when a model hits its Groq quota |
| (next) | App: Perguntar tab (ask the RAG backend), 20 tests |

## Bugs found and fixed

1. **The quiz used fake votes for real parties.** `lib/afinidade.ts` scored
   users against `MOCK_VOTACOES`. It now uses 8 real, divisive votes from the
   XVII legislature, loaded live from openAR. I checked each one against the API.
2. **Deputy profiles were broken in production.** The openAR detail endpoint
   no longer returns `mandatos`, so every profile showed "Deputado não
   encontrado". Party and constituency now come from the deputies list.
3. **Party names in party colours were unreadable in dark mode** (for example
   CH `#003399` on `#111`). They now use a colour dot plus normal text.
4. **The DESIGN.md vote colours fail WCAG AA as text on their own tints**
   (2.3–3.9:1). Text now uses darker shades of each colour (≥ 4.5:1), and bars
   keep the spec colours.
5. **The RAG eval set had a bug:** the pattern `absten` never matched
   "absteve-se". A unit test caught it.
6. `zustand/middleware` broke the web build with an `import.meta` error and a
   blank app. I caught this in the browser before pushing and replaced it with
   plain localStorage code.

## UI overhaul (follows `.claude/DESIGN.md`)

- Inter, Cívico blue, pill chips, 18px cards, vote-count pills, result
  badges, and the content width capped at 720px on desktop.
- **Feed:** summary strip, new cards, pull to refresh, a retry button on errors.
- **Vote detail:** parties grouped by how they voted, with seat counts. The
  list of 230 deputies is now opt-in.
- **Deputies:** search that ignores accents, party filter chips.
- **Deputy profile:** new header, stat pills, history filter by position.
- **Compare (new; it was "em construção" before):** how often two parties
  agree across all 2,341 votes, a breakdown by theme, recent votes where they
  split, and a "% in favour" ranking.
- **Quiz:** real votes. A party that was absent from a vote isn't scored on
  that question, and every answer links to the actual vote.
- **Settings:** the theme choice is saved, and there's a new "Sobre" section.

I checked every screen in a browser, at phone width, in light and dark mode.

## Security review

**Web**
- CSP: scripts from the site only, plus Expo's inline script allowed by hash.
  Data only from `api.openar.pt`, photos from `cdn.openar.pt`, and the site
  can't be framed. Also nosniff, DENY framing, HSTS, Referrer-Policy and
  Permissions-Policy. I tested it locally with the same headers: no violations.
- A test fails if Expo changes the inline script, so the CSP hash can't
  silently drift.
- `npm audit`: down from 34 to 19 advisories, with no critical ones left. The
  remaining high ones need **Expo SDK 58** (`expo-router` → `query-string`), or
  are build-time only (`postcss`, `image-size`). The SDK upgrade is a
  separate, larger job.
- There are no secrets in the repo or its git history. There are no
  `dangerouslySetInnerHTML` uses with data (only one static style string).

**Backend**
- `/ask` is rate-limited per client (10 per minute), using the socket address
  and not the spoofable `X-Forwarded-For` header.
- Errors from the LLM provider aren't passed through to the user.
- In `find_votes`, LIKE wildcards are escaped. All SQL is parameterised, and
  FTS input is quoted (tested against injection strings).
- Ingest only downloads documents from `parlamento.pt` hosts (blocking SSRF)
  and caps the file size.
- The tools are read-only, so text injected into a bill can't make the model
  change any data.
- `.env` is git-ignored, and the CORS origin list is explicit.

## Tests

```bash
cd votoclaro && npm test && npm run typecheck   # 80 tests
cd backend && .venv/bin/pytest                  # 68 tests
cd backend && .venv/bin/votoclaro eval retrieval # recall@5 100%, MRR 0.88 (hybrid)
```

## Not done or needs you

- **The backend isn't deployed.** The Perguntar tab shows "Disponível em
  breve" until `EXPO_PUBLIC_RAG_API_URL` is set in Vercel. Then also add that
  URL to the CSP `connect-src`.
- **The Expo SDK 58 upgrade** would clear the remaining audit advisories.
- **Topic tagging** still puts most bills in "Outros". The plan is to classify
  them with the LLM.
