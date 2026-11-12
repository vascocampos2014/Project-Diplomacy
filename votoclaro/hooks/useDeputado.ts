import { useQuery } from '@tanstack/react-query';

import { LEGISLATURA, fetchDeputado } from '@/lib/parlamento-api';

export interface DeputadoDetalhe {
  id: number;
  nome: string;
  nomeCompleto: string;
  partido: string;
  circulo: string;
  numMandatos: number;
}

export function useDeputado(id: string | undefined) {
  return useQuery({
    queryKey: ['deputado', id],
    queryFn: async (): Promise<DeputadoDetalhe> => {
      const detalhe = await fetchDeputado(id!);
      const mandatoAtual = detalhe.mandatos.find((m) => m.legislaturaId === LEGISLATURA) ?? detalhe.mandatos[0];
      const numMandatos = new Set(detalhe.mandatos.map((m) => m.legislaturaId)).size;

      return {
        id: detalhe.id,
        nome: detalhe.nomeParlamentar,
        nomeCompleto: detalhe.nomeCompleto,
        partido: mandatoAtual?.grupoParlamentar ?? '—',
        circulo: mandatoAtual?.circuloEleitoral ?? '—',
        numMandatos,
      };
    },
    enabled: !!id,
    staleTime: 60 * 60_000,
  });
}
