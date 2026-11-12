export type Posicao = 'favor' | 'contra' | 'abstencao' | 'ausente';

export type Resultado = 'aprovada' | 'chumbada' | 'pendente';

export interface Deputado {
  id: string;
  nome: string;
  partido: string;
  circulo: string;
  fotoUrl?: string;
  mandatos: number;
  ativo: boolean;
  // estatísticas agregadas, calculadas a partir do historial de votos
  percFavor?: number;
  percContra?: number;
  percAbstencao?: number;
  taxaPresenca?: number;
}

export interface Iniciativa {
  id: string;
  titulo: string;
  descricao?: string;
  tema: string;
  dataVoto: string; // formato: "23 Mar 2024"
  resultado: Resultado;
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
}

export interface Votacao {
  id: string;
  deputadoId: string;
  iniciativaId: string;
  posicao: Posicao;
}

// Resposta do utilizador a uma afirmação do teste de afinidade partidária
export type RespostaAfinidade = 'concordo' | 'neutro' | 'discordo';

export interface PerguntaAfinidade {
  id: string;
  tema: string;
  afirmacao: string;
  // a votação real com que a resposta é comparada
  referencia: string; // "Projeto de Lei n.º 511"
  iniciativaId: number;
  votacaoId: string;
}

export interface ResultadoAfinidade {
  partido: string;
  pontuacao: number; // 0-100, % de afinidade com base nas respostas
}
