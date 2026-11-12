import type { HistoricoItem, PartidoStat } from '@/hooks/usePartidoStats';

export interface Divergencia {
  votacaoId: string;
  iniciativaId: number;
  titulo: string;
  tema: string;
  dataVoto: string;
  posicaoA: HistoricoItem['posicao'];
  posicaoB: HistoricoItem['posicao'];
}

export interface Concordancia {
  // Votações em que os dois partidos tomaram posição (nenhum ausente).
  comparaveis: number;
  iguais: number;
  percentagem: number | null;
  porTema: { tema: string; comparaveis: number; iguais: number; percentagem: number }[];
  divergencias: Divergencia[];
}

// Com que frequência dois grupos parlamentares votaram da mesma forma.
// Ausências não contam: não dizem nada sobre a posição do partido.
export function concordancia(a: HistoricoItem[], b: HistoricoItem[]): Concordancia {
  const deB = new Map(b.map((item) => [item.votacaoId, item]));
  let comparaveis = 0;
  let iguais = 0;
  const temas = new Map<string, { comparaveis: number; iguais: number }>();
  const divergencias: Divergencia[] = [];

  for (const itemA of a) {
    const itemB = deB.get(itemA.votacaoId);
    if (!itemB || itemA.posicao === 'ausente' || itemB.posicao === 'ausente') continue;

    comparaveis += 1;
    const tema = temas.get(itemA.tema) ?? { comparaveis: 0, iguais: 0 };
    tema.comparaveis += 1;
    temas.set(itemA.tema, tema);

    if (itemA.posicao === itemB.posicao) {
      iguais += 1;
      tema.iguais += 1;
    } else {
      divergencias.push({
        votacaoId: itemA.votacaoId,
        iniciativaId: itemA.iniciativaId,
        titulo: itemA.titulo,
        tema: itemA.tema,
        dataVoto: itemA.dataVoto,
        posicaoA: itemA.posicao,
        posicaoB: itemB.posicao,
      });
    }
  }

  return {
    comparaveis,
    iguais,
    percentagem: comparaveis > 0 ? Math.round((iguais / comparaveis) * 100) : null,
    porTema: [...temas.entries()]
      .map(([tema, t]) => ({ tema, ...t, percentagem: Math.round((t.iguais / t.comparaveis) * 100) }))
      .sort((x, y) => y.comparaveis - x.comparaveis),
    divergencias,
  };
}

export interface LinhaRanking {
  partido: string;
  percFavor: number;
  percContra: number;
  percAbstencao: number;
  votacoes: number;
}

// Partidos ordenados do que mais vota a favor para o que menos (DESIGN.md: PartidoBar).
export function rankingFavor(stats: Record<string, PartidoStat>, partidos?: string[]): LinhaRanking[] {
  return (partidos ?? Object.keys(stats))
    .filter((p) => stats[p] && stats[p].total - stats[p].ausente > 0)
    .map((partido) => {
      const s = stats[partido];
      const presentes = s.total - s.ausente;
      return {
        partido,
        percFavor: Math.round((s.favor / presentes) * 100),
        percContra: Math.round((s.contra / presentes) * 100),
        percAbstencao: Math.round((s.abstencao / presentes) * 100),
        votacoes: presentes,
      };
    })
    .sort((x, y) => y.percFavor - x.percFavor || x.partido.localeCompare(y.partido));
}
