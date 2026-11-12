import { useQuery } from '@tanstack/react-query';

import { formatarDataPt } from '@/lib/format';
import { fetchVotacoes } from '@/lib/parlamento-api';
import type { ApiVotacaoList } from '@/lib/parlamento-api';
import { agregarPosicaoPartidos } from '@/lib/parlamentoAdapters';
import { classificarTema } from '@/lib/temas';
import type { Posicao } from '@/types';

export interface PartidoStat {
  favor: number;
  contra: number;
  abstencao: number;
  ausente: number;
  total: number;
}

export interface HistoricoItem {
  votacaoId: string;
  iniciativaId: number;
  titulo: string;
  tema: string;
  dataVoto: string;
  posicao: Posicao;
}

interface PartidoStatsData {
  stats: Record<string, PartidoStat>;
  historicoPorPartido: Record<string, HistoricoItem[]>;
}

async function fetchTodasVotacoes(): Promise<ApiVotacaoList[]> {
  const primeira = await fetchVotacoes({ page: 1, limit: 200 });
  const totalPaginas = Math.ceil(primeira.total / primeira.limit);

  const todas = [...primeira.data];
  for (let page = 2; page <= totalPaginas; page++) {
    const pagina = await fetchVotacoes({ page, limit: 200 });
    todas.push(...pagina.data);
  }
  return todas;
}

// Agrega o historial de votações de plenário por grupo parlamentar — usado
// no perfil do deputado (estatísticas + historial de votações do seu grupo).
export function usePartidoStats() {
  return useQuery({
    queryKey: ['votacoes-todas'],
    queryFn: async (): Promise<PartidoStatsData> => {
      const votacoes = await fetchTodasVotacoes();

      const partidos = new Set<string>();
      for (const v of votacoes) {
        for (const sigla of [...v.aFavor, ...v.contra, ...v.abstencao, ...v.ausencias]) {
          partidos.add(sigla);
        }
      }

      const stats: Record<string, PartidoStat> = {};
      const historicoPorPartido: Record<string, HistoricoItem[]> = {};
      for (const partido of partidos) {
        stats[partido] = { favor: 0, contra: 0, abstencao: 0, ausente: 0, total: 0 };
        historicoPorPartido[partido] = [];
      }

      for (const v of votacoes) {
        const posicoes = agregarPosicaoPartidos(v, [...partidos]);
        for (const partido of partidos) {
          const posicao = posicoes.get(partido) ?? 'ausente';
          const stat = stats[partido];
          stat.total += 1;
          stat[posicao] += 1;
          historicoPorPartido[partido].push({
            votacaoId: v.id,
            iniciativaId: v.iniciativaId,
            titulo: v.iniciativaTitulo,
            tema: classificarTema(v.iniciativaTitulo),
            dataVoto: formatarDataPt(v.data),
            posicao,
          });
        }
      }

      return { stats, historicoPorPartido };
    },
    staleTime: 24 * 60 * 60_000,
  });
}
