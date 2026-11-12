import type { ApiVotacaoList } from '@/lib/parlamento-api';
import { eVotacaoProcedimental, referenciaVotacao, votacaoParaIniciativa } from '@/lib/parlamentoAdapters';
import type { Iniciativa } from '@/types';

export interface ItemFeed {
  iniciativa: Iniciativa;
  referencia: string;
  votacaoId: string;
  iniciativaId: number;
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
