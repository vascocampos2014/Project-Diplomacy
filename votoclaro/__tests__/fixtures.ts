import type { HistoricoItem } from '@/hooks/usePartidoStats';
import type { ApiVotacaoList } from '@/lib/parlamento-api';

export function votacao(over: Partial<ApiVotacaoList> = {}): ApiVotacaoList {
  return {
    id: '1',
    data: '2026-10-28',
    resultado: 'Aprovado',
    unanime: false,
    descricao: null,
    aFavor: ['PSD'],
    contra: ['PS'],
    abstencao: [],
    ausencias: [],
    iniciativaId: 100,
    iniciativaTitulo: 'Aumenta a dedução à coleta de IRS',
    iniciativaNumero: '672',
    iniciativaTipo: 'J',
    legislaturaId: 'XVII',
    ...over,
  };
}

export const LUGARES = { PSD: 89, PS: 58, CH: 60, IL: 9, L: 6, PCP: 3, BE: 1, PAN: 1, JPP: 1, 'CDS-PP': 2 };

export function historico(votacaoId: string, posicao: HistoricoItem['posicao'], tema = 'Economia'): HistoricoItem {
  return { votacaoId, iniciativaId: Number(votacaoId), titulo: `Iniciativa ${votacaoId}`, tema, dataVoto: '28 Out 2026', posicao };
}
