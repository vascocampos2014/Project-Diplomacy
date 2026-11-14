import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchVotacao } from '@/lib/parlamento-api';
import {
  agregarPosicaoPartidos,
  paginaIniciativa,
  referenciaVotacao,
  TIPOS_INICIATIVA,
  votacaoParaIniciativa,
} from '@/lib/parlamentoAdapters';
import { urlOficial } from '@/lib/perguntar';
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
  // Para ligar a votação à sua fonte: "Proposta de Lei n.º 110", o tipo (para o
  // glossário) e a página oficial da iniciativa.
  let referencia: string | undefined;
  let tipoIniciativa: string | undefined;
  let urlIniciativa: string | null = null;

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
    referencia = referenciaVotacao({ iniciativaTipo: v.iniciativa.tipo, iniciativaNumero: v.iniciativa.numero, descricao: v.descricao });
    tipoIniciativa = TIPOS_INICIATIVA[v.iniciativa.tipo];
    urlIniciativa = urlOficial(paginaIniciativa(v.iniciativaId));
  }

  return {
    iniciativa,
    posicaoPorPartido,
    referencia,
    tipoIniciativa,
    urlIniciativa,
    isLoading: deputadosQuery.isLoading || votacaoQuery.isLoading,
    isError: deputadosQuery.isError || votacaoQuery.isError,
    error: deputadosQuery.error ?? votacaoQuery.error,
  };
}
