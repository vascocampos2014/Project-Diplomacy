import type { Posicao, ResultadoAfinidade, RespostaAfinidade } from '@/types';

import { MOCK_DEPUTADOS, MOCK_VOTACOES } from './mockData';
import { MOCK_PERGUNTAS_AFINIDADE } from './quizData';

// "concordo" com a afirmação equivale a um voto a favor da iniciativa associada,
// "discordo" a um voto contra, e "neutro" a uma abstenção.
const POSICAO_EQUIVALENTE: Record<RespostaAfinidade, Posicao> = {
  concordo: 'favor',
  neutro: 'abstencao',
  discordo: 'contra',
};

function posicaoPartidoNaIniciativa(partido: string, iniciativaId: string): Posicao | undefined {
  const deputado = MOCK_DEPUTADOS.find((d) => d.partido === partido);
  if (!deputado) return undefined;
  return MOCK_VOTACOES.find((v) => v.deputadoId === deputado.id && v.iniciativaId === iniciativaId)?.posicao;
}

// Pontuação de 0 a 1 para uma resposta vs. a posição do partido nessa iniciativa.
// Concordância total = 1, oposição total = 0, ausência/abstenção de qualquer
// lado conta como meio ponto (sem sinal claro nem a favor nem contra).
function pontuacaoResposta(equivalenteUtilizador: Posicao, posicaoPartido: Posicao | undefined): number {
  if (!posicaoPartido || posicaoPartido === 'ausente') return 0.5;
  if (equivalenteUtilizador === posicaoPartido) return 1;
  if (equivalenteUtilizador === 'abstencao' || posicaoPartido === 'abstencao') return 0.5;
  return 0;
}

// Calcula, para cada partido, a % de respostas do utilizador que coincidem com
// o seu historial real de votos. É informação factual, não uma recomendação de
// voto — ver secção "Neutralidade política" do CLAUDE.md.
export function calcularAfinidade(respostas: Record<string, RespostaAfinidade>): ResultadoAfinidade[] {
  const partidos = [...new Set(MOCK_DEPUTADOS.map((d) => d.partido))];

  return partidos
    .map((partido) => {
      let pontos = 0;
      let total = 0;

      for (const pergunta of MOCK_PERGUNTAS_AFINIDADE) {
        const resposta = respostas[pergunta.id];
        if (!resposta) continue;

        const equivalente = POSICAO_EQUIVALENTE[resposta];
        pontos += pontuacaoResposta(equivalente, posicaoPartidoNaIniciativa(partido, pergunta.iniciativaId));
        total += 1;
      }

      return { partido, pontuacao: total > 0 ? Math.round((pontos / total) * 100) : 0 };
    })
    .sort((a, b) => b.pontuacao - a.pontuacao);
}
