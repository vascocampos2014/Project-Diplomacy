import type { Deputado, Iniciativa, Votacao } from '@/types';

// Dados de exemplo para desenvolvimento — substituir pela sync da API do
// parlamento (ver supabase/functions/sync-parlamento).

export const MOCK_DEPUTADOS: Deputado[] = [
  {
    id: 'dep-1',
    nome: 'Ana Silva',
    partido: 'PS',
    circulo: 'Lisboa',
    mandatos: 2,
    ativo: true,
    percFavor: 78,
    percContra: 14,
    percAbstencao: 8,
    taxaPresenca: 96,
  },
  {
    id: 'dep-2',
    nome: 'Miguel Costa',
    partido: 'PSD',
    circulo: 'Porto',
    mandatos: 1,
    ativo: true,
    percFavor: 45,
    percContra: 40,
    percAbstencao: 15,
    taxaPresenca: 91,
  },
  {
    id: 'dep-3',
    nome: 'Beatriz Ferreira',
    partido: 'Chega',
    circulo: 'Setúbal',
    mandatos: 1,
    ativo: true,
    percFavor: 22,
    percContra: 70,
    percAbstencao: 8,
    taxaPresenca: 88,
  },
  {
    id: 'dep-4',
    nome: 'Tiago Marques',
    partido: 'IL',
    circulo: 'Braga',
    mandatos: 1,
    ativo: true,
    percFavor: 38,
    percContra: 50,
    percAbstencao: 12,
    taxaPresenca: 94,
  },
  {
    id: 'dep-5',
    nome: 'Joana Pinto',
    partido: 'BE',
    circulo: 'Lisboa',
    mandatos: 3,
    ativo: true,
    percFavor: 65,
    percContra: 25,
    percAbstencao: 10,
    taxaPresenca: 97,
  },
  {
    id: 'dep-6',
    nome: 'Rui Carvalho',
    partido: 'CDU',
    circulo: 'Setúbal',
    mandatos: 4,
    ativo: true,
    percFavor: 60,
    percContra: 30,
    percAbstencao: 10,
    taxaPresenca: 99,
  },
  {
    id: 'dep-7',
    nome: 'Sofia Rodrigues',
    partido: 'PAN',
    circulo: 'Lisboa',
    mandatos: 2,
    ativo: true,
    percFavor: 70,
    percContra: 18,
    percAbstencao: 12,
    taxaPresenca: 93,
  },
  {
    id: 'dep-8',
    nome: 'André Sousa',
    partido: 'Livre',
    circulo: 'Lisboa',
    mandatos: 1,
    ativo: true,
    percFavor: 72,
    percContra: 16,
    percAbstencao: 12,
    taxaPresenca: 95,
  },
];

