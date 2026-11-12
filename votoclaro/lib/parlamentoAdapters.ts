import { formatarDataPt } from '@/lib/format';
import type { ApiDeputado } from '@/lib/parlamento-api';
import { fotoUrl } from '@/lib/parlamento-api';
import { classificarTema } from '@/lib/temas';
import type { Deputado, Iniciativa, Posicao } from '@/types';

interface VotacaoComoVoto {
  aFavor: string[];
  contra: string[];
  abstencao: string[];
  ausencias: string[];
  unanime: boolean;
  resultado: 'Aprovado' | 'Rejeitado';
}

export interface VotacaoParaIniciativaInput extends VotacaoComoVoto {
  iniciativaId: number;
  iniciativaTitulo: string;
  data: string | null;
}

// Os dados oficiais só registam a posição de cada grupo parlamentar, não de
// cada deputado. Devolve a posição de cada partido nesta votação — incluindo
// o caso de uma votação unânime em que os arrays vêm todos vazios.
export function agregarPosicaoPartidos(votacao: VotacaoComoVoto, partidos: string[]): Map<string, Posicao> {
  const semRegistos =
    votacao.aFavor.length === 0 &&
    votacao.contra.length === 0 &&
    votacao.abstencao.length === 0 &&
    votacao.ausencias.length === 0;

  const mapa = new Map<string, Posicao>();
  for (const partido of partidos) {
    if (votacao.aFavor.includes(partido)) {
      mapa.set(partido, 'favor');
    } else if (votacao.contra.includes(partido)) {
      mapa.set(partido, 'contra');
    } else if (votacao.abstencao.includes(partido)) {
      mapa.set(partido, 'abstencao');
    } else if (votacao.ausencias.includes(partido)) {
      mapa.set(partido, 'ausente');
    } else if (votacao.unanime && semRegistos) {
      mapa.set(partido, votacao.resultado === 'Aprovado' ? 'favor' : 'contra');
    } else {
      mapa.set(partido, 'ausente');
    }
  }
  return mapa;
}

// Número de deputados em efetividade por grupo parlamentar — usado para
// transformar posições de partido em contagens de votos.
export function contarLugaresPorPartido(deputados: ApiDeputado[]): Record<string, number> {
  const contagem: Record<string, number> = {};
  for (const d of deputados) {
    if (!d.grupoParlamentar) continue;
    contagem[d.grupoParlamentar] = (contagem[d.grupoParlamentar] ?? 0) + 1;
  }
  return contagem;
}

export function votacaoParaIniciativa(
  votacao: VotacaoParaIniciativaInput,
  lugaresPorPartido: Record<string, number>
): Iniciativa {
  const partidos = Object.keys(lugaresPorPartido);
  const posicoes = agregarPosicaoPartidos(votacao, partidos);

  let favor = 0;
  let contra = 0;
  let abstencao = 0;
  let ausentes = 0;

  for (const partido of partidos) {
    const lugares = lugaresPorPartido[partido];
    switch (posicoes.get(partido)) {
      case 'favor':
        favor += lugares;
        break;
      case 'contra':
        contra += lugares;
        break;
      case 'abstencao':
        abstencao += lugares;
        break;
      default:
        ausentes += lugares;
        break;
    }
  }

  return {
    id: String(votacao.iniciativaId),
    titulo: votacao.iniciativaTitulo,
    tema: classificarTema(votacao.iniciativaTitulo),
    dataVoto: formatarDataPt(votacao.data),
    resultado: votacao.resultado === 'Aprovado' ? 'aprovada' : 'chumbada',
    favor,
    contra,
    abstencao,
    ausentes,
  };
}

const TIPOS_INICIATIVA: Record<string, string> = {
  J: 'Projeto de Lei',
  P: 'Proposta de Lei',
  R: 'Projeto de Resolução',
  D: 'Projeto de Deliberação',
  S: 'Proposta de Resolução',
};

// Votações sobre o procedimento (dispensa de redação final, baixa à comissão,
// confirmação de votações indiciárias…) e não sobre o conteúdo da iniciativa.
export function eVotacaoProcedimental(descricao: string | null | undefined): boolean {
  if (!descricao) return false;
  return /^Requerimento/i.test(descricao) || /assunção pelo Plenário/i.test(descricao);
}

// Linha de referência mostrada no cartão, p. ex. "Projeto de Lei n.º 672 · CDS-PP · Votação final global".
// Distingue iniciativas diferentes com o mesmo título (comum quando vários partidos
// apresentam propostas parecidas) e as várias fases de votação de uma mesma iniciativa.
export function referenciaVotacao(v: {
  iniciativaTipo: string;
  iniciativaNumero: string;
  descricao?: string | null;
}): string {
  const tipo = TIPOS_INICIATIVA[v.iniciativaTipo] ?? 'Iniciativa';
  const partes = [`${tipo} n.º ${v.iniciativaNumero}`];

  const autor = v.descricao?.match(/\(([A-Z][A-Za-z-]*)\)\s*$/)?.[1];
  if (autor) partes.push(autor);

  if (v.descricao?.startsWith('Texto final')) partes.push('Votação final global');
  else if (v.descricao?.startsWith('Texto de substituição')) partes.push('Texto de substituição');

  return partes.join(' · ');
}

export function deputadoApiParaDeputado(d: ApiDeputado): Deputado {
  return {
    id: String(d.id),
    nome: d.nomeParlamentar,
    partido: d.grupoParlamentar ?? '—',
    circulo: d.circuloEleitoral ?? '—',
    fotoUrl: fotoUrl(d.id),
    mandatos: 1,
    ativo: d.situacao !== null,
  };
}
