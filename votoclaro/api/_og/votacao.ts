// Dados de uma votação para a pré-visualização de ligações partilhadas
// (WhatsApp, iMessage, redes sociais): o título, a referência, o resultado e a
// contagem de lugares por sentido de voto, como no ecrã da votação.
// Corre numa função da Vercel, fora da app, por isso não usa os aliases `@/`:
// só importa o cliente openAR (que não depende de mais nada).
import { fetchDeputados, fetchVotacao, idNumerico, type ApiDeputado, type ApiVotacaoDetail } from '../../lib/parlamento-api';

export type Sentido = 'favor' | 'contra' | 'abstencao' | 'ausente';

export interface VotacaoPartilha {
  titulo: string;
  referencia: string;
  data: string | null; // "12 Nov 2026"
  resultado: 'Aprovada' | 'Chumbada';
  unanime: boolean;
  contagem: Record<Sentido, number>;
}

const TIPOS: Record<string, string> = {
  J: 'Projeto de Lei',
  P: 'Proposta de Lei',
  R: 'Projeto de Resolução',
  D: 'Projeto de Deliberação',
  S: 'Proposta de Resolução',
};

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function dataPt(data: string | null): string | null {
  const m = data?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${Number(m[3])} ${MESES[Number(m[2]) - 1]} ${m[1]}`;
}

// O mesmo critério que referenciaVotacao() em lib/parlamentoAdapters.ts.
function referencia(v: ApiVotacaoDetail): string {
  const partes = [`${TIPOS[v.iniciativa.tipo] ?? 'Iniciativa'} n.º ${v.iniciativa.numero}`];
  const autor = v.descricao?.match(/\(([A-Z][A-Za-z-]*)\)\s*$/)?.[1];
  if (autor) partes.push(autor);
  if (v.descricao?.startsWith('Texto final')) partes.push('Votação final global');
  else if (v.descricao?.startsWith('Texto de substituição')) partes.push('Texto de substituição');
  return partes.join(' · ');
}

// Lugares por grupo parlamentar. Mudam raramente: guardados enquanto a função
// estiver quente, para não pedir 230 deputados a cada imagem.
let lugaresCache: { em: number; lugares: Record<string, number> } | null = null;

async function lugaresPorPartido(): Promise<Record<string, number>> {
  if (lugaresCache && Date.now() - lugaresCache.em < 6 * 60 * 60_000) return lugaresCache.lugares;
  const primeira = await fetchDeputados({ page: 1, limit: 200 });
  const todos: ApiDeputado[] = [...primeira.data];
  const paginas = Math.ceil(primeira.total / primeira.limit);
  for (let page = 2; page <= paginas; page++) todos.push(...(await fetchDeputados({ page, limit: 200 })).data);
  const lugares: Record<string, number> = {};
  for (const d of todos) if (d.grupoParlamentar) lugares[d.grupoParlamentar] = (lugares[d.grupoParlamentar] ?? 0) + 1;
  lugaresCache = { em: Date.now(), lugares };
  return lugares;
}

// O mesmo critério que agregarPosicaoPartidos() em lib/parlamentoAdapters.ts.
function sentidoDoPartido(v: ApiVotacaoDetail, partido: string): Sentido {
  if (v.aFavor.includes(partido)) return 'favor';
  if (v.contra.includes(partido)) return 'contra';
  if (v.abstencao.includes(partido)) return 'abstencao';
  if (v.ausencias.includes(partido)) return 'ausente';
  const semRegistos = !v.aFavor.length && !v.contra.length && !v.abstencao.length && !v.ausencias.length;
  if (v.unanime && semRegistos) return v.resultado === 'Aprovado' ? 'favor' : 'contra';
  return 'ausente';
}

// Lança um erro se os ids não forem números (vêm do endereço, não são de confiança).
export async function carregarVotacao(id: string | null, iniciativaId: string | null): Promise<VotacaoPartilha> {
  const [v, lugares] = await Promise.all([
    fetchVotacao(idNumerico(id), idNumerico(iniciativaId)),
    lugaresPorPartido(),
  ]);
  const contagem: Record<Sentido, number> = { favor: 0, contra: 0, abstencao: 0, ausente: 0 };
  for (const [partido, n] of Object.entries(lugares)) contagem[sentidoDoPartido(v, partido)] += n;
  return {
    titulo: v.iniciativa.titulo,
    referencia: referencia(v),
    data: dataPt(v.data),
    resultado: v.resultado === 'Aprovado' ? 'Aprovada' : 'Chumbada',
    unanime: v.unanime,
    contagem,
  };
}