export const MOCK_INICIATIVAS: Iniciativa[] = [
  {
    id: 'ini-1',
    titulo: 'Lei do Arrendamento Acessível',
    descricao:
      'Estabelece limites à atualização de rendas e cria um programa de apoio para arrendatários com rendimentos baixos.',
    tema: 'Habitação',
    dataVoto: '23 Mar 2024',
    resultado: 'aprovada',
    favor: 132,
    contra: 58,
    abstencao: 12,
    ausentes: 28,
  },
  {
    id: 'ini-2',
    titulo: 'Reforço de Médicos de Família no SNS',
    descricao:
      'Define metas de contratação de médicos de família para reduzir o número de utentes sem médico atribuído.',
    tema: 'Saúde',
    dataVoto: '18 Mar 2024',
    resultado: 'aprovada',
    favor: 168,
    contra: 20,
    abstencao: 22,
    ausentes: 20,
  },
  {
    id: 'ini-3',
    titulo: 'Redução do IVA na Eletricidade',
    descricao: 'Reduz a taxa de IVA aplicável ao consumo doméstico de eletricidade.',
    tema: 'Economia',
    dataVoto: '12 Mar 2024',
    resultado: 'chumbada',
    favor: 95,
    contra: 110,
    abstencao: 8,
    ausentes: 17,
  },
  {
    id: 'ini-4',
    titulo: 'Plano Nacional de Plantação de Árvores Autóctones',
    descricao: 'Cria um programa plurianual de reflorestação com espécies autóctones em áreas ardidas.',
    tema: 'Ambiente',
    dataVoto: '07 Mar 2024',
    resultado: 'aprovada',
    favor: 201,
    contra: 5,
    abstencao: 14,
    ausentes: 10,
  },
  {
    id: 'ini-5',
    titulo: 'Alargamento da Escolaridade Obrigatória em Tecnologia',
    descricao: 'Introduz disciplina obrigatória de literacia digital no 1.º ciclo.',
    tema: 'Educação',
    dataVoto: '28 Fev 2024',
    resultado: 'pendente',
    favor: 0,
    contra: 0,
    abstencao: 0,
    ausentes: 0,
  },
  {
    id: 'ini-6',
    titulo: 'Estatuto do Cuidador Informal',
    descricao: 'Reforça os direitos e apoios sociais atribuídos a cuidadores informais.',
    tema: 'Saúde',
    dataVoto: '21 Fev 2024',
    resultado: 'aprovada',
    favor: 215,
    contra: 2,
    abstencao: 8,
    ausentes: 5,
  },
  {
    id: 'ini-7',
    titulo: 'Revisão do Regime de Renda Apoiada',
    descricao: 'Atualiza os critérios de acesso à renda apoiada em habitação pública.',
    tema: 'Habitação',
    dataVoto: '14 Fev 2024',
    resultado: 'chumbada',
    favor: 88,
    contra: 120,
    abstencao: 10,
    ausentes: 12,
  },
  {
    id: 'ini-8',
    titulo: 'Aumento do Salário Mínimo Nacional para 1020€',
    descricao: 'Atualiza o valor do salário mínimo nacional para 1.020 euros mensais, com entrada em vigor no ano seguinte.',
    tema: 'Trabalho',
    dataVoto: '09 Fev 2024',
    resultado: 'aprovada',
    favor: 145,
    contra: 55,
    abstencao: 20,
    ausentes: 10,
  },
  {
    id: 'ini-9',
    titulo: 'Gratuitidade dos Manuais Escolares no Secundário',
    descricao: 'Garante a distribuição gratuita de manuais escolares a todos os alunos do ensino secundário público.',
    tema: 'Educação',
    dataVoto: '02 Fev 2024',
    resultado: 'aprovada',
    favor: 140,
    contra: 70,
    abstencao: 10,
    ausentes: 10,
  },
  {
    id: 'ini-10',
    titulo: 'Agravamento das Penas por Violência Doméstica',
    descricao: 'Agrava as molduras penais aplicáveis a crimes de violência doméstica e reforça medidas de proteção às vítimas.',
    tema: 'Justiça',
    dataVoto: '26 Jan 2024',
    resultado: 'aprovada',
    favor: 210,
    contra: 2,
    abstencao: 10,
    ausentes: 8,
  },
  {
    id: 'ini-11',
    titulo: 'Fim de Novas Licenças de Prospeção de Petróleo e Gás',
    descricao: 'Proíbe a atribuição de novas licenças de prospeção e exploração de petróleo e gás natural em território nacional.',
    tema: 'Ambiente',
    dataVoto: '19 Jan 2024',
    resultado: 'chumbada',
    favor: 95,
    contra: 125,
    abstencao: 5,
    ausentes: 5,
  },
  {
    id: 'ini-12',
    titulo: 'Redução do IVA Geral de 23% para 21%',
    descricao: 'Reduz a taxa geral do IVA de 23% para 21%, aplicável à generalidade dos bens e serviços.',
    tema: 'Economia',
    dataVoto: '12 Jan 2024',
    resultado: 'chumbada',
    favor: 98,
    contra: 118,
    abstencao: 8,
    ausentes: 6,
  },
  {
    id: 'ini-13',
    titulo: 'Construção de 26 Mil Fogos de Habitação Pública até 2030',
    descricao: 'Cria um programa de construção de habitação pública com o objetivo de disponibilizar 26 mil fogos até 2030.',
    tema: 'Habitação',
    dataVoto: '05 Jan 2024',
    resultado: 'aprovada',
    favor: 150,
    contra: 50,
    abstencao: 20,
    ausentes: 10,
  },
];

