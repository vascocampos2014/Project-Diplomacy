import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchVotacao } from '@/lib/parlamento-api';
import { agregarPosicaoPartidos, votacaoParaIniciativa } from '@/lib/parlamentoAdapters';
import type { Iniciativa, Posicao } from '@/types';

export function useVotacaoDetalhe(votacaoId: string | undefined, iniciativaId: string | undefined) {
  const deputadosQuery = useDeputados();
  const lugaresPorPartido = deputadosQuery.data?.lugaresPorPartido;

  const votacaoQuery = useQuery({
    queryKey: ['votacao', votacaoId, iniciativaId],
    queryFn: () => fetchVotacao(votacaoId!, iniciativaId!),
    enabled: !!votacaoId && !!iniciativaId,
  });

  let iniciativa: Iniciativa | undefined;
  let posicaoPorPartido: Map<string, Posicao> | undefined;

  if (votacaoQuery.data && lugaresPorPartido) {
    const v = votacaoQuery.data;
    posicaoPorPartido = agregarPosicaoPartidos(v, Object.keys(lugaresPorPartido));
    iniciativa = votacaoParaIniciativa(
      {
        iniciativaId: v.iniciativaId,
        iniciativaTitulo: v.iniciativa.titulo,
        data: v.data,
        resultado: v.resultado,
        unanime: v.unanime,
        aFavor: v.aFavor,
        contra: v.contra,
        abstencao: v.abstencao,
        ausencias: v.ausencias,
      },
      lugaresPorPartido
    );
  }

  return {
    iniciativa,
    posicaoPorPartido,
    isLoading: deputadosQuery.isLoading || votacaoQuery.isLoading,
    isError: deputadosQuery.isError || votacaoQuery.isError,
    error: deputadosQuery.error ?? votacaoQuery.error,
  };
}
