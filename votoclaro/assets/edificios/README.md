# Edifícios (building images)

Each tab has a Portuguese landmark at the top, framed in an azulejo window
(`components/Azulejo.tsx` › `JanelaAzulejo`). Until a file exists here, the tab shows only the tile band.

| File | Building | Used on |
|---|---|---|
| `sao-bento.png` | Palácio de São Bento, Lisboa (the Assembleia da República) | Votações (feed) |
| `torre-belem.png` | Torre de Belém, Lisboa | Deputados |
| `jeronimos.png` | Mosteiro dos Jerónimos, Lisboa | reserved |
| `pena.png` | Palácio da Pena, Sintra | reserved |

## Format

- PNG, **1600 × 800** (2:1). The building centred, filling about 85% of the width, nothing cropped.
- **Black ink only, on a flat Bright Snow `#F8F9FA` background** (not transparent, not white, no paper texture).
  The window is always light, even in dark mode.
- No text, no signature, no frame, no people, no cars, no sky colour, no shadow on the ground beyond the drawing's own hatching.
- Keep each file under ~400 KB. Without an image converter installed, ship the PNG as is.

## Prompt (Higgsfield or any image model)

Same style for every building, so the set looks like one series. Replace `{BUILDING}`:

> 19th-century steel engraving of {BUILDING}, frontal elevation, centred, black ink only, fine parallel
> hatching and cross-hatching for shadows, crisp clean linework like an old banknote or postage stamp
> vignette, flat plain #F8F9FA off-white background, no text, no border, no people, no colour, no paper
> texture, wide 2:1 composition

`{BUILDING}`:

- `the Palácio de São Bento in Lisbon, the Portuguese Parliament: neoclassical facade with a wide staircase, eight-column portico and triangular pediment`
- `the Torre de Belém in Lisbon: Manueline limestone tower on a bastion at the river's edge, with turrets and arched loggia`
- `the Mosteiro dos Jerónimos in Lisbon: long Manueline facade with the ornate south portal`
- `the Palácio da Pena in Sintra: romantic hilltop palace with towers and domes`

Then check each result by eye: accurate architecture (count the columns on São Bento: 8), no invented details,
no garbled text, even hatching. Reject anything that looks smooth, glossy or "AI". The guidelines ask for real
illustration or none.

## Wiring a new image

In `votoclaro/constants/Edificios.ts`, replace `imagem: null` with a require:

```ts
'sao-bento': { nome: 'Palácio de São Bento, Lisboa', imagem: require('@/assets/edificios/sao-bento.png') },
```

Record where the image came from (tool, prompt, date) in the table above, so its provenance stays with it.
