# VotoClaro design system: "Azulejo"

Chosen by the user on 2026-11-14 from a round of mockups, replacing the "ballot paper" world of 2026-11-13.
References the user liked: Oku (ink illustration, generous white, solid dark button + soft grey button),
LookUp (big bold blue headlines, one-colour icons), Quartz (editorial front page). This file is the source of
truth for the app's look; `PRODUCT.md` holds product truth and `.impeccable/surfaces/votoclaro.md` the direction contract.

## The world in one paragraph

Bright Snow paper, Portuguese **azulejo** tiles in Dark Ultramarine as the identity, and Portuguese landmarks
(São Bento, Torre de Belém, Jerónimos, Pena) framed in a tile "window" at the top of each tab. Vote results are
drawn **in ink, never in green/red**: an engraved hemicycle where *a favor* is solid ink, *contra* is hatched,
*abstenção* is empty paper and *ausentes* is grey. Headlines are big, heavy and Ultramarine. Cards are soft
(14px), filters are pills, primary buttons are solid Carbon.

## Colour

Tokens live in `votoclaro/constants/Colors.ts`. The user's palette, read left to right:

| Role | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F8F9FA` Bright Snow | `#232323` Carbon | Page |
| `surface` | `#FFFFFF` | `#2C2C2D` | Cards |
| `text` | `#232323` Carbon | `#F1F2F4` | Body, primary button fill |
| `tint` / `tintInk` | `#120A8F` Ultramarine | `#449DD1` / `#7FBFE6` | Headlines, links, selected chips, azulejo |
| `tintBg` | `#E8E7F4` | `#1F3A4D` | Theme tags, chip hover |
| `marcador` | `#449DD1` Blue Bell | same | Only "where you are": focus ring (the desktop nav marks the active item with a hanging tile) |
| `azulejo` / `azulejoFundo` | `#120A8F` on `#FFFFFF` | `#449DD1` on `#2C2C2D` | Tile pattern |

Contrast limits: `#449DD1` on `#F8F9FA` is 2.85:1, so it is never text in light mode. `#120A8F` on `#232323` is
1.1:1, so in dark mode the pen becomes Blue Bell.

**Vote "ink" (rule: No Traffic Lights).** `favor`, `contra`, `abstencao`, `ausente` are ink, not hues:
solid ink, hatched ink, paper with an outline, grey. Meaning is carried by texture *and* words *and* numbers,
never colour alone. Party colours (`constants/CORES_PARTIDOS.ts`) appear only as small dots next to acronyms.

## Type

Public Sans only (`constants/Typography.ts`), tabular figures for counts.

- `manchete` 28/32 ExtraBold, Ultramarine: the vote title on the feed lead and the vote detail.
- `displayLg` 30 ExtraBold: tab titles ("Votações", "Deputados").
- Section headings (`TituloSecao`): 19 ExtraBold, sentence case, no rule, no caps, no eyebrow above.
- `title` 16 Bold: card titles. `bodySm` 15, `caption` 13.
- Uppercase appears only inside the result stamp.

## Shape

`constants/Spacing.ts`: cards 14px, buttons and fields 10px, filters and tags are pills, the stamp 5px.
Elevation is declared once: a hairline `border` on white. No shadows. The lead story has no frame at all.

## Components

- **Azulejo** (`components/Azulejo.tsx`). `FaixaAzulejo` is the tile band, geometry drawn in SVG. Heights:
  14px strip under the top bar on detail and tool screens, 32px on tab screens without a building image,
  56px behind the deputy avatar, 64px under a building window. `CabecalhoEdificio` is a tab's header: the
  32px band, the landmark engraving and the screen title. The engraving has **no frame**: its paper is the page
  colour, its edges fade out (CSS mask), and in dark mode a partial inversion (0.884) turns the paper into
  `#232323` and the ink into light grey. On the phone the engraving sits under the band with the title below;
  on desktop the title is on the left and the engraving on the right.
- **Buildings** (`constants/Edificios.ts`, images in `votoclaro/assets/edificios/`). One landmark per tab:
  Votações → São Bento, Deputados → Torre de Belém, Perguntar → Jerónimos, Comparar → Casa da Música (Pena is
  reserved). Only in the screen headers, never in menus. Never put them in a frame, card or border. **Real images only**:
  while an image is missing the tab shows the tile band alone. Never draw a fake building in SVG.
- **Hemiciclo** (`components/Hemiciclo.tsx`). The 230-seat half ring split by position, with faint seat rows.
  Large on the feed lead and the vote detail, with the result stamp in the centre; `mini` (64px) on feed cards,
  where *contra* becomes solid grey because hatching does not read at that size. `LegendaVotos` and `Amostra`
  repeat the textures next to numbers.
  `VotoIndicator` is the same swatch plus the word ("A favor"), used in lists (deputy history, Comparar,
  the deputy list on a vote). There are no ✓/✗ glyphs for votes.
