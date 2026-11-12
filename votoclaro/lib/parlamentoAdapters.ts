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
