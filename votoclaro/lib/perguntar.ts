// Cliente do backend RAG (backend/, FastAPI POST /ask).
//
// O URL vem de EXPO_PUBLIC_RAG_API_URL, que o Expo embute no bundle no
// momento do build. Sem ele (por exemplo, enquanto o backend não estiver
// alojado), o ecrã Perguntar mostra "em breve" em vez de falhar.
// Quando o backend tiver um URL público, junta-o também ao connect-src da
// CSP em vercel.json.

export const RAG_API_URL = (process.env.EXPO_PUBLIC_RAG_API_URL ?? '').replace(/\/+$/, '');

// Os mesmos limites que o backend valida (api.py › Pergunta).
export const MIN_PERGUNTA = 3;
export const MAX_PERGUNTA = 500;

// O agente pode demorar (várias chamadas de ferramentas e, se um modelo
// atingir o limite, troca para outro); acima disto desistimos.
export const TIMEOUT_MS = 90_000;

export interface RespostaRag {
  resposta: string;
  ferramentas: { name: string; arguments: Record<string, unknown> }[];
  segundos: number;
  modelo: string;
}

export type TipoErro = 'limite' | 'indisponivel' | 'rede' | 'tempo' | 'invalida';

export class ErroPergunta extends Error {
  constructor(
    public tipo: TipoErro,
    message: string
  ) {
    super(message);
    this.name = 'ErroPergunta';
  }
}

export const MENSAGENS_ERRO: Record<TipoErro, string> = {
  limite: 'Muitas perguntas seguidas. Espera um minuto e tenta de novo.',
  indisponivel: 'O serviço de respostas está indisponível de momento. Tenta mais tarde.',
  rede: 'Sem ligação ao serviço de respostas. Verifica a tua internet.',
  tempo: 'A resposta está a demorar demasiado. Tenta de novo.',
  invalida: 'A pergunta tem de ter entre 3 e 500 caracteres.',
};

export function validarPergunta(texto: string): string | null {
  const t = texto.trim();
  if (t.length < MIN_PERGUNTA || t.length > MAX_PERGUNTA) return null;
  return t;
}

export async function perguntar(
  texto: string,
  { baseUrl = RAG_API_URL, fetchImpl = fetch, timeoutMs = TIMEOUT_MS }: { baseUrl?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {}
): Promise<RespostaRag> {
  const pergunta = validarPergunta(texto);
  if (!pergunta) throw new ErroPergunta('invalida', MENSAGENS_ERRO.invalida);
  if (!baseUrl) throw new ErroPergunta('indisponivel', MENSAGENS_ERRO.indisponivel);

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetchImpl(`${baseUrl}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta }),
      signal: controlador.signal,
    });
  } catch (e) {
    const abortado = (e as { name?: string })?.name === 'AbortError';
    throw new ErroPergunta(abortado ? 'tempo' : 'rede', abortado ? MENSAGENS_ERRO.tempo : MENSAGENS_ERRO.rede);
  } finally {
    clearTimeout(temporizador);
  }

  if (res.status === 429) throw new ErroPergunta('limite', MENSAGENS_ERRO.limite);
  if (res.status === 422) throw new ErroPergunta('invalida', MENSAGENS_ERRO.invalida);
  if (!res.ok) throw new ErroPergunta('indisponivel', MENSAGENS_ERRO.indisponivel);

  const corpo = (await res.json().catch(() => null)) as Partial<RespostaRag> | null;
  if (!corpo || typeof corpo.resposta !== 'string') throw new ErroPergunta('indisponivel', MENSAGENS_ERRO.indisponivel);
  return {
    resposta: corpo.resposta,
    ferramentas: Array.isArray(corpo.ferramentas) ? corpo.ferramentas : [],
    segundos: typeof corpo.segundos === 'number' ? corpo.segundos : 0,
    modelo: typeof corpo.modelo === 'string' ? corpo.modelo : '',
  };
}

// --- Formatação da resposta --------------------------------------------------
// O modelo escreve **negrito**, citações [Projeto de Lei n.º 672, Artigo 2.º]
// e listas com "- ". Partimos o texto em parágrafos e cada parágrafo em
// pedaços, para o ecrã desenhar sem interpretar HTML nem Markdown arbitrário.

export type Pedaco = { tipo: 'texto'; texto: string; negrito?: boolean } | { tipo: 'citacao'; texto: string };

export interface Paragrafo {
  item: boolean; // linha de lista
  pedacos: Pedaco[];
}

// Só tratamos como citação o que parece uma referência de iniciativa; outros
// parênteses retos ficam como texto.
const CITACAO = /\[((?:Projeto|Proposta) de (?:Lei|Resolução)[^\]]*n\.º\s*\d+[^\]]*)\]/g;

function partirNegrito(texto: string): Pedaco[] {
  const out: Pedaco[] = [];
  texto.split(/(\*\*[^*]+\*\*)/g).forEach((p) => {
    if (!p) return;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) out.push({ tipo: 'texto', texto: p.slice(2, -2), negrito: true });
    else out.push({ tipo: 'texto', texto: p });
  });
  return out;
}

export function partirLinha(linha: string): Pedaco[] {
  const out: Pedaco[] = [];
  let ultimo = 0;
  for (const m of linha.matchAll(CITACAO)) {
    // O ecrã põe o seu próprio espaço antes do número da citação.
    const antes = linha.slice(ultimo, m.index).replace(/\s+$/, '');
    if (antes) out.push(...partirNegrito(antes));
    out.push({ tipo: 'citacao', texto: m[1].trim() });
    ultimo = (m.index ?? 0) + m[0].length;
  }
  const resto = linha.slice(ultimo);
  if (resto) out.push(...partirNegrito(resto));
  return out;
}

export function formatarResposta(texto: string): Paragrafo[] {
  return texto
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const item = /^[-*•]\s+/.test(l);
      return { item, pedacos: partirLinha(item ? l.replace(/^[-*•]\s+/, '') : l) };
    });
}

export function citacoes(texto: string): string[] {
  return [...new Set([...texto.matchAll(CITACAO)].map((m) => m[1].trim()))];
}

export const SUGESTOES = [
  'O que propõe o Projeto de Lei 672?',
  'Que iniciativas propuseram baixar o IVA do gás engarrafado?',
  'Quem votou contra a eliminação das portagens da A1 em Vila Franca de Xira?',
  'Como votou o PS no Projeto de Lei 511, sobre o crédito à habitação?',
];
