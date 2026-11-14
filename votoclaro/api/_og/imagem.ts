// A imagem de pré-visualização de uma votação (1200×630, Open Graph), no
// mundo azulejo: faixa de azulejos no topo, título grande em Ultramarine,
// o carimbo do resultado e o hemiciclo gravado a tinta (cheio / tracejado /
// papel / cinzento, nunca verde e vermelho). Sempre em modo claro.
// Ver .claude/DESIGN.md › Pré-visualização de ligações.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Sentido, VotacaoPartilha } from './votacao';

export const LARGURA = 1200;
export const ALTURA = 630;

const C = {
  papel: '#F8F9FA',
  branco: '#FFFFFF',
  tinta: '#232323',
  cinza: '#585D64',
  ausente: '#C9CDD3',
  ultramarino: '#120A8F',
  linha: '#DADDE2',
};

// Árvore de elementos no formato que o satori aceita (sem JSX nem React).
type No = { type: string; props: Record<string, unknown> };
type Filho = No | string | null;
function el(type: string, style: Record<string, unknown>, ...children: Filho[]): No {
  const filhos = children.filter((c) => c !== null);
  return { type, props: { style, children: filhos.length === 1 ? filhos[0] : filhos } };
}
const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
function img(src: string, width: number, height: number): No {
  return { type: 'img', props: { src, width, height, style: { width, height } } };
}

// O azulejo de components/Azulejo.tsx (unidades 32×32).
const AZULEJO = `
<rect width="32" height="32" fill="${C.branco}"/>
<rect x="0.8" y="0.8" width="30.4" height="30.4" fill="none" stroke="${C.ultramarino}" stroke-width="1.6"/>
<circle cx="16" cy="16" r="6" fill="none" stroke="${C.ultramarino}" stroke-width="1.6"/>
<path d="M0 9 A9 9 0 0 0 9 0 M23 0 A9 9 0 0 0 32 9 M32 23 A9 9 0 0 0 23 32 M9 32 A9 9 0 0 0 0 23 M16 4 L19 10 M16 4 L13 10 M16 28 L19 22 M16 28 L13 22 M4 16 L10 13 M4 16 L10 19 M28 16 L22 13 M28 16 L22 19" fill="none" stroke="${C.ultramarino}" stroke-width="1.6"/>
<circle cx="16" cy="16" r="2.2" fill="${C.ultramarino}"/>`;

function faixaAzulejo(altura: number, lado = altura): string {
  const s = lado / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${altura}">
<defs><pattern id="a" width="${lado}" height="${lado}" patternUnits="userSpaceOnUse"><g transform="scale(${s})">${AZULEJO}</g></pattern></defs>
<rect width="${LARGURA}" height="${altura}" fill="url(#a)"/></svg>`;
}

// O hemiciclo de components/Hemiciclo.tsx, com a mesma geometria.
const CX = 120;
const CY = 122;
const R_EXT = 118;
const R_INT = 40;
const ponto = (r: number, t: number) => `${(CX + r * Math.cos(t)).toFixed(2)} ${(CY - r * Math.sin(t)).toFixed(2)}`;
function setor(a: number, b: number) {
  const t0 = Math.PI * (1 - a);
  const t1 = Math.PI * (1 - b);
  return `M${ponto(R_EXT, t0)} A${R_EXT} ${R_EXT} 0 0 1 ${ponto(R_EXT, t1)} L${ponto(R_INT, t1)} A${R_INT} ${R_INT} 0 0 0 ${ponto(R_INT, t0)} Z`;
}
const ORDEM: Sentido[] = ['favor', 'contra', 'abstencao', 'ausente'];
const TRACEJADO = `<pattern id="t" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="3.4" height="3.4" fill="${C.branco}"/><line x1="0" y1="0" x2="0" y2="3.4" stroke="${C.tinta}" stroke-width="1.2"/></pattern>`;
const PREENCHER: Record<Sentido, string> = { favor: C.tinta, contra: 'url(#t)', abstencao: C.branco, ausente: C.ausente };

function hemiciclo(contagem: Record<Sentido, number>): string {
  const total = ORDEM.reduce((s, k) => s + contagem[k], 0) || 1;
  let acc = 0;
  const setores = ORDEM.map((k) => {
    const a = acc / total;
    acc += contagem[k];
    if (contagem[k] <= 0) return '';
    const tracoCor = k === 'ausente' ? C.ausente : C.tinta;
    return `<path d="${setor(a, acc / total)}" fill="${PREENCHER[k]}" stroke="${tracoCor}" stroke-width="1.3" stroke-linejoin="round"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 124" width="440" height="227"><defs>${TRACEJADO}</defs>${setores}<line x1="2" y1="123" x2="238" y2="123" stroke="${C.tinta}" stroke-width="1.3"/></svg>`;
}

