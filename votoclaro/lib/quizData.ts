import type { PerguntaAfinidade } from '@/types';

// Afirmações do teste de afinidade partidária. Cada afirmação está ligada a uma
// iniciativa real: "concordo" equivale a um voto a favor dessa iniciativa,
// "discordo" a um voto contra, e "neutro" a uma abstenção.
export const MOCK_PERGUNTAS_AFINIDADE: PerguntaAfinidade[] = [
  {
    id: 'af-arrendamento',
    tema: 'Habitação',
    afirmacao: 'O Estado deve impor limites ao aumento das rendas para proteger os inquilinos.',
    iniciativaId: 'ini-1',
  },
  {
    id: 'af-medicos',
    tema: 'Saúde',
    afirmacao: 'O Estado deve definir metas obrigatórias de contratação de médicos de família.',
    iniciativaId: 'ini-2',
  },
  {
    id: 'af-iva',
    tema: 'Economia',
    afirmacao: 'O IVA da eletricidade para consumo doméstico deve ser reduzido.',
    iniciativaId: 'ini-3',
  },
  {
    id: 'af-reflorestacao',
    tema: 'Ambiente',
    afirmacao: 'O Estado deve criar um programa nacional de reflorestação com espécies autóctones.',
    iniciativaId: 'ini-4',
  },
  {
    id: 'af-salario-minimo',
    tema: 'Trabalho',
    afirmacao: 'O salário mínimo nacional deve ser aumentado de forma significativa.',
    iniciativaId: 'ini-8',
  },
  {
    id: 'af-cuidadores',
    tema: 'Saúde',
    afirmacao: 'Os cuidadores informais devem ter mais direitos e apoios sociais reconhecidos por lei.',
    iniciativaId: 'ini-6',
  },
  {
    id: 'af-renda-apoiada',
    tema: 'Habitação',
    afirmacao: 'Os critérios de acesso à renda apoiada em habitação pública devem ser atualizados.',
    iniciativaId: 'ini-7',
  },
  {
    id: 'af-manuais',
    tema: 'Educação',
    afirmacao: 'Os manuais escolares devem ser gratuitos para todos os alunos do secundário.',
    iniciativaId: 'ini-9',
  },
  {
    id: 'af-violencia-domestica',
    tema: 'Justiça',
    afirmacao: 'As penas para crimes de violência doméstica devem ser agravadas.',
    iniciativaId: 'ini-10',
  },
  {
    id: 'af-petroleo',
    tema: 'Ambiente',
    afirmacao: 'Não devem ser concedidas novas licenças de prospeção de petróleo e gás em Portugal.',
    iniciativaId: 'ini-11',
  },
  {
    id: 'af-iva-geral',
    tema: 'Economia',
    afirmacao: 'A taxa geral do IVA deve ser reduzida.',
    iniciativaId: 'ini-12',
  },
  {
    id: 'af-habitacao-publica',
    tema: 'Habitação',
    afirmacao: 'O Estado deve investir na construção de habitação pública para responder à crise de habitação.',
    iniciativaId: 'ini-13',
  },
];
