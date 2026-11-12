import { useQuery } from '@tanstack/react-query';

import { contarLugaresPorPartido, deputadoApiParaDeputado } from '@/lib/parlamentoAdapters';
import { fetchDeputados } from '@/lib/parlamento-api';
import type { ApiDeputado } from '@/lib/parlamento-api';
import type { Deputado } from '@/types';

interface DeputadosData {
  deputados: Deputado[];
  porId: Map<string, ApiDeputado>;
  lugaresPorPartido: Record<string, number>;
}

async function fetchTodosDeputados(): Promise<ApiDeputado[]> {
  const primeira = await fetchDeputados({ page: 1, limit: 200 });
  const totalPaginas = Math.ceil(primeira.total / primeira.limit);

  const todos = [...primeira.data];
  for (let page = 2; page <= totalPaginas; page++) {
    const pagina = await fetchDeputados({ page, limit: 200 });
    todos.push(...pagina.data);
  }
  return todos;
}

export function useDeputados() {
  return useQuery({
    queryKey: ['deputados'],
    queryFn: async (): Promise<DeputadosData> => {
      const apiDeputados = await fetchTodosDeputados();

      return {
        deputados: apiDeputados
          .map(deputadoApiParaDeputado)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt')),
        porId: new Map(apiDeputados.map((d) => [String(d.id), d])),
        lugaresPorPartido: contarLugaresPorPartido(apiDeputados),
      };
    },
    staleTime: 60 * 60_000,
  });
}
