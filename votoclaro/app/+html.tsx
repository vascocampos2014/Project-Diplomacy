import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#2C2C2D" />

        <meta name="description" content={DESCRICAO} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VotoClaro" />
        <meta property="og:title" content="VotoClaro — Como vota o Parlamento" />
        <meta property="og:description" content={DESCRICAO} />
        <meta property="og:locale" content="pt_PT" />
        <meta name="twitter:card" content="summary" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const DESCRICAO =
  'Vê como cada partido e deputado votou nas leis da Assembleia da República. Dados públicos e oficiais, sem opiniões.';

// Superfícies do browser (seleção, foco, barra de deslocamento, algarismos)
// também levam a paleta do boletim.
const responsiveBackground = `
:root { color-scheme: light dark; }
body { background-color: #F8F9FA; -webkit-tap-highlight-color: transparent; }
html { touch-action: manipulation; }
@media (pointer: fine) { html { overscroll-behavior: none; } }
[role='heading'] { text-wrap: balance; }
::selection { background: #C9E2F2; color: #232323; }
*:focus-visible { outline: 2px solid #449DD1; outline-offset: 2px; border-radius: 2px; }
input, textarea { caret-color: #120A8F; }
* { scrollbar-width: thin; scrollbar-color: #B8BDC4 transparent; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #B8BDC4; border-radius: 5px; border: 2px solid #F8F9FA; }
@media (prefers-color-scheme: dark) {
  body { background-color: #232323; }
  ::selection { background: #2F5A75; color: #F1F2F4; }
  input, textarea { caret-color: #449DD1; }
  * { scrollbar-color: #55585D transparent; }
  ::-webkit-scrollbar-thumb { background: #55585D; border-color: #232323; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}`;
