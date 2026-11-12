import type { PerguntaAfinidade } from '@/types';

// Afirmações do teste de afinidade. Cada uma descreve, em linguagem neutra, o
// que propunha uma iniciativa REAL da XVII legislatura, e está ligada à
// votação oficial dessa iniciativa: o resultado compara as respostas com o
// voto efetivo de cada grupo parlamentar (carregado da API openAR).
//
// Critérios de escolha: votações em que os partidos se dividiram (uma votação
// unânime não distingue ninguém), temas variados, e texto que descreve a
// proposta sem a avaliar.
export const PERGUNTAS_AFINIDADE: PerguntaAfinidade[] = [
  {
    id: 'af-credito-habitacao',
    tema: 'Habitação',
    afirmacao:
      'Deve existir um regime extraordinário para proteger quem tem crédito à habitação da casa própria quando as prestações sobem muito.',
    referencia: 'Projeto de Lei n.º 511',
    iniciativaId: 356354,
    votacaoId: '182976',
  },
  {
    id: 'af-pensoes',
    tema: 'Pensões',
    afirmacao: 'As pensões de menor valor devem ter um aumento suplementar, para além da atualização anual.',
    referencia: 'Projeto de Resolução n.º 1292',
    iniciativaId: 377308,
    votacaoId: '193051',
  },
  {
    id: 'af-irs-filhos',
    tema: 'Economia',
    afirmacao: 'A dedução no IRS por cada filho deve ser maior a partir do terceiro filho.',
    referencia: 'Projeto de Lei n.º 672',
    iniciativaId: 356929,
    votacaoId: '172307',
  },
  {
    id: 'af-isp',
    tema: 'Economia',
    afirmacao: 'Os valores mínimos do imposto sobre os combustíveis (ISP) devem ser eliminados até ao final de 2027.',
    referencia: 'Projeto de Lei n.º 796',
    iniciativaId: 377316,
    votacaoId: '193037',
  },
  {
    id: 'af-portagens',
    tema: 'Mobilidade',
    afirmacao: 'Devem acabar as portagens na A1 dentro do concelho de Vila Franca de Xira.',
    referencia: 'Projeto de Resolução n.º 259',
    iniciativaId: 315516,
    votacaoId: '193058',
  },
  {
    id: 'af-bombeiros',
    tema: 'Proteção civil',
    afirmacao: 'O Estado deve financiar de forma fixa os corpos de bombeiros profissionais das câmaras municipais.',
    referencia: 'Projeto de Resolução n.º 1298',
    iniciativaId: 377318,
    votacaoId: '193220',
  },
  {
    id: 'af-coleiras',
    tema: 'Animais',
    afirmacao: 'Deve ser proibido vender e usar coleiras de choque e coleiras estranguladoras em animais de companhia.',
    referencia: 'Projeto de Lei n.º 528',
    iniciativaId: 356420,
    votacaoId: '193278',
  },
  {
    id: 'af-capacete',
    tema: 'Mobilidade',
    afirmacao: 'Deve ser garantido o acesso a capacete a quem anda de bicicleta ou de trotinete elétrica.',
    referencia: 'Projeto de Resolução n.º 1273',
    iniciativaId: 377268,
    votacaoId: '182975',
  },
];
