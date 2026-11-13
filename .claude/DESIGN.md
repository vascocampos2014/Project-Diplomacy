---
name: VotoClaro
description: How the Portuguese Parliament votes, shown as the ballot paper every voter already knows.
colors:
  bright-snow: "#F8F9FA"
  carbon: "#232323"
  ultramarine: "#120A8F"
  blue-bell: "#449DD1"
  slip-white: "#FFFFFF"
  shaded-paper: "#EEF0F3"
  hairline: "#DADDE2"
  graphite: "#585D64"
  ultramarine-wash: "#E8E7F4"
  selection-wash: "#C9E2F2"
  favor: "#15803D"
  contra: "#B91C1C"
  abstencao: "#B45309"
  ausente: "#9CA3AF"
  favor-wash: "#E3F3E8"
  contra-wash: "#FBE7E7"
  abstencao-wash: "#FBEEDD"
  ausente-ink: "#4B5563"
  carbon-slip: "#2C2C2D"
  carbon-shaded: "#343537"
  night-text: "#F1F2F4"
  night-muted: "#A9AEB5"
  night-rule: "#8D9299"
  night-hairline: "#424448"
  blue-bell-ink: "#7FBFE6"
  blue-bell-wash: "#1F3A4D"
  night-selection: "#2F5A75"
  favor-night: "#4ADE80"
  contra-night: "#F87171"
  abstencao-night: "#FBBF24"
  party-ps: "#F0385C"
  party-psd: "#F97316"
  party-ch: "#003399"
  party-il: "#60A5FA"
  party-be: "#BE123C"
  party-pcp: "#DC2626"
  party-pan: "#16A34A"
  party-livre: "#7C3AED"
  party-cds-pp: "#0EA5E9"
  party-jpp: "#0D9488"
  party-default: "#9CA3AF"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.6px"
  headline:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "23px"
    letterSpacing: "-0.15px"
  body-lg:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "26px"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  section-head:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "1px"
  ballot-head:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.2px"
  stamp:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.6px"
  caption:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  data:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    fontFeature: "tnum"
  tally:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  badge: "2px"
  chip: "3px"
  card: "3px"
  sheet: "6px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
  huge: "48px"
components:
  slip:
    backgroundColor: "{colors.slip-white}"
    rounded: "{rounded.card}"
    padding: "16px"
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.slip-white}"
    rounded: "{rounded.chip}"
    padding: "0 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.chip}"
    padding: "0 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.shaded-paper}"
  ballot-option:
    backgroundColor: "transparent"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "0 8px"
    height: "36px"
  ballot-option-selected:
    backgroundColor: "{colors.ultramarine-wash}"
    textColor: "{colors.ultramarine}"
  ballot-option-hover:
    backgroundColor: "{colors.shaded-paper}"
  stamp-aprovada:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.slip-white}"
    typography: "{typography.stamp}"
    rounded: "{rounded.badge}"
    padding: "3px 8px 3px 6px"
  stamp-chumbada:
    backgroundColor: "transparent"
    textColor: "{colors.carbon}"
    typography: "{typography.stamp}"
    rounded: "{rounded.badge}"
    padding: "3px 8px 3px 6px"
  x-box:
    backgroundColor: "{colors.slip-white}"
    rounded: "{rounded.badge}"
    size: "18px"
  search-field:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.chip}"
    padding: "0 12px"
    height: "44px"
  top-bar:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.carbon}"
    height: "56px"
  tab-bar:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.graphite}"
    height: "64px"
  seat-bar:
    backgroundColor: "{colors.hairline}"
    height: "6px"
---

# Design System: VotoClaro

## Overview

**Creative North Star: "The Ballot Slip"**

Every vote in VotoClaro is drawn as the paper every Portuguese voter has held: a white slip with square corners, ruled in ink, with a row per option, a square box at the start of each row, and a ✕ made with a pen. The visitor reads a vote the way they would read a boletim de voto, without needing to know parliamentary procedure. The interface is that paper and nothing else. Hierarchy comes from ink weight, rule weight and type size, never from shadows, gradients or coloured tiles.

The world is bright, flat and quiet, so the votes carry the colour. Bright Snow is the table the slips lie on; white slips sit on it, ruled in Carbon. Dark Ultramarine is the pen: it marks the ✕, the links, the primary action and the "aprovada" stamp. Blue Bell is the "you are here" marker: the active tab, the focus ring, the text selection, and the logo. Vote colours (favor, contra, abstenção) live only inside data: the tally numbers and the 230-seat bar. Party colours live only in the small dots beside party acronyms.

