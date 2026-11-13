---
version: 1
slug: "votoclaro"
primary_target: "votoclaro"
related_targets: []
---

Scope: the VotoClaro web app (Expo web), every tab and detail screen. Mode: Operate.
Audience: young voters on a phone who don't know politics. Task: see what was voted lately, the result, and who voted how, in seconds.
Constraints: user palette (#F8F9FA primary, #232323 secondary, #120A8F and #449DD1 accents), logo image as-is, neutrality, AA contrast, pt-PT copy.
Memorable moment: the ✕ is drawn into the square box, like a pen on a ballot.
Unresolved: native (iOS/Android) pass comes later; dark mode follows the same world.

## Direction contract

THESIS: Every vote is shown as a ballot slip, the paper every Portuguese voter recognises: ruled rows, square boxes, the ✕. It refuses the civic-tech card stack of pill chips, stat tiles, coloured edge stripes and soft shadows.

OWN-WORLD: Bright Snow ground. White slips with square corners and 1.5px Carbon ink rules, hairline row dividers, and no shadows. Dark Ultramarine is the ballot pen: the ✕ marks, links, primary actions and the result stamp. Blue Bell marks only where you are (active tab, focus ring, selection) plus the logo. Vote colours appear only in tallies and the fixed 230-seat bar. Public Sans throughout, with tabular figures and tracked caps for printed-ballot headings.

STORY: The visitor sees the latest votes, understands the result and who voted how without knowing procedure, opens a vote for the full ballot of every party, then follows deputies, asks a question, or compares parties.

FIRST VIEWPORT: The top bar has the logo icon and wordmark at the left. Tabs sit at the bottom on phones and become a text nav in the top bar on desktop. Below that is a ruled day heading ("28 Out · 6 votações"). The first slip shows the reference in tracked caps, the title in 17px, then the result stamp (✓ APROVADA in an ultramarine box or ✕ REJEITADA in carbon) beside the tally, the 230-seat bar, and a three-row ballot (A favor / Contra / Abstenção), each row with a square box carrying a ✕ when any party voted that way, followed by the party acronyms. Tapping the slip opens the full ballot. The primary action is reading; no CTA.

FORM: IMPECCABLE’S PICK, the ballot paper (the top of my grounded list, chosen by the user over the assigned news broadcast). seed:3192c953c15deb23. Signature interaction: the ✕ is stroked into its box (two 210ms strokes with an 80ms beat, on the transitions.dev scale) as a slip comes into view and on the vote detail. Motion grammar: one 200ms ease-out for every state change; reduced motion shows marks already drawn.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
