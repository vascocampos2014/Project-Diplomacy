# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

The web build (Expo web, deployed on Vercel) is designed first. The same Expo codebase also ships to iOS and Android later.

## Users

Young voters (16–30), on a phone, curious. Typically they open a link someone shared on social media,
or they heard about a law in the news, and want to see quickly what Parliament voted and how each
party voted. Many are not politically literate: they don't know parliamentary procedure, bill
numbers or party acronyms.

## Product Purpose

VotoClaro shows how the Portuguese Parliament (Assembleia da República) votes, so young people can
follow it without needing to understand politics first. Success means a first-time visitor understands
what was voted recently, whether it passed, and who voted for and against, within seconds of arriving.

## Positioning

It isn't confusing for someone who doesn't know politics: dense official records are turned into
something readable in seconds. Unlike parlamento.pt (complete but bureaucratic) or news sites (selective
and interpreted), it shows every recorded vote, plainly, as public fact.

## Operating Context

- Primary task: see what was voted lately. That's the feed of recent votes, with result and party positions.
- Secondary tasks: open a vote's detail, browse deputies, compare parties across topics, and ask a
  question in plain Portuguese ("Perguntar"), which returns an AI answer with clickable citations
  to the official documents.
- Data is live from the openAR API (built on Parliament's open data, XVII legislature). Votes are
  recorded per parliamentary group, not per deputy.

## Capabilities and Constraints

- Screens: Feed (`/`), Deputados, Deputado profile, Votação detail, Comparar, Perguntar, Glossário, Definições.
- The party affinity quiz was removed on 2026-11-13 and is not to be rebuilt without an explicit request.
- Expo SDK 54, Expo Router, React Native components rendered to web (react-native-web).
- User-facing copy is European Portuguese (pt-PT).

## Brand Commitments

- Name: **VotoClaro**. Tagline on the logo: "Transparência na Assembleia".
- Logo: the user's 3D blue ballot box with a check. Use the image as-is and never redraw it
  (`votoclaro/assets/brand/`).
- Palette, set by the user and read left to right: Bright Snow `#F8F9FA` is primary, Carbon Black `#232323`
  is secondary, and Dark Ultramarine `#120A8F` and Blue Bell `#449DD1` are accents.
- Desired character: professional, trustworthy, interactive.
- Must not look AI-generated.

## Evidence on Hand

- Real data from openAR: votes, results, party positions, deputies, and bill texts with links to the official documents.
- No testimonials, user numbers, press or endorsements exist. Never invent them.

## Product Principles

1. Facts, never opinions. Votes are public records; no evaluative wording, and no party favoured in
   order, colour weight or emphasis.
2. Readable in seconds by someone who doesn't know politics: plain words first, jargon explained where it appears.
3. Every claim traceable to its official source.
4. Show the vote, not the interface: the result and who voted how are the content; chrome stays out of the way.

## Accessibility & Inclusion

WCAG 2.1 AA: text contrast, a visible keyboard focus on web, labels on every control, and vote results never
conveyed by colour alone (symbols and words too). Respect `prefers-reduced-motion`.
