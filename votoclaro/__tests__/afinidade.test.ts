import { calcularAfinidade, pontuacaoResposta } from '@/lib/afinidade';
import { PERGUNTAS_AFINIDADE } from '@/lib/quizData';
import type { PerguntaAfinidade, Posicao } from '@/types';

describe('pontuacaoResposta', () => {
  it.each<[Parameters<typeof pontuacaoResposta>[0], Posicao | undefined, number | null]>([
    ['concordo', 'favor', 1],
    ['concordo', 'contra', 0],
    ['discordo', 'contra', 1],
    ['concordo', 'abstencao', 0.5],
    ['neutro', 'favor', 0.5],
    ['neutro', 'abstencao', 1],
    ['concordo', 'ausente', null],
    ['concordo', undefined, null],
  ])('%s vs %s -> %s', (resposta, posicao, esperado) => {
    expect(pontuacaoResposta(resposta, posicao)).toBe(esperado);
  });
});

describe('calcularAfinidade', () => {
  const perguntas: PerguntaAfinidade[] = [
    { id: 'p1', tema: 'T', afirmacao: 'A1', referencia: 'R1', iniciativaId: 1, votacaoId: 'v1' },
    { id: 'p2', tema: 'T', afirmacao: 'A2', referencia: 'R2', iniciativaId: 2, votacaoId: 'v2' },
  ];
  const posicoes = {
    v1: new Map<string, Posicao>([['A', 'favor'], ['B', 'contra'], ['C', 'ausente']]),
    v2: new Map<string, Posicao>([['A', 'favor'], ['B', 'favor'], ['C', 'ausente']]),
  };

  it('scores against the real positions and sorts best first', () => {
    const r = calcularAfinidade(perguntas, { p1: 'concordo', p2: 'concordo' }, posicoes, ['B', 'A', 'C']);
    expect(r).toEqual([
      { partido: 'A', pontuacao: 100 },
      { partido: 'B', pontuacao: 50 },
    ]);
  });

  it('leaves out a party that missed every vote instead of scoring it 50% or 0%', () => {
    const r = calcularAfinidade(perguntas, { p1: 'concordo', p2: 'concordo' }, posicoes, ['C']);
    expect(r).toEqual([]);
  });

  it('only counts answered questions', () => {
    expect(calcularAfinidade(perguntas, { p1: 'discordo' }, posicoes, ['B'])).toEqual([{ partido: 'B', pontuacao: 100 }]);
  });
});

describe('quiz data', () => {
  it('ties every statement to a real vote and uses unique ids', () => {
    expect(PERGUNTAS_AFINIDADE.length).toBeGreaterThanOrEqual(6);
    expect(new Set(PERGUNTAS_AFINIDADE.map((p) => p.id)).size).toBe(PERGUNTAS_AFINIDADE.length);
    for (const p of PERGUNTAS_AFINIDADE) {
      expect(p.votacaoId).toMatch(/^\d+$/);
      expect(p.iniciativaId).toBeGreaterThan(0);
      expect(p.referencia).toMatch(/^(Projeto|Proposta) de (Lei|Resolução) n\.º \d+$/);
    }
  });

  it('keeps statements neutral: no party names and no loaded words', () => {
    const proibidas = /\b(PS|PSD|Chega|CH|IL|Livre|PCP|BE|Bloco|PAN|JPP|CDS)\b|vergonh|absurd|escândal|ridícul/i;
    for (const p of PERGUNTAS_AFINIDADE) expect(p.afirmacao).not.toMatch(proibidas);
  });
});
