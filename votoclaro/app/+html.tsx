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
        {/* O tema escolhido em Definições (localStorage) aplica-se antes de o JS da app
            carregar; sem isto, quem escolheu claro num sistema escuro via um ecrã escuro. */}
        <script dangerouslySetInnerHTML={{ __html: temaGuardado }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const temaGuardado = `try{var t=localStorage.getItem('votoclaro-tema');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-tema',t)}catch(e){}`;

const DESCRICAO =
  'Vê como cada partido e deputado votou nas leis da Assembleia da República. Dados públicos e oficiais, sem opiniões.';

// Superfícies do browser (seleção, foco, barra de deslocamento, algarismos)
// também levam a paleta. Depois, o movimento: a escala transitions.dev
// (--duration-*, --ease-*) e as entradas [data-anim] usadas pelo helper
// anim() de components/ui.tsx. Tudo desliga com prefers-reduced-motion.
const responsiveBackground = `
:root {
  color-scheme: light dark;
  --duration-stagger: 40ms; --duration-micro: 80ms; --duration-quick: 150ms; --duration-fast: 250ms;
  --duration-medium: 350ms; --duration-slow: 400ms; --duration-very-slow: 500ms;
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: ease-in-out; --ease-out: ease-out; --ease-linear: linear;
  --ease-bounce: cubic-bezier(0.34, 1.36, 0.64, 1);
  --distance-micro: 4px; --distance-small: 6px; --distance-base: 8px; --distance-medium: 12px; --distance-large: 30px;
  --scale-large: 0.96; --scale-medium: 0.97; --scale-small: 0.98; --scale-tiny: 0.99;
  --blur-small: 2px; --blur-medium: 3px; --blur-large: 8px;
}
body { background-color: #F8F9FA; -webkit-tap-highlight-color: transparent; }
html { touch-action: manipulation; }
@media (pointer: fine) { html { overscroll-behavior: none; } }
[role='heading'] { text-wrap: balance; }
::selection { background: #C9E2F2; color: #232323; }
*:focus-visible { outline: 2px solid #449DD1; outline-offset: 2px; border-radius: 6px; }
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

@keyframes vc-pagina { from { opacity: 0; transform: translateY(var(--distance-base)); filter: blur(var(--blur-medium)); } }
@keyframes vc-subir { from { opacity: 0; transform: translateY(var(--distance-medium)); filter: blur(var(--blur-medium)); } }
@keyframes vc-item { from { opacity: 0; transform: translateY(var(--distance-base)); } }
@keyframes vc-carimbo {
  0% { opacity: 0; transform: scale(1.6) rotate(-14deg); }
  40% { opacity: 1; }
  100% { opacity: 1; transform: scale(1) rotate(-4deg); }
}
@keyframes vc-imagem { from { opacity: 0; transform: scale(1.02); filter: blur(var(--blur-large)); } }
@keyframes vc-troca { from { opacity: 0; filter: blur(var(--blur-small)); } }

[data-anim='pagina'] { animation: vc-pagina var(--duration-fast) var(--ease-smooth-out) both; }
[data-anim='titulo'] { animation: vc-subir var(--duration-very-slow) var(--ease-smooth-out) both; }
[data-anim='item'] { animation: vc-item var(--duration-slow) var(--ease-smooth-out) both; }
[data-i='1'] { animation-delay: calc(var(--duration-stagger) * 1); }
[data-i='2'] { animation-delay: calc(var(--duration-stagger) * 2); }
[data-i='3'] { animation-delay: calc(var(--duration-stagger) * 3); }
[data-i='4'] { animation-delay: calc(var(--duration-stagger) * 4); }
[data-i='5'] { animation-delay: calc(var(--duration-stagger) * 5); }
[data-i='6'] { animation-delay: calc(var(--duration-stagger) * 6); }
[data-i='7'] { animation-delay: calc(var(--duration-stagger) * 7); }
[data-i='8'] { animation-delay: calc(var(--duration-stagger) * 7); }
/* O carimbo desce e assenta (desaceleração exponencial, sem ressalto) quando
   o varrimento do hemiciclo (700ms) está quase no fim. */
[data-anim='carimbo'] { animation: vc-carimbo var(--duration-slow) var(--ease-smooth-out) 560ms both; }
[data-anim='imagem'] { animation: vc-imagem var(--duration-slow) var(--ease-smooth-out) both; }
[data-anim='troca'] { animation: vc-troca var(--duration-quick) var(--ease-in-out) both; }
/* A lista refeita depois de mudar um filtro: os dados mudaram no mesmo sítio,
   por isso é uma troca suave (pouca distância, um leve desfoque). */
@keyframes vc-lista { from { opacity: 0; transform: translateY(var(--distance-micro)); filter: blur(var(--blur-small)); } }
[data-anim='lista'] { animation: vc-lista var(--duration-fast) var(--ease-smooth-out) both; }
/* O azulejo pendurado por baixo do separador ativo: aparece como um badge,
   com um pequeno ressalto (só na entrada; nunca ressalta a sair). */
@keyframes vc-selo { from { opacity: 0; transform: rotate(45deg) scale(0.6); } }
[data-anim='selo'] { animation: vc-selo var(--duration-fast) var(--ease-bounce) both; }

/* Menu largo da barra do topo (transitions.dev › menu dropdown): cresce a partir
   da barra e encolhe um pouco ao fechar, mais depressa do que abre. */
[data-menu] {
  transform-origin: top center;
  will-change: transform, opacity;
  transition: transform var(--duration-fast) var(--ease-smooth-out), opacity var(--duration-fast) var(--ease-smooth-out);
}
[data-menu='entrar'] { opacity: 0; transform: scale(var(--scale-medium)); pointer-events: none; }
[data-menu='aberto'] { opacity: 1; transform: scale(1); }
[data-menu='sair'] {
  opacity: 0; transform: scale(var(--scale-tiny)); pointer-events: none;
  transition-duration: var(--duration-quick);
}
/* O fundo escurecido só esvanece, com as mesmas durações. */
[data-veu] { transition: opacity var(--duration-fast) var(--ease-smooth-out); }
[data-veu='entrar'], [data-veu='sair'] { opacity: 0; pointer-events: none; }
[data-veu='sair'] { transition-duration: var(--duration-quick); }
/* A seta do menu roda ao mesmo ritmo do menu. */
[data-seta] { transition: transform var(--duration-quick) var(--ease-smooth-out); }
[data-seta='aberta'] { transform: rotate(180deg); transition-duration: var(--duration-fast); }

@media (prefers-reduced-motion: reduce) {
  [data-anim] { animation: none !important; }
  [data-menu], [data-veu], [data-seta] { transition: none !important; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

/* Gravuras dos edifícios (components/Azulejo.tsx › Gravura): sem moldura, o
   papel funde-se com o fundo e as margens esbatem-se. */
[data-gravura] {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 14%, #000 86%, transparent 100%),
    linear-gradient(to bottom, #000 78%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to right, transparent 0, #000 14%, #000 86%, transparent 100%),
    linear-gradient(to bottom, #000 78%, transparent 100%);
  mask-composite: intersect;
}
/* Modo claro: o papel já é #F8F9FA, a cor da página. Modo escuro: uma inversão
   parcial (0.884) leva o papel #F8F9FA exatamente a #232323 e o traço preto a
   cinzento claro. Sem mix-blend-mode: a animação de entrada da página isola a
   imagem e o "blend" não teria nada por trás. */
[data-gravura='escuro'] { filter: invert(0.884); }
/* O edifício do cabeçalho do computador esbate-se em baixo, onde a folha da página assenta. */
[data-horizonte] { -webkit-mask-image: linear-gradient(180deg, #000 62%, transparent 98%); mask-image: linear-gradient(180deg, #000 62%, transparent 98%); }
/* A entrada com blur tem de manter a inversão, senão pisca papel claro. */
@keyframes vc-imagem-escuro { from { opacity: 0; transform: scale(1.02); filter: invert(0.884) blur(var(--blur-large)); } }
[data-gravura='escuro'][data-anim='imagem'] { animation-name: vc-imagem-escuro; }

/* Tema escolhido em Definições (atributo posto pelo script temaGuardado). */
html[data-tema='light'] { color-scheme: light; }
html[data-tema='light'] body { background-color: #F8F9FA; }
html[data-tema='dark'] { color-scheme: dark; }
html[data-tema='dark'] body { background-color: #232323; }
`;
