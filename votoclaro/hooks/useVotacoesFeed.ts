import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchVotacoes } from '@/lib/parlamento-api';
import { votacaoParaIniciativa } from '@/lib/parlamentoAdapters';
import type { Iniciativa } from '@/types';

export interface ItemFeed {
  iniciativa: Iniciativa;
  votacaoId: string;
  iniciativaId: number;
}

export function useVotacoesFeed() {
  const deputadosQuery = useDeputados();
  const lugaresPorPartido = deputadosQuery.data?.lugaresPorPartido;

  const votacoesQuery = useQuery({
    queryKey: ['votacoes-feed'],
    queryFn: () => fetchVotacoes({ limit: 30 }),
    enabled: !!lugaresPorPartido,
  });

  const itens: ItemFeed[] | undefined =
    votacoesQuery.data && lugaresPorPartido
      ? votacoesQuery.data.data.map((v) => ({
          iniciativa: votacaoParaIniciativa(v, lugaresPorPartido),
          votacaoId: v.id,
          iniciativaId: v.iniciativaId,
        }))
      : undefined;

  return {
    itens,
    isLoading: deputadosQuery.isLoading || votacoesQuery.isLoading,
    isError: deputadosQuery.isError || votacoesQuery.isError,
    error: deputadosQuery.error ?? votacoesQuery.error,
  };
}