- **BarraComputador** (`components/BarraComputador.tsx`, ≥ 900px; the phone keeps `BarraTopo` + the capsule).
  A 72px Ultramarine azulejo panel (pattern lines `#2A22A8`, always Ultramarine, also in dark mode) with white
  text; each item sits on a solid Ultramarine chip so it never reads over the tile lines. The active page, or the
  open menu, is marked by **one tile hanging under the item**, half on the bar and half below it; there is no
  underline or pill. Votações, Deputados and Aprender open a full-width white menu (columns: themes and the
  latest vote; parliamentary groups with their counts and the deputies links; glossary and "Sobre"; no building engravings); Perguntar
  and Comparar are plain links. Hover opens after 140ms, click toggles, Escape closes and returns focus, a click
  outside closes. The search pill goes to Deputados (`?q=`). On desktop the top tile strips (≤ 32px) are not drawn,
  because the bar is the tile band.
- **BarraSeparadores** (`components/BarraSeparadores.tsx`, phone widths only; desktop navigates from the top bar).
  A floating capsule, 68px tall, 16px from the sides and 12px above the safe area, max 440px wide. Frosted
  paper (`surface` at 85% with a backdrop blur, web only; solid on native) and a hairline border, no shadow.
  The active tab sits in a soft `tintBg` pill with Ultramarine icon and bold label; the pill slides between
  tabs. Content scrolls under it, so tab screens add `useEspacoBarra()` to their bottom padding.
- **Carimbo**: the result stamp ("APROVADA" in Ultramarine, "CHUMBADA" in Carbon), tilted −4°.
- **VotacaoCard**: `destaque` is the feed's lead story (tag, Ultramarine headline, hemicycle, legend, parties by
  position, "Ver a votação completa ›"); otherwise a white card with tag, title, "Aprovada · 149–69 · date",
  reference, mini hemicycle and the parties that voted each way.
- **Chip**: pill filter, Ultramarine outline, filled when selected. **Etiqueta**: read-only theme tag.
- **Botao**: primary solid Carbon (hover Ultramarine), secondary soft grey with no outline.

## Desktop (≥ 900px)

The phone layout is one 760px reading column. From 900px the tab screens and the vote detail use the wide
page (`MAX_WIDTH_LARGO`, 1200px, `<Contentor largo>`), and the top bar aligns to it. `useDisposicao()` in
`components/ui.tsx` gives `desktop` and `colunas` (2 from 900px, 3 from 1280px).

- **Votações**: a front page. The header has the title and theme filters on the left and São Bento on the right.
  The lead vote is two columns (tag, 44px Ultramarine headline, reference,
  parties by position on the left; the large hemicycle on the right), closed by a hairline. Recent votes
  are a grid of equal-height cards.
- **Votação**: the title spans the page; below, the hemicycle on the left and a 400px side column on the
  right ("Quem votou como", party names, glossary link, Perguntar/Partilhar). The deputy list is a grid.
- **Deputados**: search capped at 480px; each deputy is its own card in a 2–3 column grid.
- **Comparar**: party pickers, the percentage card and "Votos a favor por partido" on the left (460px);
  "Por tema" and "Onde divergiram" on the right.
- Reading screens (Glossário, Definições, deputy profile, Perguntar) stay in the 760px column.

## Link previews (share images)

A shared vote link (`/votacao/:id?iniciativaId=…`) shows a 1200×630 card, drawn by the Vercel function
`votoclaro/api/og.ts` (`@vercel/og`, layout in `api/_og/imagem.ts`). It sits in the same world: an azulejo band on top, the reference
and date in muted grey, the title in Public Sans 800 Ultramarine (clamped to 5 lines), the result stamp
(Aprovada filled Ultramarine, Chumbada an ink outline), and the engraved hemicycle with the ink legend. It is always light.
Link crawlers (WhatsApp, iMessage, Telegram, social networks; matched by user-agent in `vercel.json`) are
rewritten to `api/votacao.ts`, which returns only the meta tags. People get the normal static page.

## Motion

transitions.dev scale (`--duration-*`, `--ease-*` in `app/+html.tsx`, mirrored in `Motion` in Spacing.ts).
Web entrances are CSS keyframes on `[data-anim]`, set through `anim()` from `components/ui.tsx`.

- **The authored moment:** the hemicycle sweeps from left to right in 700ms with an exponential ease-out
  (requestAnimationFrame), then the stamp settles at 560ms (400ms, scale 1.6→1, −14°→−4°, no bounce).
- Lead headline: blurred rise (12px, 3px blur, 500ms). Feed cards: 8px rise, 400ms, 40ms stagger capped at 7.
- Page enter: 8px rise with 3px blur, 250ms. Building image: blur 8px → 0, 400ms.
- Comparar percentage: soft cross-blur (150ms) when the pair changes.
- Tab bar: the active pill slides to the new tab, 250ms smooth-out (instant with reduced motion).
- Press: scale 0.98; hover: border to Ultramarine, 150ms.
- `prefers-reduced-motion`: every `[data-anim]` is off and the hemicycle renders complete.

## Don'ts

Green/red for votes; eyebrow labels above headings; shadows; coloured side stripes; sketch-style SVG
illustrations or `feTurbulence` grain; a fake building where an image is missing; bounce easing.
