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

