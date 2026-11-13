import type { ApiVotacaoList } from '@/lib/parlamento-api';
import { agregarPosicaoPartidos, eVotacaoProcedimental, referenciaVotacao, votacaoParaIniciativa } from '@/lib/parlamentoAdapters';
import type { Iniciativa } from '@/types';

// Os partidos em cada posição, do maior para o menor grupo parlamentar.
export interface PartidosPorPosicao {
  favor: string[];
  contra: string[];
  abstencao: string[];
}

export interface ItemFeed {
  iniciativa: Iniciativa;
  referencia: string;
  votacaoId: string;
  iniciativaId: number;
  partidos: PartidosPorPosicao;
}

export function partidosPorPosicao(
  votacao: Parameters<typeof agregarPosicaoPartidos>[0],
  lugaresPorPartido: Record<string, number>
): PartidosPorPosicao {
  const ordem = Object.keys(lugaresPorPartido).sort((a, b) => lugaresPorPartido[b] - lugaresPorPartido[a] || a.localeCompare(b));
  const out: PartidosPorPosicao = { favor: [], contra: [], abstencao: [] };
  for (const [partido, posicao] of agregarPosicaoPartidos(votacao, ordem)) {
    if (posicao !== 'ausente') out[posicao].push(partido);
  }
  return out;
}

// Uma iniciativa pode ser votada várias vezes no mesmo dia (texto final,
// requerimentos, confirmação de votações). O feed mostra um cartão por
// iniciativa — a primeira votação sobre o conteúdo que a API devolve — e
// esconde as votações só de procedimento.
export function montarFeed(
  votacoes: ApiVotacaoList[],
  lugaresPorPartido: Record<string, number>,
  maximo = 30
): ItemFeed[] {
  const vistas = new Set<number>();
  const itens: ItemFeed[] = [];
  for (const v of votacoes) {
    if (eVotacaoProcedimental(v.descricao) || vistas.has(v.iniciativaId)) continue;
    vistas.add(v.iniciativaId);
    itens.push({
      iniciativa: votacaoParaIniciativa(v, lugaresPorPartido),
      referencia: referenciaVotacao(v),
      votacaoId: v.id,
      iniciativaId: v.iniciativaId,
      partidos: partidosPorPosicao(v, lugaresPorPartido),
    });
    if (itens.length === maximo) break;
  }
  return itens;
}

export interface ResumoFeed {
  total: number;
  aprovadas: number;
  chumbadas: number;
}

export function resumirFeed(itens: ItemFeed[]): ResumoFeed {
  return {
    total: itens.length,
    aprovadas: itens.filter((i) => i.iniciativa.resultado === 'aprovada').length,
    chumbadas: itens.filter((i) => i.iniciativa.resultado === 'chumbada').length,
  };
}