// A amostra de tinta da legenda (components/Amostra.tsx).
function amostra(k: Sentido): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="26" height="26"><defs><pattern id="t" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="3" height="3" fill="${C.branco}"/><line x1="0" y1="0" x2="0" y2="3" stroke="${C.tinta}" stroke-width="1.1"/></pattern></defs><rect x="1" y="1" width="10" height="10" rx="2" fill="${PREENCHER[k]}" stroke="${k === 'ausente' ? C.ausente : C.tinta}" stroke-width="1"/></svg>`;
}

const ROTULO: Record<Sentido, string> = { favor: 'a favor', contra: 'contra', abstencao: 'abstenção', ausente: 'ausentes' };

function tamanhoTitulo(t: string): number {
  if (t.length <= 70) return 60;
  if (t.length <= 120) return 50;
  if (t.length <= 180) return 42;
  return 36;
}

export function arvoreVotacao(v: VotacaoPartilha): No {
  const tamanho = tamanhoTitulo(v.titulo);
  const aprovada = v.resultado === 'Aprovada';
  const carimbo = el(
    'div',
    {
      display: 'flex',
      padding: '8px 20px',
      borderRadius: 6,
      border: `3px solid ${aprovada ? C.ultramarino : C.tinta}`,
      backgroundColor: aprovada ? C.ultramarino : 'transparent',
      color: aprovada ? C.branco : C.tinta,
      fontSize: 30,
      fontWeight: 800,
    },
    v.resultado
  );

  const legenda = el(
    'div',
    { display: 'flex', flexWrap: 'wrap', width: 440, marginTop: 24, rowGap: 14 },
    ...ORDEM.map((k) =>
      el(
        'div',
        { display: 'flex', alignItems: 'center', width: 220, fontSize: 26, color: C.tinta },
        img(svgUri(amostra(k)), 26, 26),
        el('div', { display: 'flex', marginLeft: 12, fontWeight: 800 }, String(v.contagem[k])),
        el('div', { display: 'flex', marginLeft: 8, color: C.cinza }, ROTULO[k])
      )
    )
  );

  return el(
    'div',
    { display: 'flex', flexDirection: 'column', width: LARGURA, height: ALTURA, backgroundColor: C.papel, fontFamily: 'Public Sans' },
    img(svgUri(faixaAzulejo(48)), LARGURA, 48),
    el(
      'div',
      { display: 'flex', flex: 1, padding: '48px 64px 40px', gap: 48 },
      el(
        'div',
        { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
        el('div', { display: 'flex', fontSize: 24, color: C.cinza }, [v.referencia, v.data].filter(Boolean).join(' · ')),
        el(
          'div',
          {
            display: 'block',
            marginTop: 18,
            fontSize: tamanho,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -tamanho * 0.02,
            color: C.ultramarino,
            lineClamp: 5,
          },
          v.titulo
        ),
        el(
          'div',
          { display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 28, gap: 18 },
          carimbo,
          v.unanime ? el('div', { display: 'flex', fontSize: 26, color: C.cinza }, 'por unanimidade') : null
        )
      ),
      el(
        'div',
        { display: 'flex', flexDirection: 'column', width: 440, justifyContent: 'center' },
        img(svgUri(hemiciclo(v.contagem)), 440, 227),
        legenda
      )
    ),
    el(
      'div',
      {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '18px 64px',
        borderTop: `2px solid ${C.linha}`,
        fontSize: 22,
        color: C.cinza,
      },
      el('div', { display: 'flex', fontWeight: 800, color: C.ultramarino }, 'VotoClaro'),
      el('div', { display: 'flex' }, 'Como vota o Parlamento · dados públicos da Assembleia da República')
    )
  );
}

// Imagem genérica, quando a votação não existe ou a API falha.
export function arvoreGenerica(): No {
  return el(
    'div',
    { display: 'flex', flexDirection: 'column', width: LARGURA, height: ALTURA, backgroundColor: C.papel, fontFamily: 'Public Sans' },
    img(svgUri(faixaAzulejo(96, 48)), LARGURA, 96),
    el(
      'div',
      { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', padding: '0 64px' },
      el('div', { display: 'flex', fontSize: 96, fontWeight: 800, color: C.ultramarino, letterSpacing: -2 }, 'VotoClaro'),
      el('div', { display: 'flex', fontSize: 40, color: C.tinta, marginTop: 12 }, 'Como vota o Parlamento'),
      el('div', { display: 'flex', fontSize: 28, color: C.cinza, marginTop: 24 }, 'Dados públicos da Assembleia da República, sem opiniões.')
    )
  );
}

let fontesCache: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }[]> | null = null;

// Os ficheiros vão com a função (vercel.json › functions › includeFiles).
export function fontes() {
  fontesCache ??= Promise.all(
    ([
      [400, 'PublicSans_400Regular.ttf'],
      [600, 'PublicSans_600SemiBold.ttf'],
      [800, 'PublicSans_800ExtraBold.ttf'],
    ] as const).map(async ([weight, ficheiro]) => ({
      name: 'Public Sans',
      data: await readFile(join(process.cwd(), 'api/_og/fonts', ficheiro)),
      weight,
      style: 'normal' as const,
    }))
  );
  return fontesCache;
}
