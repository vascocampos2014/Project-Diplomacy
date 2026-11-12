export interface TermoGlossario {
  id: string;
  termo: string;
  definicao: string;
}

// Termos comuns do processo legislativo português, explicados em
// linguagem simples e neutra — ver secção "Neutralidade política" do CLAUDE.md.
export const GLOSSARIO: TermoGlossario[] = [
  {
    id: 'assembleia-da-republica',
    termo: 'Assembleia da República',
    definicao:
      'O parlamento português, onde os 230 deputados eleitos discutem e votam as leis do país.',
  },
  {
    id: 'deputado',
    termo: 'Deputado',
    definicao:
      'Pessoa eleita para representar os cidadãos na Assembleia da República e votar em seu nome.',
  },
  {
    id: 'grupo-parlamentar',
    termo: 'Grupo Parlamentar (Bancada)',
    definicao:
      'Conjunto de deputados do mesmo partido na Assembleia da República. Normalmente vota em bloco, seguindo a posição definida pelo partido.',
  },
  {
    id: 'circulo-eleitoral',
    termo: 'Círculo Eleitoral',
    definicao:
      'Divisão geográfica — geralmente um distrito — usada para eleger os deputados que representam essa zona do país.',
  },
  {
    id: 'mandato',
    termo: 'Mandato',
    definicao:
      'Período durante o qual um deputado exerce o cargo, normalmente 4 anos ou até haver novas eleições.',
  },
  {
    id: 'plenario',
    termo: 'Plenário',
    definicao:
      'Sessão em que todos os deputados se reúnem para discutir e votar as iniciativas legislativas.',
  },
  {
    id: 'comissao-parlamentar',
    termo: 'Comissão Parlamentar',
    definicao:
      'Grupo mais pequeno de deputados especializado num tema (por exemplo, Saúde ou Orçamento) que analisa as propostas antes de irem a votação no plenário.',
  },
  {
    id: 'iniciativa-legislativa',
    termo: 'Iniciativa Legislativa',
    definicao:
      'Nome geral para qualquer projeto de lei, proposta de lei ou projeto de resolução apresentado para discussão e votação.',
  },
  {
    id: 'projeto-de-lei',
    termo: 'Projeto de Lei',
    definicao:
      'Proposta de uma nova lei apresentada por deputados ou grupos parlamentares.',
  },
  {
    id: 'proposta-de-lei',
    termo: 'Proposta de Lei',
    definicao:
      'Proposta de uma nova lei apresentada pelo Governo.',
  },
  {
    id: 'projeto-de-resolucao',
    termo: 'Projeto de Resolução',
    definicao:
      'Texto que exprime uma posição, recomendação ou pedido da Assembleia, sem criar uma lei nova.',
  },
  {
    id: 'votacao-na-generalidade',
    termo: 'Votação na Generalidade',
    definicao:
      'Primeira votação de uma proposta, em que se decide apenas se a ideia geral avança para ser discutida em detalhe.',
  },
  {
    id: 'votacao-na-especialidade',
    termo: 'Votação na Especialidade',
    definicao:
      'Votação artigo a artigo de uma proposta já aprovada na generalidade, onde podem ser feitas alterações ao texto.',
  },
  {
    id: 'votacao-final-global',
    termo: 'Votação Final Global',
    definicao:
      'Última votação de uma proposta, depois da especialidade, que decide se a lei é aprovada na totalidade.',
  },
  {
    id: 'maioria-absoluta',
    termo: 'Maioria Absoluta',
    definicao:
      'Mais de metade do total de deputados em exercício vota a favor — não apenas mais de metade dos presentes.',
  },
  {
    id: 'maioria-relativa',
    termo: 'Maioria Relativa (Simples)',
    definicao:
      'Entre os votos expressos numa votação, há mais votos a favor do que contra.',
  },
  {
    id: 'maioria-qualificada',
    termo: 'Maioria Qualificada',
    definicao:
      'Exige uma fração maior de votos a favor (por exemplo, dois terços), usada em decisões mais importantes como alterações à Constituição.',
  },
  {
    id: 'quorum',
    termo: 'Quórum',
    definicao:
      'Número mínimo de deputados que precisa estar presente para que uma votação seja válida.',
  },
  {
    id: 'abstencao',
    termo: 'Abstenção',
    definicao:
      'Quando um deputado participa na votação mas não vota a favor nem contra a proposta.',
  },
  {
    id: 'decreto-lei',
    termo: 'Decreto-Lei',
    definicao:
      'Diploma legal aprovado diretamente pelo Governo, sem votação prévia no Parlamento, dentro dos limites definidos pela Constituição.',
  },
  {
    id: 'promulgacao',
    termo: 'Promulgação',
    definicao:
      'Ato do Presidente da República que torna uma lei aprovada pelo Parlamento oficialmente válida.',
  },
  {
    id: 'veto-presidencial',
    termo: 'Veto Presidencial',
    definicao:
      'Quando o Presidente da República devolve uma lei ao Parlamento sem a promulgar, pedindo uma nova análise.',
  },
  {
    id: 'orcamento-do-estado',
    termo: 'Orçamento do Estado (OE)',
    definicao:
      'Documento anual que define quanto o Estado vai receber e gastar. É discutido e votado todos os anos no Parlamento.',
  },
  {
    id: 'mocao-de-censura',
    termo: 'Moção de Censura',
    definicao:
      'Iniciativa apresentada por deputados que, se aprovada, obriga o Governo a demitir-se.',
  },
  {
    id: 'mocao-de-confianca',
    termo: 'Moção de Confiança',
    definicao:
      'Pedido feito pelo próprio Governo ao Parlamento para confirmar que continua a ter o apoio da maioria dos deputados.',
  },
  {
    id: 'peticao',
    termo: 'Petição',
    definicao:
      'Pedido apresentado por cidadãos à Assembleia da República sobre um assunto de interesse público.',
  },
  {
    id: 'audicao-parlamentar',
    termo: 'Audição Parlamentar',
    definicao:
      'Sessão em que uma comissão ouve um especialista, ministro ou outra entidade sobre um tema específico.',
  },
  {
    id: 'ordem-do-dia',
    termo: 'Ordem do Dia',
    definicao:
      'Lista dos assuntos que vão ser discutidos e votados numa sessão plenária.',
  },
];
