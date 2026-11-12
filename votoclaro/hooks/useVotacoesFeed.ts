import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { montarFeed } from '@/lib/feed';
import type { ItemFeed } from '@/lib/feed';
import { fetchVotacoes } from '@/lib/parlamento-api';

export type { ItemFeed };

export function useVotacoesFeed() {
  const deputadosQuery = useDeputados();
  const lugaresPorPartido = deputadosQuery.data?.lugaresPorPartido;

  const votacoesQuery = useQuery({
    queryKey: ['votacoes-feed'],
    // Pede mais do que mostra: as votações procedimentais e repetidas são filtradas.
    queryFn: () => fetchVotacoes({ limit: 50 }),
    enabled: !!lugaresPorPartido,
  });

  const itens =
    votacoesQuery.data && lugaresPorPartido ? montarFeed(votacoesQuery.data.data, lugaresPorPartido) : undefined;

  return {
    itens,
    isLoading: deputadosQuery.isLoading || votacoesQuery.isLoading,
    isError: deputadosQuery.isError || votacoesQuery.isError,
    error: deputadosQuery.error ?? votacoesQuery.error,
    refetch: () => Promise.all([deputadosQuery.refetch(), votacoesQuery.refetch()]),
  };
}
