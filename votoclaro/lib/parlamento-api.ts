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
  // A API deixou de incluir os mandatos neste endpoint (2026); tratar como opcional.
  mandatos?: ApiMandato[];
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

// Ids come from the address bar (/votacao/:id, /deputado/:id), so they are
// untrusted: only plain numbers may become part of an API path. Otherwise a
// crafted link could load a different openAR resource and show it as a vote.
export function idNumerico(id: number | string | undefined | null): string {
  const s = String(id ?? '').trim();
  if (!/^\d{1,12}$/.test(s)) throw new Error('Identificador inválido');
  return s;
}

export async function fetchVotacao(id: string, iniciativaId: number | string) {
  return apiGet<ApiVotacaoDetail>(`/votacoes/${idNumerico(id)}`, { iniciativa_id: idNumerico(iniciativaId) });
}

export function fetchDeputados(params: { page?: number; limit?: number; situacao?: string } = {}) {
  return apiGet<ApiPaginated<ApiDeputado>>('/deputados', {
    legislatura: LEGISLATURA,
    situacao: 'ativo',
    limit: 200,
    ...params,
  });
}

export async function fetchDeputado(id: number | string) {
  return apiGet<ApiDeputadoDetail>(`/deputados/${idNumerico(id)}`);
}

// Never throws (it runs while rendering lists): an odd id just means no photo,
// and the avatar falls back to initials.
export function fotoUrl(deputadoId: number | string): string | undefined {
  try {
    return `https://cdn.openar.pt/fotos/${idNumerico(deputadoId)}`;
  } catch {
    return undefined;
  }
}
