// Cliente fino sobre a API pública openAR (https://api.openar.pt/v1),
// construída a partir dos dados abertos oficiais da Assembleia da República.

const BASE_URL = 'https://api.openar.pt/v1';

export const LEGISLATURA = 'XVII';

export interface ApiPaginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiVotacaoList {
  id: string;
  data: string | null;
  resultado: 'Aprovado' | 'Rejeitado';
  unanime: boolean;
  reuniao?: string | null;
  tipoReuniao?: string | null;
  descricao?: string | null;
  aFavor: string[];
  contra: string[];
  abstencao: string[];
  ausencias: string[];
  detalhe?: string | null;
  iniciativaId: number;
  iniciativaTitulo: string;
  iniciativaNumero: string;
  iniciativaTipo: string;
  legislaturaId: string;
}

export interface ApiVotacaoDetail {
  id: string;
  data: string | null;
  resultado: 'Aprovado' | 'Rejeitado';
  unanime: boolean;
  reuniao?: string | null;
  tipoReuniao?: string | null;
  descricao?: string | null;
  aFavor: string[];
  contra: string[];
  abstencao: string[];
  ausencias: string[];
  detalhe?: string | null;
  eventoId?: number;
  iniciativaId: number;
  iniciativa: {
    id: number;
    titulo: string;
    numero: string;
    tipo: string;
    legislaturaId: string;
  };
}

export interface ApiDeputado {
  id: number;
  nomeParlamentar: string;
  nomeCompleto: string;
  grupoParlamentar: string | null;
  circuloEleitoral: string | null;
  legislaturaId: string;
  situacao: string | null;
}

export interface ApiMandato {
  id: number;
  legislaturaId: string;
  grupoParlamentar: string | null;
  circuloEleitoral: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  situacao: string | null;
}

export interface ApiDeputadoDetail {
  id: number;
  depId: number | null;
  nomeParlamentar: string;
  nomeCompleto: string;
  mandatos: ApiMandato[];
}

type ApiParams = Record<string, string | number | boolean | undefined>;

async function apiGet<T>(path: string, params: ApiParams = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`openAR API: erro ${res.status} em ${path}`);
  }
  return res.json();
}

export function fetchVotacoes(params: { page?: number; limit?: number; sort?: 'asc' | 'desc' } = {}) {
  return apiGet<ApiPaginated<ApiVotacaoList>>('/votacoes', {
    legislatura: LEGISLATURA,
    sort: 'desc',
    limit: 50,
    ...params,
  });
}

export function fetchVotacao(id: string, iniciativaId: number | string) {
  return apiGet<ApiVotacaoDetail>(`/votacoes/${id}`, { iniciativa_id: iniciativaId });
}

export function fetchDeputados(params: { page?: number; limit?: number; situacao?: string } = {}) {
  return apiGet<ApiPaginated<ApiDeputado>>('/deputados', {
    legislatura: LEGISLATURA,
    situacao: 'ativo',
    limit: 200,
    ...params,
  });
}

export function fetchDeputado(id: number | string) {
  return apiGet<ApiDeputadoDetail>(`/deputados/${id}`);
}

export function fotoUrl(deputadoId: number | string): string {
  return `https://cdn.openar.pt/fotos/${deputadoId}`;
}
