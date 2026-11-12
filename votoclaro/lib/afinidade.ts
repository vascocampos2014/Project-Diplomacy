import type { PerguntaAfinidade, Posicao, ResultadoAfinidade, RespostaAfinidade } from '@/types';

// "concordo" com a afirmação equivale a um voto a favor da iniciativa associada,
// "discordo" a um voto contra, e "neutro" a uma abstenção.
const POSICAO_EQUIVALENTE: Record<RespostaAfinidade, Posicao> = {
  concordo: 'favor',
  neutro: 'abstencao',
  discordo: 'contra',
};

// Pontuação de 0 a 1 para uma resposta vs. a posição real do partido.
// Concordância total = 1, oposição total = 0; abstenção de qualquer lado conta
// meio ponto (sem sinal claro). Se o partido faltou à votação, a pergunta não
// conta para esse partido — não sabemos o que pensaria.
export function pontuacaoResposta(resposta: RespostaAfinidade, posicaoPartido: Posicao | undefined): number | null {
  if (!posicaoPartido || posicaoPartido === 'ausente') return null;
  const equivalente = POSICAO_EQUIVALENTE[resposta];
  if (equivalente === posicaoPartido) return 1;
  if (equivalente === 'abstencao' || posicaoPartido === 'abstencao') return 0.5;
  return 0;
}

// Para cada partido, a % de respostas do utilizador que coincidem com o voto
// REAL desse partido na iniciativa ligada a cada afirmação. É informação
// factual, não uma recomendação de voto (ver "Neutralidade política").
export function calcularAfinidade(
  perguntas: PerguntaAfinidade[],
  respostas: Record<string, RespostaAfinidade>,
  posicoesPorVotacao: Record<string, Map<string, Posicao>>,
  partidos: string[]
): ResultadoAfinidade[] {
  return partidos
    .map((partido) => {
      let pontos = 0;
      let contadas = 0;
      for (const pergunta of perguntas) {
        const resposta = respostas[pergunta.id];
        if (!resposta) continue;
        const p = pontuacaoResposta(resposta, posicoesPorVotacao[pergunta.votacaoId]?.get(partido));
        if (p === null) continue;
        pontos += p;
        contadas += 1;
      }
      return { partido, pontuacao: contadas > 0 ? Math.round((pontos / contadas) * 100) : 0, contadas };
    })
    .filter((r) => r.contadas > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao || a.partido.localeCompare(b.partido))
    .map(({ partido, pontuacao }) => ({ partido, pontuacao }));
}
