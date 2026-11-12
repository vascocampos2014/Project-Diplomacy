import { montarFeed, resumirFeed } from '@/lib/feed';

import { LUGARES, votacao } from './fixtures';

describe('montarFeed', () => {
  it('shows one card per initiative, keeping the first substantive vote', () => {
    const itens = montarFeed(
      [
        votacao({ id: '1', iniciativaId: 100, descricao: 'Texto final, apresentado pela Comissão, relativo ao Projeto de Lei n.º 672/XVII/1.ª (CDS-PP)' }),
        votacao({ id: '2', iniciativaId: 100 }),
        votacao({ id: '3', iniciativaId: 200, iniciativaTitulo: 'Outra' }),
      ],
      LUGARES
    );
    expect(itens.map((i) => i.votacaoId)).toEqual(['1', '3']);
  });

  it('hides procedural votes, even when they come first', () => {
    const itens = montarFeed(
      [
        votacao({ id: '1', iniciativaId: 100, descricao: 'Requerimento oral, apresentado pelo PS, solicitando a dispensa de redação final' }),
        votacao({ id: '2', iniciativaId: 100, descricao: 'Texto de substituição - Votação da assunção pelo Plenário das votações indiciárias' }),
        votacao({ id: '3', iniciativaId: 100 }),
      ],
      LUGARES
    );
    expect(itens.map((i) => i.votacaoId)).toEqual(['3']);
  });

  it('builds the reference line used to tell same-titled bills apart', () => {
    const [a, b] = montarFeed(
      [
        votacao({ id: '1', iniciativaId: 1, iniciativaNumero: '672', descricao: 'Texto final, relativo ao Projeto de Lei n.º 672/XVII/1.ª (CDS-PP)' }),
        votacao({ id: '2', iniciativaId: 2, iniciativaNumero: '674', descricao: 'Texto final, relativo ao Projeto de Lei n.º 674/XVII/1.ª (PS)' }),
      ],
      LUGARES
    );
    expect(a.referencia).toBe('Projeto de Lei n.º 672 · CDS-PP · Votação final global');
    expect(b.referencia).toBe('Projeto de Lei n.º 674 · PS · Votação final global');
  });

  it('caps the number of cards', () => {
    const muitas = Array.from({ length: 50 }, (_, i) => votacao({ id: String(i), iniciativaId: i }));
    expect(montarFeed(muitas, LUGARES, 30)).toHaveLength(30);
  });

  it('converts party positions into seat counts', () => {
    const [item] = montarFeed([votacao({ aFavor: ['PSD', 'CDS-PP'], contra: ['CH'], abstencao: ['PS'] })], LUGARES);
    expect(item.iniciativa).toMatchObject({ favor: 91, contra: 60, abstencao: 58, resultado: 'aprovada' });
  });
});

describe('resumirFeed', () => {
  it('counts approved and rejected', () => {
    const itens = montarFeed(
      [votacao({ id: '1', iniciativaId: 1 }), votacao({ id: '2', iniciativaId: 2, resultado: 'Rejeitado' }), votacao({ id: '3', iniciativaId: 3 })],
      LUGARES
    );
    expect(resumirFeed(itens)).toEqual({ total: 3, aprovadas: 2, chumbadas: 1 });
  });
});