export const MOCK_VOTACOES: Votacao[] = [
  // ini-1 — Lei do Arrendamento Acessível
  { id: 'vot-1-1', deputadoId: 'dep-1', iniciativaId: 'ini-1', posicao: 'favor' },
  { id: 'vot-1-2', deputadoId: 'dep-2', iniciativaId: 'ini-1', posicao: 'contra' },
  { id: 'vot-1-3', deputadoId: 'dep-3', iniciativaId: 'ini-1', posicao: 'contra' },
  { id: 'vot-1-4', deputadoId: 'dep-4', iniciativaId: 'ini-1', posicao: 'contra' },
  { id: 'vot-1-5', deputadoId: 'dep-5', iniciativaId: 'ini-1', posicao: 'favor' },
  { id: 'vot-1-6', deputadoId: 'dep-6', iniciativaId: 'ini-1', posicao: 'favor' },
  { id: 'vot-1-7', deputadoId: 'dep-7', iniciativaId: 'ini-1', posicao: 'favor' },
  { id: 'vot-1-8', deputadoId: 'dep-8', iniciativaId: 'ini-1', posicao: 'abstencao' },

  // ini-2 — Reforço de Médicos de Família no SNS
  { id: 'vot-2-1', deputadoId: 'dep-1', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-2', deputadoId: 'dep-2', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-3', deputadoId: 'dep-3', iniciativaId: 'ini-2', posicao: 'abstencao' },
  { id: 'vot-2-4', deputadoId: 'dep-4', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-5', deputadoId: 'dep-5', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-6', deputadoId: 'dep-6', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-7', deputadoId: 'dep-7', iniciativaId: 'ini-2', posicao: 'favor' },
  { id: 'vot-2-8', deputadoId: 'dep-8', iniciativaId: 'ini-2', posicao: 'favor' },

  // ini-3 — Redução do IVA na Eletricidade
  { id: 'vot-3-1', deputadoId: 'dep-1', iniciativaId: 'ini-3', posicao: 'contra' },
  { id: 'vot-3-2', deputadoId: 'dep-2', iniciativaId: 'ini-3', posicao: 'favor' },
  { id: 'vot-3-3', deputadoId: 'dep-3', iniciativaId: 'ini-3', posicao: 'favor' },
  { id: 'vot-3-4', deputadoId: 'dep-4', iniciativaId: 'ini-3', posicao: 'favor' },
  { id: 'vot-3-5', deputadoId: 'dep-5', iniciativaId: 'ini-3', posicao: 'contra' },
  { id: 'vot-3-6', deputadoId: 'dep-6', iniciativaId: 'ini-3', posicao: 'contra' },
  { id: 'vot-3-7', deputadoId: 'dep-7', iniciativaId: 'ini-3', posicao: 'abstencao' },
  { id: 'vot-3-8', deputadoId: 'dep-8', iniciativaId: 'ini-3', posicao: 'contra' },

  // ini-4 — Plano Nacional de Plantação de Árvores Autóctones
  { id: 'vot-4-1', deputadoId: 'dep-1', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-2', deputadoId: 'dep-2', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-3', deputadoId: 'dep-3', iniciativaId: 'ini-4', posicao: 'abstencao' },
  { id: 'vot-4-4', deputadoId: 'dep-4', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-5', deputadoId: 'dep-5', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-6', deputadoId: 'dep-6', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-7', deputadoId: 'dep-7', iniciativaId: 'ini-4', posicao: 'favor' },
  { id: 'vot-4-8', deputadoId: 'dep-8', iniciativaId: 'ini-4', posicao: 'favor' },

  // ini-6 — Estatuto do Cuidador Informal
  { id: 'vot-6-1', deputadoId: 'dep-1', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-2', deputadoId: 'dep-2', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-3', deputadoId: 'dep-3', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-4', deputadoId: 'dep-4', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-5', deputadoId: 'dep-5', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-6', deputadoId: 'dep-6', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-7', deputadoId: 'dep-7', iniciativaId: 'ini-6', posicao: 'favor' },
  { id: 'vot-6-8', deputadoId: 'dep-8', iniciativaId: 'ini-6', posicao: 'ausente' },

  // ini-7 — Revisão do Regime de Renda Apoiada
  { id: 'vot-7-1', deputadoId: 'dep-1', iniciativaId: 'ini-7', posicao: 'favor' },
  { id: 'vot-7-2', deputadoId: 'dep-2', iniciativaId: 'ini-7', posicao: 'contra' },
  { id: 'vot-7-3', deputadoId: 'dep-3', iniciativaId: 'ini-7', posicao: 'contra' },
  { id: 'vot-7-4', deputadoId: 'dep-4', iniciativaId: 'ini-7', posicao: 'contra' },
  { id: 'vot-7-5', deputadoId: 'dep-5', iniciativaId: 'ini-7', posicao: 'favor' },
  { id: 'vot-7-6', deputadoId: 'dep-6', iniciativaId: 'ini-7', posicao: 'favor' },
  { id: 'vot-7-7', deputadoId: 'dep-7', iniciativaId: 'ini-7', posicao: 'abstencao' },
  { id: 'vot-7-8', deputadoId: 'dep-8', iniciativaId: 'ini-7', posicao: 'contra' },

  // ini-8 — Aumento do Salário Mínimo Nacional para 1020€
  { id: 'vot-8-1', deputadoId: 'dep-1', iniciativaId: 'ini-8', posicao: 'favor' },
  { id: 'vot-8-2', deputadoId: 'dep-2', iniciativaId: 'ini-8', posicao: 'abstencao' },
  { id: 'vot-8-3', deputadoId: 'dep-3', iniciativaId: 'ini-8', posicao: 'contra' },
  { id: 'vot-8-4', deputadoId: 'dep-4', iniciativaId: 'ini-8', posicao: 'contra' },
  { id: 'vot-8-5', deputadoId: 'dep-5', iniciativaId: 'ini-8', posicao: 'favor' },
  { id: 'vot-8-6', deputadoId: 'dep-6', iniciativaId: 'ini-8', posicao: 'favor' },
  { id: 'vot-8-7', deputadoId: 'dep-7', iniciativaId: 'ini-8', posicao: 'favor' },
  { id: 'vot-8-8', deputadoId: 'dep-8', iniciativaId: 'ini-8', posicao: 'favor' },

  // ini-9 — Gratuitidade dos Manuais Escolares no Secundário
  { id: 'vot-9-1', deputadoId: 'dep-1', iniciativaId: 'ini-9', posicao: 'favor' },
  { id: 'vot-9-2', deputadoId: 'dep-2', iniciativaId: 'ini-9', posicao: 'contra' },
  { id: 'vot-9-3', deputadoId: 'dep-3', iniciativaId: 'ini-9', posicao: 'contra' },
  { id: 'vot-9-4', deputadoId: 'dep-4', iniciativaId: 'ini-9', posicao: 'contra' },
  { id: 'vot-9-5', deputadoId: 'dep-5', iniciativaId: 'ini-9', posicao: 'favor' },
  { id: 'vot-9-6', deputadoId: 'dep-6', iniciativaId: 'ini-9', posicao: 'favor' },
  { id: 'vot-9-7', deputadoId: 'dep-7', iniciativaId: 'ini-9', posicao: 'favor' },
  { id: 'vot-9-8', deputadoId: 'dep-8', iniciativaId: 'ini-9', posicao: 'favor' },

  // ini-10 — Agravamento das Penas por Violência Doméstica
  { id: 'vot-10-1', deputadoId: 'dep-1', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-2', deputadoId: 'dep-2', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-3', deputadoId: 'dep-3', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-4', deputadoId: 'dep-4', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-5', deputadoId: 'dep-5', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-6', deputadoId: 'dep-6', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-7', deputadoId: 'dep-7', iniciativaId: 'ini-10', posicao: 'favor' },
  { id: 'vot-10-8', deputadoId: 'dep-8', iniciativaId: 'ini-10', posicao: 'abstencao' },

  // ini-11 — Fim de Novas Licenças de Prospeção de Petróleo e Gás
  { id: 'vot-11-1', deputadoId: 'dep-1', iniciativaId: 'ini-11', posicao: 'contra' },
  { id: 'vot-11-2', deputadoId: 'dep-2', iniciativaId: 'ini-11', posicao: 'contra' },
  { id: 'vot-11-3', deputadoId: 'dep-3', iniciativaId: 'ini-11', posicao: 'contra' },
  { id: 'vot-11-4', deputadoId: 'dep-4', iniciativaId: 'ini-11', posicao: 'contra' },
  { id: 'vot-11-5', deputadoId: 'dep-5', iniciativaId: 'ini-11', posicao: 'favor' },
  { id: 'vot-11-6', deputadoId: 'dep-6', iniciativaId: 'ini-11', posicao: 'favor' },
  { id: 'vot-11-7', deputadoId: 'dep-7', iniciativaId: 'ini-11', posicao: 'favor' },
  { id: 'vot-11-8', deputadoId: 'dep-8', iniciativaId: 'ini-11', posicao: 'favor' },

  // ini-12 — Redução do IVA Geral de 23% para 21%
  { id: 'vot-12-1', deputadoId: 'dep-1', iniciativaId: 'ini-12', posicao: 'contra' },
  { id: 'vot-12-2', deputadoId: 'dep-2', iniciativaId: 'ini-12', posicao: 'favor' },
  { id: 'vot-12-3', deputadoId: 'dep-3', iniciativaId: 'ini-12', posicao: 'favor' },
  { id: 'vot-12-4', deputadoId: 'dep-4', iniciativaId: 'ini-12', posicao: 'favor' },
  { id: 'vot-12-5', deputadoId: 'dep-5', iniciativaId: 'ini-12', posicao: 'contra' },
  { id: 'vot-12-6', deputadoId: 'dep-6', iniciativaId: 'ini-12', posicao: 'contra' },
  { id: 'vot-12-7', deputadoId: 'dep-7', iniciativaId: 'ini-12', posicao: 'abstencao' },
  { id: 'vot-12-8', deputadoId: 'dep-8', iniciativaId: 'ini-12', posicao: 'contra' },

  // ini-13 — Construção de 26 Mil Fogos de Habitação Pública até 2030
  { id: 'vot-13-1', deputadoId: 'dep-1', iniciativaId: 'ini-13', posicao: 'favor' },
  { id: 'vot-13-2', deputadoId: 'dep-2', iniciativaId: 'ini-13', posicao: 'abstencao' },
  { id: 'vot-13-3', deputadoId: 'dep-3', iniciativaId: 'ini-13', posicao: 'contra' },
  { id: 'vot-13-4', deputadoId: 'dep-4', iniciativaId: 'ini-13', posicao: 'contra' },
  { id: 'vot-13-5', deputadoId: 'dep-5', iniciativaId: 'ini-13', posicao: 'favor' },
  { id: 'vot-13-6', deputadoId: 'dep-6', iniciativaId: 'ini-13', posicao: 'favor' },
  { id: 'vot-13-7', deputadoId: 'dep-7', iniciativaId: 'ini-13', posicao: 'favor' },
  { id: 'vot-13-8', deputadoId: 'dep-8', iniciativaId: 'ini-13', posicao: 'favor' },
];

export function getVotacoesPorIniciativa(iniciativaId: string): Votacao[] {
  return MOCK_VOTACOES.filter((v) => v.iniciativaId === iniciativaId);
}

export function getDeputadoPorId(id: string): Deputado | undefined {
  return MOCK_DEPUTADOS.find((d) => d.id === id);
}

export function getIniciativaPorId(id: string): Iniciativa | undefined {
  return MOCK_INICIATIVAS.find((i) => i.id === id);
}

export function getVotacoesPorDeputado(
  deputadoId: string
): Array<{ votacao: Votacao; iniciativa: Iniciativa }> {
  return MOCK_VOTACOES.filter((v) => v.deputadoId === deputadoId)
    .map((votacao) => {
      const iniciativa = getIniciativaPorId(votacao.iniciativaId);
      return iniciativa ? { votacao, iniciativa } : null;
    })
    .filter((item): item is { votacao: Votacao; iniciativa: Iniciativa } => item !== null);
}