The one authored motion is the pen: the ✕ is stroked into its box in two strokes when a slip comes into view and on the vote detail. Every other state change is a single 200ms ease-out. It rejects the civic-tech card stack: pill chips, stat tiles, coloured edge stripes and soft shadows.

**Key Characteristics:**
- White slips with near-square corners (3px) and 1.5px Carbon ink frames on a Bright Snow ground.
- Hairline dividers between ballot rows; a 1.5px ink rule under section and day headings.
- Dark Ultramarine as the single pen colour; Blue Bell only for location and focus.
- One family, Public Sans, with tabular figures for every count.
- The ✕ drawn into a square box is the signature mark and the only authored animation.
- No shadows anywhere. Depth is paper on table, drawn with rules.

## Colors

A cool paper-and-ink palette: two near-neutrals set by the user, one deep pen blue and one light marker blue, with vote and party colours held back for data.

### Primary
- **Bright Snow** (#F8F9FA): the ground of every screen, the table the slips lie on. The user's primary colour. Also the scrollbar track border in light mode.

### Secondary
- **Carbon Black** (#232323): all body text, headings, and the ink rules that frame slips, the top bar, the tab bar and section headings. Becomes the ground in dark mode. The "chumbada" stamp is drawn in Carbon as an outlined box.

### Tertiary
- **Dark Ultramarine** (#120A8F): the pen. The ✕ marks, links, the primary button fill, the "aprovada" stamp fill, the caret, the selected ballot option's frame and text, and the slip frame on hover or press. White on it measures 14.3:1.
- **Blue Bell** (#449DD1): the marker for "where you are": the 3px bar over the active phone tab, the 3px underline of the active desktop nav item, the 2px focus ring, and the logo. In dark mode it also becomes the pen (5.2:1 on Carbon), with **Light Blue Bell** (#7FBFE6) for pen-coloured text.

### Neutral
- **Slip White** (#FFFFFF): the paper of every slip, the top bar, the tab bar, the search field and the secondary button.
- **Shaded Paper** (#EEF0F3): hover fill for ballot options and secondary buttons.
- **Hairline Grey** (#DADDE2): the thin dividers between ballot rows, the slip's inner rule, and the "ausente" share of the seat bar.
- **Graphite** (#585D64): muted text (meta lines, captions, inactive tabs, placeholders, column headers). 6.3:1 on Bright Snow.
- **Ultramarine Wash** (#E8E7F4): the fill of a selected ballot option.
- **Selection Wash** (#C9E2F2): text selection, a light tint of Blue Bell with Carbon text.

### Data colours
- **Favor Green** (#15803D), **Contra Red** (#B91C1C), **Abstenção Amber** (#B45309), **Ausente Grey** (#9CA3AF): the four positions, used as fills in the seat bar and as tally numerals. Text uses the AA-safe ink variants (in light mode the same values; **Ausente Ink** #4B5563). Washes (#E3F3E8, #FBE7E7, #FBEEDD) back the VotoIndicator box.
- **Party colours** (party-* tokens): each party's official colour, shown only as an 8–9px dot beside its acronym on a neutral ground. Unknown parties fall back to #9CA3AF.

### Dark mode
The same world at night. Carbon (#232323) becomes the ground and Carbon Slip (#2C2C2D) the paper; rules lighten to #8D9299 and hairlines to #424448; text is #F1F2F4 with #A9AEB5 muted. Dark Ultramarine is dropped (1.1:1 on Carbon), so Blue Bell is the pen and Light Blue Bell (#7FBFE6) carries pen-coloured text. Vote inks brighten (#4ADE80, #F87171, #FBBF24).

### Named Rules
**The One Pen Rule.** Dark Ultramarine is the only ink that marks: the ✕, links, the primary action, the "aprovada" stamp. Nothing decorative is ever ultramarine.

**The Marker Rule.** Blue Bell says only "you are here": active tab, focus ring, selection, logo. In light mode it is never text (2.85:1 on Bright Snow).

**The Data-Only Colour Rule.** Vote colours appear only in tallies and the seat bar; party colours only as dots beside acronyms. Never text on a party colour, never a party colour as a fill, edge stripe or background.

## Typography

**Display Font:** Public Sans (with system-ui, sans-serif)
**Body Font:** Public Sans
**Label/Mono Font:** Public Sans, with tabular figures for counts

**Character:** A plain, very legible public-service sans used at five weights (400 to 800). It reads like printed official paper, not like a brand voice; hierarchy comes from weight and size.

### Hierarchy
- **Display** (700, 30px, 36px line, -0.6px): the screen title in CabecalhoEcra.
- **Headline** (700, 24px, 30px line, -0.4px): the title of a vote or deputy on detail screens.
- **Title** (600, 17px, 23px line, -0.15px): the law title on each feed slip, up to three lines.
- **Body Large** (400, 17px, 26px line): reading text on detail screens and Perguntar answers.
- **Body** (400, 15px, 22px line): subtitles and supporting copy, held to 560px.
- **Label** (600, 14px): ballot option text, ballot row labels (A favor / Contra / Abstenção).
- **Section Head** (700, 14px, 1px tracking, uppercase): the printed-ballot voice of TituloSecao and the feed's day headings ("28 Out · 6 votações"), always sitting on a 1.5px ink rule.
- **Ballot Head** (600, 11px, 0.2px tracking, uppercase): the column headers of the full ballot (PARTIDO / A FAVOR / CONTRA / ABST. / AUSENTE).
- **Stamp** (700, 12px, 0.6px tracking, uppercase): the result stamp text.
- **Caption** (400, 13px, 18px line): meta lines (reference, theme, date), seat counts, notes.
- **Tally** (700, 16px, tabular) and **Data** (700, 22px, tabular): vote counts.
- **Wordmark**: "Voto" at 800 and "Claro" at 400, 20px, -0.3px, set beside the logo icon.

### Named Rules
**The Heading-Is-The-Heading Rule.** Tracked caps exist only as the heading itself (section heads, day heads), as ballot column headers, and inside the stamp. Nothing ever sits above a heading as a label: no eyebrow, no kicker.

**The Tabular Rule.** Every count is set in tabular figures so tallies line up across slips.

## Layout

Single reading column, capped at 760px (MAX_WIDTH) and centred, with 16px side gutters on phones. Slips stack with 12px between them under ruled day headings (24px above, 12px below, 8px from text to rule). Section headings take 32px above and 12px below. Spacing runs on a 4px base (4, 8, 12, 16, 20, 24, 32, 48).

At 900px (LARGURA_DESKTOP) navigation moves: below it, a 64px bottom tab bar with icons and 11px labels; at and above it, the tab bar disappears and a text nav (15px, 20px apart) sits in the 56px top bar beside the logo. Rows of ballot options scroll horizontally and bleed to the screen edge on phones, and wrap onto lines on desktop so none is cut mid-column.

Touch targets hold at least 44px (search field, logo link) and 48px for buttons and full-ballot rows.

## Elevation & Depth

Flat. There are no shadows in the system. Depth is paper on a table: white slips on Bright Snow, separated by a 1.5px Carbon ink frame. Inside a slip, hairline rules separate rows. The top bar and tab bar are the same paper, cut off from content by a 1.5px ink rule. Interaction is shown by the frame changing to the pen colour and a slight press dim (0.8 opacity), never by lifting.

### Named Rules
**The Paper-Not-Plastic Rule.** No box-shadow, no glow, no blur. If something needs separating, draw a rule.

## Shapes

Cut paper with near-square corners: 3px on slips, buttons, fields and options; 2px on the ✕ box and the stamp; 6px only on overlaid sheets (the Perguntar answer panel). The only round shapes are party dots (999px) and the ✕ strokes' rounded ends. Lines come in three weights: 1.5px ink (slip frames, section rules, bars, buttons, search field, ✕ boxes of 18px and up), 1px (plain sections and smaller boxes), and hairline (row dividers). The seat bar is square-ended with 2px gaps between segments.

## Components

### The Slip (VotacaoCard)
The feed's unit and the product's signature. A white slip with a 1.5px ink frame, read top to bottom: the law title (Title), a caption meta line (reference, theme, date), the result stamp beside the tally, the 230-seat bar, then a hairline-ruled ballot of three rows (A favor / Contra / Abstenção). Each row has an 18px ✕ box, marked when any party voted that way, a 76px label, and the party acronyms with their dots ("Nenhum partido" in Graphite when empty). The whole slip is a link: hover or press turns the frame ultramarine over 200ms.

### The Full Ballot (BoletimCompleto)
One row per party (sorted by seats), one column per position (A favor / Contra / Abst. / Ausente), with a 22px ✕ box in each cell and the ✕ drawn in the party's column. Ballot Head column headers in Graphite on a 1.5px ink rule; 48px rows divided by hairlines; party acronym in 700 15px with its dot and seat count.

### The ✕ Box (MarcaX)
A square box (2px radius, 1.5px ink border at 18px and up, 1.25px below) with an ultramarine ✕ inset 20%. When animated, the ✕ is drawn as two strokes of 210ms each with an 80ms beat between, ease-out cubic, scaling from the stroke's left end. With reduced motion it appears already drawn.

### Result Stamp (ResultadoBadge)
A small square stamp, uppercase Stamp type with an icon. "Aprovada": filled ultramarine with white text and a check. "Chumbada": outlined Carbon with a close icon. "Pendente": outlined Graphite with a clock. Result is never colour alone.

### Tally and Seat Bar (ContagemVotos, BarraProgresso)
Counts as "91 a favor · 79 contra · 60 abstenção" in tabular Tally numerals coloured by position with Caption legends; absent only shows when non-zero. The seat bar is 6px high and always on the same 230-seat scale so two votes compare by eye; it never animates.

### Buttons (Botao)
- **Shape:** near-square (3px), 48px tall, 20px side padding, 1.5px border.
- **Primary:** ultramarine fill and border, white 600 15px label, optional 18px icon.
- **Secondary:** white paper with an ink border; on hover, Shaded Paper fill and an ultramarine border.
- **Press / Disabled:** 0.8 opacity on press, 0.45 when disabled.

### Ballot Options (Chip)
Filters are ballot options, not pills: a 14px ✕ box, an optional party dot, and a Label. Unselected: transparent with no frame; hover fills Shaded Paper. Selected: ultramarine 1px frame, Ultramarine Wash fill, ultramarine text, and the ✕ drawn into the box. Rows of options use LinhaOpcoes.

### Cards / Containers (Cartao)
- **Corner Style:** 3px.
- **Background:** Slip White.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px ink for plain sections, 1.5px ink (`tinta`) for slips.
- **Internal Padding:** 16px; slips with ballots set padding to 0 and pad their parts.

### Inputs / Fields (CampoPesquisa)
The one search field: 44px tall, white paper, 1.5px ink border, 3px corners, a 20px Graphite search icon, 16px Regular text with a Graphite placeholder and an ultramarine caret. Focus shows the 2px Blue Bell ring with 2px offset.

### Navigation (BarraTopo, tab bar)
- **Top bar:** 56px white paper with a 1.5px ink rule beneath; logo icon (28px, the user's image as-is) plus the wordmark at left, a back arrow in pen colour on detail screens, the menu at right.
- **Desktop nav:** text links (500 15px) in Graphite; the active one turns Carbon at 600 with a 3px Blue Bell underline.
- **Phone tab bar:** 64px white paper with a 1.5px ink rule above; 22px icons with 600 11px labels; active tab in pen colour with a 28×3px Blue Bell bar above the icon.

### Section Heading (TituloSecao) and Notice (Aviso)
Section headings are Section Head text on a 1.5px ink rule, with an optional caption note at right. Notices are a Caption line in Graphite with a 16px info icon above a hairline rule: a footnote on the slip, not a coloured callout.

### Browser surfaces
Selection in Selection Wash (night: #2F5A75); focus ring 2px Blue Bell with 2px offset; caret ultramarine (night: Blue Bell); thin scrollbars with a #B8BDC4 thumb (night: #55585D); headings balanced; reduced motion collapses all transitions.

## Do's and Don'ts

### Do:
- **Do** draw every vote as a slip: white paper, 3px corners, 1.5px Carbon frame, hairline rows, square ✕ boxes.
- **Do** keep Dark Ultramarine (#120A8F) for the pen only: ✕ marks, links, primary action, "aprovada" stamp.
- **Do** keep Blue Bell (#449DD1) for "you are here": active tab, focus ring, selection, logo; switch the pen to Blue Bell in dark mode.
- **Do** pair every result and position with a word and an icon or mark, never colour alone.
- **Do** use one 200ms ease-out (cubic-bezier(0.16, 1, 0.3, 1)) for every state change, and keep the two-stroke ✕ (210ms + 80ms + 210ms) as the only authored motion.
- **Do** show the 230-seat bar at a fixed scale and without animation.
- **Do** set counts in tabular figures.
- **Do** use the logo image from votoclaro/assets/brand/ as supplied.

### Don't:
- **Don't** add shadows, glows or blur; separate with rules.
- **Don't** put a label, eyebrow or kicker above a heading; tracked caps are only the heading itself, ballot column headers and the stamp.
- **Don't** use pill-shaped chips, stat tiles or coloured edge stripes; filters are ballot options with ✕ boxes.
- **Don't** set Blue Bell as text in light mode, or Dark Ultramarine on Carbon in dark mode.
- **Don't** put text on a party colour or use a party colour as a fill or background; give no party more colour weight, size or position than its data warrants.
- **Don't** redraw, recolour or restyle the logo.
- **Don't** use vote colours outside tallies, the seat bar and the position indicator.
