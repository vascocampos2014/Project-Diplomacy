import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { filtrarDeputados, normalizar } from '@/lib/deputados';
import { formatarDataPt, hexToRgba, iniciais } from '@/lib/format';
import { classificarTema } from '@/lib/temas';
import type { Deputado } from '@/types';

describe('format', () => {
  it('formats API dates', () => {
    expect(formatarDataPt('2026-10-28')).toBe('28 Out 2026');
    expect(formatarDataPt(null)).toBe('—');
  });
  it('builds initials', () => {
    expect(iniciais('  Aida   Maria Carvalho ')).toBe('AM');
  });
  it('converts hex to rgba', () => {
    expect(hexToRgba('#3D5AFE', 0.12)).toBe('rgba(61, 90, 254, 0.12)');
  });
});

describe('classificarTema', () => {
  it.each([
    ['Novo Regime do Arrendamento Urbano', 'Habitação'],
    ['Reforço do SNS e dos hospitais', 'Saúde'],
    ['Redução do IVA do gás engarrafado', 'Economia'],
    ['Criminaliza a prática da zoofilia', 'Justiça'],
    ['Deslocação do Presidente da República a Madrid', 'Outros'],
  ])('%s -> %s', (titulo, tema) => expect(classificarTema(titulo)).toBe(tema));
});

describe('filtrarDeputados', () => {
  const d = (nome: string, partido: string, circulo: string): Deputado => ({ id: nome, nome, partido, circulo, mandatos: 1, ativo: true });
  const lista = [d('Carlos Guimarães Pinto', 'IL', 'Porto'), d('Aida Carvalho', 'PS', 'Guarda'), d('Eurico Brilhante Dias', 'PS', 'Leiria')];

  it('ignores accents and case', () => {
    expect(normalizar('  GUIMARÃES ')).toBe('guimaraes');
    expect(filtrarDeputados(lista, 'guimaraes', null).map((x) => x.nome)).toEqual(['Carlos Guimarães Pinto']);
  });
  it('searches party and constituency too', () => {
    expect(filtrarDeputados(lista, 'leiria', null)).toHaveLength(1);
    expect(filtrarDeputados(lista, 'ps', null)).toHaveLength(2);
  });
  it('combines search with the party filter', () => {
    expect(filtrarDeputados(lista, '', 'PS')).toHaveLength(2);
    expect(filtrarDeputados(lista, 'aida', 'IL')).toHaveLength(0);
  });
});

describe('vercel.json', () => {
  const cfg = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8'));
  const headers: Record<string, string> = Object.fromEntries(
    cfg.headers.find((h: { source: string }) => h.source === '/(.*)').headers.map((h: { key: string; value: string }) => [h.key, h.value])
  );

  it("allows Expo's inline hydration script by hash (breaks if Expo changes it)", () => {
    const hash = createHash('sha256').update('globalThis.__EXPO_ROUTER_HYDRATE__=true;').digest('base64');
    expect(headers['Content-Security-Policy']).toContain(`'sha256-${hash}'`);
  });

  it('keeps the CSP strict', () => {
    const csp = headers['Content-Security-Policy'];
    expect(csp).toMatch(/script-src 'self' 'sha256-/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    expect(csp).toContain("frame-ancestors 'none'");
    // Data from openAR, questions to the RAG API on Hugging Face, nothing else.
    expect(csp).toMatch(/connect-src 'self' https:\/\/api\.openar\.pt https:\/\/vscocmp-votoclaro-rag\.hf\.space;/);
  });

  it('sets the other security headers', () => {
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Strict-Transport-Security']).toMatch(/max-age=\d{8}/);
  });

  it('rewrites dynamic routes and serves the app 404', () => {
    expect(cfg.rewrites).toEqual(
      expect.arrayContaining([
        { source: '/votacao/:id', destination: '/votacao/[id]' },
        { source: '/deputado/:id', destination: '/deputado/[id]' },
      ])
    );
    expect(cfg.buildCommand).toContain('404.html');
  });
});
