# Redesign brief: decisions so far (2026-11-13)

> **Status:** built. The user chose the "ballot paper" direction. The system now lives in `.claude/DESIGN.md`,
> `PRODUCT.md` and `.impeccable/surfaces/votoclaro.md`, and this file is kept as the record of the original brief.
> The typeface was decided: Public Sans.

Use this as the starting point for the UI overhaul, together with the skills the user installs
(Impeccable, transitions.dev, Vercel Web Interface Guidelines / audit-suite, frontend-design).
**Load those skills before designing anything.**

## Goal

Make the web app **professional, trustworthy and interactive**. The user's words: the current
app has "too much AI slop". Avoid generic AI-looking patterns: gradient blobs, emoji headings,
everything in rounded cards, pill chips everywhere, centred hero text, decorative icons on every
row, purple-blue gradients, glassmorphism, and vague microcopy.

- **Web version first** (Vercel), then native.
- Branch: `preview/redesign`, cut from `preview/ui-overhaul`. `preview/ui-overhaul` stays as the "before".
- **Rewrite `.claude/DESIGN.md`** from scratch around the palette below. The old identity
  (paper `#F7F6F2`, Cívico `#3D5AFE`) is replaced.

## Palette (from the user, read left to right)

| Role | Name | Hex | Notes |
|---|---|---|---|
| Primary | Bright Snow | `#F8F9FA` | Main background and surfaces. Light-first design. |
| Secondary | Carbon Black | `#232323` | Text, dark surfaces, and the base for dark mode. |
| Accent | Dark Ultramarine | `#120A8F` | Links, primary actions, emphasis. |
| Accent | Blue Bell | `#449DD1` | Highlights, data, selection, brand (matches the logo). |

Measured contrast (WCAG), to respect when assigning roles:

- `#232323` on `#F8F9FA`: 14.9. Body text OK.
- `#120A8F` on `#F8F9FA`: 13.6. Text and links OK. White on `#120A8F`: 14.3, so filled buttons OK.
- `#449DD1` on `#F8F9FA`: **2.85, which fails for text.** Use it only for fills, bars, icons ≥ 24px, and focus rings.
  White on `#449DD1` is 3.0 (large text only). `#232323` on `#449DD1` is 5.2, OK.
- Dark mode: `#449DD1` on `#232323` is 5.2, so it becomes the link/accent colour there. `#120A8F` on `#232323`
  is 1.1 and **unusable** in dark mode.
- Vote colours (favor/contra/abstenção/ausente) and party colours are data colours. Keep them
  semantically distinct from the brand blues, and AA-compliant as text (see the `*Ink` colours in `constants/Colors.ts`).

## Logo

The user's logo is a 3D isometric blue ballot box with a check, plus the "VotoClaro" wordmark and the tagline
"Transparência na Assembleia". **Use it as-is** (don't redraw it). Files are in `votoclaro/assets/brand/`:

- `logo-full.png`: the original, on its near-white `#F7FCFC` background
- `logo-full-transparent.png`: the original with a transparent background (icon, wordmark and tagline)
- `logo-icon.png`: just the ballot box, 512×512, transparent. Use it for the header mark, favicon and app icon.

The wordmark is a geometric sans: "Voto" in bold, "Claro" in regular, Carbon Black.
The type choice should sit well next to it.

## Still to decide (ask the user if unclear)

- Typeface. Currently Inter, Newsreader and Public Sans are loaded. Choose one deliberately to match the wordmark.
- Which screen to perfect first (suggested: the vote detail or the feed).
- Motion style. Follow transitions.dev once the skill is installed, and respect `prefers-reduced-motion`.

## Constraints that don't change

- Political neutrality rules in `/CLAUDE.md`.
- RAG answers render as plain text, and only parlamento.pt links open.
- Keep `npm test` and `npm run typecheck` green. The redesign must not break data logic in `lib/`.
- Accessibility: labels on every pressable, AA contrast, visible focus states on web, and keyboard navigation.
