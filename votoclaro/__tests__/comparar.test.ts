import { concordancia, rankingFavor } from '@/lib/comparar';

import { historico as h } from './fixtures';

describe('concordancia', () => {
  it('counts only votes where both parties took a position', () => {
    const a = [h('1', 'favor'), h('2', 'contra'), h('3', 'ausente'), h('4', 'favor')];
    const b = [h('1', 'favor'), h('2', 'favor'), h('3', 'favor'), h('4', 'ausente')];
    const r = concordancia(a, b);
    expect(r).toMatchObject({ comparaveis: 2, iguais: 1, percentagem: 50 });
    expect(r.divergencias.map((d) => [d.votacaoId, d.posicaoA, d.posicaoB])).toEqual([['2', 'contra', 'favor']]);
  });

  it('matches by vote id, not by list order', () => {
    const r = concordancia([h('1', 'favor'), h('2', 'contra')], [h('2', 'contra'), h('1', 'favor')]);
    expect(r.percentagem).toBe(100);
  });

  it('breaks results down by theme, most-voted theme first', () => {
    const a = [h('1', 'favor', 'Saúde'), h('2', 'favor', 'Economia'), h('3', 'favor', 'Economia')];
    const b = [h('1', 'contra', 'Saúde'), h('2', 'favor', 'Economia'), h('3', 'contra', 'Economia')];
    expect(concordancia(a, b).porTema).toEqual([
      { tema: 'Economia', comparaveis: 2, iguais: 1, percentagem: 50 },
      { tema: 'Saúde', comparaveis: 1, iguais: 0, percentagem: 0 },
    ]);
  });

  it('returns null percentage when there is nothing to compare', () => {
    expect(concordancia([h('1', 'ausente')], [h('1', 'favor')]).percentagem).toBeNull();
    expect(concordancia([], []).percentagem).toBeNull();
  });
});

describe('rankingFavor', () => {
  const stats = {
    A: { favor: 8, contra: 1, abstencao: 1, ausente: 10, total: 20 },
    B: { favor: 5, contra: 5, abstencao: 0, ausente: 0, total: 10 },
    C: { favor: 0, contra: 0, abstencao: 0, ausente: 4, total: 4 },
  };

  it('uses votes where the party was present and sorts by % in favour', () => {
    expect(rankingFavor(stats)).toEqual([
      { partido: 'A', percFavor: 80, percContra: 10, percAbstencao: 10, votacoes: 10 },
      { partido: 'B', percFavor: 50, percContra: 50, percAbstencao: 0, votacoes: 10 },
    ]);
  });

  it('can be limited to current parties', () => {
    expect(rankingFavor(stats, ['B', 'Z']).map((r) => r.partido)).toEqual(['B']);
  });
});
