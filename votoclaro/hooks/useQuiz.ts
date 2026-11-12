import { useQueries } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchVotacao } from '@/lib/parlamento-api';
import { agregarPosicaoPartidos } from '@/lib/parlamentoAdapters';
import { PERGUNTAS_AFINIDADE } from '@/lib/quizData';
import type { Posicao } from '@/types';

// Carrega o voto real de cada partido nas votações ligadas às perguntas do quiz.
export function useQuiz() {
  const deputadosQuery = useDeputados();
  const partidos = Object.keys(deputadosQuery.data?.lugaresPorPartido ?? {});

  const votos = useQueries({
    queries: PERGUNTAS_AFINIDADE.map((p) => ({
      queryKey: ['votacao', p.votacaoId, String(p.iniciativaId)],
      queryFn: () => fetchVotacao(p.votacaoId, p.iniciativaId),
      staleTime: 24 * 60 * 60_000,
    })),
  });

  const pronto = partidos.length > 0 && votos.every((q) => q.data);
  const posicoesPorVotacao: Record<string, Map<string, Posicao>> = {};
  if (pronto) {
    PERGUNTAS_AFINIDADE.forEach((p, i) => {
      posicoesPorVotacao[p.votacaoId] = agregarPosicaoPartidos(votos[i].data!, partidos);
    });
  }

  return {
    perguntas: PERGUNTAS_AFINIDADE,
    partidos,
    posicoesPorVotacao,
    pronto,
    isError: deputadosQuery.isError || votos.some((q) => q.isError),
  };
}
