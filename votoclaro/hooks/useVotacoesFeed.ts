import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchVotacoes } from '@/lib/parlamento-api';
import { eVotacaoProcedimental, referenciaVotacao, votacaoParaIniciativa } from '@/lib/parlamentoAdapters';
import type { Iniciativa } from '@/types';

export interface ItemFeed {
  iniciativa: Iniciativa;
  referencia: string;
  votacaoId: string;
  iniciativaId: number;
}

export function useVotacoesFeed() {
  const deputadosQuery = useDeputados();
  const lugaresPorPartido = deputadosQuery.data?.lugaresPorPartido;

  const votacoesQuery = useQuery({
    queryKey: ['votacoes-feed'],
    // Pede mais do que mostra: as votações procedimentais e repetidas são filtradas abaixo.
    queryFn: () => fetchVotacoes({ limit: 50 }),
    enabled: !!lugaresPorPartido,
  });

  let itens: ItemFeed[] | undefined;
  if (votacoesQuery.data && lugaresPorPartido) {
    // Uma iniciativa pode ser votada várias vezes no mesmo dia (texto final,
    // requerimentos, confirmação de votações). O feed mostra um cartão por
    // iniciativa: a primeira votação sobre o conteúdo que a API devolve.
    const vistas = new Set<number>();
    itens = [];
    for (const v of votacoesQuery.data.data) {
      if (eVotacaoProcedimental(v.descricao) || vistas.has(v.iniciativaId)) continue;
      vistas.add(v.iniciativaId);
      itens.push({
        iniciativa: votacaoParaIniciativa(v, lugaresPorPartido),
        referencia: referenciaVotacao(v),
        votacaoId: v.id,
        iniciativaId: v.iniciativaId,
      });
      if (itens.length === 30) break;
    }
  }

  return {
    itens,
    isLoading: deputadosQuery.isLoading || votacoesQuery.isLoading,
    isError: deputadosQuery.isError || votacoesQuery.isError,
    error: deputadosQuery.error ?? votacoesQuery.error,
  };
}
