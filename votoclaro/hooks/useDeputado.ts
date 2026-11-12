import { useQuery } from '@tanstack/react-query';

import { useDeputados } from '@/hooks/useDeputados';
import { fetchDeputado } from '@/lib/parlamento-api';
import { montarDeputadoDetalhe, type DeputadoDetalhe } from '@/lib/parlamentoAdapters';

export type { DeputadoDetalhe };

export function useDeputado(id: string | undefined) {
  const lista = useDeputados();
  const daLista = id ? lista.data?.porId.get(id) : undefined;

  const detalhe = useQuery({
    queryKey: ['deputado', id],
    queryFn: () => fetchDeputado(id!),
    enabled: !!id,
    staleTime: 60 * 60_000,
  });

  const data = detalhe.data ? montarDeputadoDetalhe(detalhe.data, daLista) : undefined;
  return {
    data,
    isLoading: detalhe.isLoading || lista.isLoading,
    isError: detalhe.isError,
  };
}
