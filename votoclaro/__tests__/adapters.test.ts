import {
  agregarPosicaoPartidos,
  contarLugaresPorPartido,
  eVotacaoProcedimental,
  montarDeputadoDetalhe,
  referenciaVotacao,
} from '@/lib/parlamentoAdapters';

import { votacao } from './fixtures';

describe('eVotacaoProcedimental', () => {
  it.each([
    ['Requerimento oral, apresentado pelo PS, solicitando a dispensa', true],
    ['Requerimento, apresentado pela IL, solicitando a baixa à comissão', true],
    ['Texto de substituição … - Votação da assunção pelo Plenário das votações indiciárias', true],
    ['Texto final, apresentado pela Comissão de Orçamento', false],
    [null, false],
    [undefined, false],
  ])('%s -> %s', (descricao, esperado) => {
    expect(eVotacaoProcedimental(descricao)).toBe(esperado);
  });
});

describe('referenciaVotacao', () => {
  it('names every initiative type', () => {
    expect(referenciaVotacao({ iniciativaTipo: 'P', iniciativaNumero: '110' })).toBe('Proposta de Lei n.º 110');
    expect(referenciaVotacao({ iniciativaTipo: 'R', iniciativaNumero: '1' })).toBe('Projeto de Resolução n.º 1');
    expect(referenciaVotacao({ iniciativaTipo: 'D', iniciativaNumero: '38' })).toBe('Projeto de Deliberação n.º 38');
    expect(referenciaVotacao({ iniciativaTipo: '?', iniciativaNumero: '9' })).toBe('Iniciativa n.º 9');
  });

  it('adds author and stage when the description has them', () => {
    expect(
      referenciaVotacao({ iniciativaTipo: 'J', iniciativaNumero: '581', descricao: 'Texto de substituição, apresentado pela Comissão, relativo ao Projeto de Lei n.º 581/XVII/1.ª (PAN)' })
    ).toBe('Projeto de Lei n.º 581 · PAN · Texto de substituição');
  });
});

describe('agregarPosicaoPartidos', () => {
  const partidos = ['PSD', 'PS', 'CH', 'L'];

  it('maps each listed party and marks the rest absent', () => {
    const m = agregarPosicaoPartidos(votacao({ aFavor: ['PSD'], contra: ['PS'], abstencao: ['CH'] }), partidos);
    expect(Object.fromEntries(m)).toEqual({ PSD: 'favor', PS: 'contra', CH: 'abstencao', L: 'ausente' });
  });

  it('treats an empty unanimous record as everyone voting with the result', () => {
    const m = agregarPosicaoPartidos(votacao({ unanime: true, aFavor: [], contra: [] }), partidos);
    expect([...m.values()]).toEqual(['favor', 'favor', 'favor', 'favor']);
  });

  it('ignores individual dissent entries like "1-PS" for the group position', () => {
    const m = agregarPosicaoPartidos(votacao({ aFavor: ['PS'], contra: ['PSD', '1-PS'] }), partidos);
    expect(m.get('PS')).toBe('favor');
  });
});

describe('contarLugaresPorPartido', () => {
  it('counts deputies per group and skips those without one', () => {
    const d = (g: string | null) => ({ id: 1, nomeParlamentar: '', nomeCompleto: '', grupoParlamentar: g, circuloEleitoral: null, legislaturaId: 'XVII', situacao: 'ativo' });
    expect(contarLugaresPorPartido([d('PS'), d('PS'), d('CH'), d(null)])).toEqual({ PS: 2, CH: 1 });
  });
});

describe('montarDeputadoDetalhe', () => {
  const lista = { id: 9194, nomeParlamentar: 'Aida Carvalho', nomeCompleto: 'Aida Maria Oliveira Carvalho', grupoParlamentar: 'PS', circuloEleitoral: 'Guarda', legislaturaId: 'XVII', situacao: 'ativo' };

  it('falls back to the list when the detail has no mandates (current API)', () => {
    const r = montarDeputadoDetalhe({ id: 9194, depId: 1, nomeParlamentar: 'Aida Carvalho', nomeCompleto: 'Aida Maria Oliveira Carvalho' }, lista);
    expect(r).toMatchObject({ nome: 'Aida Carvalho', partido: 'PS', circulo: 'Guarda', numMandatos: 1 });
  });

  it('prefers the current-legislature mandate when present', () => {
    const r = montarDeputadoDetalhe(
      {
        id: 1, depId: 1, nomeParlamentar: 'X', nomeCompleto: 'X',
        mandatos: [
          { id: 1, legislaturaId: 'XVI', grupoParlamentar: 'BE', circuloEleitoral: 'Porto', dataInicio: null, dataFim: null, situacao: null },
          { id: 2, legislaturaId: 'XVII', grupoParlamentar: 'L', circuloEleitoral: 'Lisboa', dataInicio: null, dataFim: null, situacao: null },
        ],
      },
      lista
    );
    expect(r).toMatchObject({ partido: 'L', circulo: 'Lisboa', numMandatos: 2 });
  });

  it('shows a dash when nothing is known', () => {
    expect(montarDeputadoDetalhe({ id: 1, depId: null, nomeParlamentar: 'X', nomeCompleto: 'X' })).toMatchObject({ partido: '—', circulo: '—' });
  });
});
