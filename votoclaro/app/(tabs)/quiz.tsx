import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AfinidadeQuestaoCard } from '@/components/AfinidadeQuestaoCard';
import { EcraVazio } from '@/components/EcraVazio';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { PartidoBar } from '@/components/PartidoBar';
import { Aviso, Botao, CabecalhoEcra, Cartao, Contentor, TituloSecao, useCores } from '@/components/ui';
import { VotoIndicator } from '@/components/VotoIndicator';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useQuiz } from '@/hooks/useQuiz';
import { calcularAfinidade } from '@/lib/afinidade';
import type { RespostaAfinidade } from '@/types';

const SIMBOLO_RESPOSTA: Record<RespostaAfinidade, string> = { concordo: '✓ Concordo', neutro: '— Neutro', discordo: '✗ Discordo' };

export default function QuizScreen() {
  const cores = useCores();
  const router = useRouter();
  const { perguntas, partidos, posicoesPorVotacao, pronto, isError } = useQuiz();
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, RespostaAfinidade>>({});

  const total = perguntas.length;
  const terminou = indice >= total;
  const pergunta = perguntas[Math.min(indice, total - 1)];

  const resultados = useMemo(
    () => (terminou && pronto ? calcularAfinidade(perguntas, respostas, posicoesPorVotacao, partidos) : []),
    [terminou, pronto, perguntas, respostas, posicoesPorVotacao, partidos]
  );

  function responder(resposta: RespostaAfinidade) {
    setRespostas((r) => ({ ...r, [pergunta.id]: resposta }));
    setIndice((i) => i + 1);
  }

  function repetir() {
    setIndice(0);
    setRespostas({});
  }

  async function partilhar() {
    const topo = resultados.slice(0, 3).map((r) => `${r.partido} ${r.pontuacao}%`).join(', ');
    await Share.share({
      message: `Fiz o teste de afinidade do VotoClaro: as minhas respostas coincidiram mais com os votos reais de ${topo}. Faz o teu!`,
    });
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Contentor>
          <CabecalhoEcra
            titulo="Afinidade"
            subtitulo="Responde a propostas que foram mesmo votadas no Parlamento e vê que partidos votaram como tu."
            direita={<MenuTresPontos />}
          />

          {isError ? (
            <EcraVazio icone="cloud-off" titulo="Não foi possível carregar" descricao="Verifica a tua ligação à internet e tenta de novo." />
          ) : terminou ? (
            !pronto ? (
              <View style={styles.carregar}>
                <ActivityIndicator color={cores.tint} />
              </View>
            ) : (
              <>
                <Cartao>
                  <Text style={[Typography.eyebrow, { color: cores.textMuted }]}>Resultado</Text>
                  <Text style={[Typography.bodySm, styles.resultadoTexto, { color: cores.text }]}>
                    Percentagem das tuas respostas que coincidem com o voto de cada partido nas {total} votações.
                  </Text>
                  {resultados.map((r) => (
                    <PartidoBar key={r.partido} partido={r.partido} percentagem={r.pontuacao} legenda="de coincidência" />
                  ))}
                </Cartao>
                <View style={styles.aviso}>
                  <Aviso>
                    Isto é informação sobre votos passados, não uma recomendação de voto. Um partido que faltou a uma
                    votação não é avaliado nessa pergunta.
                  </Aviso>
                </View>
                <View style={styles.botoes}>
                  <Botao label="Partilhar resultado" icone="share" onPress={partilhar} />
                  <Botao label="Repetir" icone="replay" variante="secundario" onPress={repetir} />
                </View>

                <TituloSecao nota="Toca numa votação para ver como votou cada partido.">As tuas respostas</TituloSecao>
                <Cartao style={styles.semPadding}>
                  {perguntas.map((p, i) => (
                    <Pressable
                      key={p.id}
                      onPress={() => router.push({ pathname: '/votacao/[id]', params: { id: p.votacaoId, iniciativaId: String(p.iniciativaId) } })}
                      style={({ pressed }) => [styles.resposta, i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { opacity: 0.7 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.afirmacao}. Respondeste: ${respostas[p.id] ?? 'sem resposta'}. ${p.referencia}`}
                    >
                      <Text style={[Typography.bodySm, { color: cores.text }]}>{p.afirmacao}</Text>
                      <View style={styles.respostaMeta}>
                        <Text style={[Typography.label, { color: cores.tintInk }]}>{respostas[p.id] ? SIMBOLO_RESPOSTA[respostas[p.id]] : '—'}</Text>
                        <Text style={[Typography.caption, { color: cores.textMuted }]}>{p.referencia}</Text>
                      </View>
                    </Pressable>
                  ))}
                </Cartao>
              </>
            )
          ) : (
            <>
              <View style={styles.progresso}>
                <View style={styles.progressoTopo}>
                  <Text style={[Typography.eyebrow, { color: cores.textMuted }]}>
                    Pergunta {indice + 1} de {total}
                  </Text>
                  <View style={styles.pontos} accessible={false}>
                    {perguntas.map((p, i) => (
                      <View key={p.id} style={[styles.ponto, { backgroundColor: i <= indice ? cores.tint : cores.border }]} />
                    ))}
                  </View>
                </View>
              </View>
              <AfinidadeQuestaoCard
                tema={pergunta.tema}
                afirmacao={pergunta.afirmacao}
                respostaSelecionada={respostas[pergunta.id] ?? null}
                onResponder={responder}
              />
              <View style={styles.rodape}>
                {indice > 0 ? <Botao label="Anterior" icone="arrow-back" variante="secundario" onPress={() => setIndice((i) => i - 1)} /> : <View />}
                <Text style={[Typography.caption, styles.fonte, { color: cores.textMuted }]}>Baseado no {pergunta.referencia}</Text>
              </View>
              <View style={styles.legenda}>
                <VotoIndicator posicao="favor" size="sm" />
                <Text style={[Typography.caption, { color: cores.textMuted, flex: 1 }]}>
                  “Concordo” conta como voto a favor da proposta, “Discordo” como voto contra e “Neutro” como abstenção.
                </Text>
              </View>
            </>
          )}
        </Contentor>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecra: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
  progresso: {
    marginBottom: Spacing.md,
  },
  progressoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pontos: {
    flexDirection: 'row',
    gap: 6,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  rodape: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  fonte: {
    flexShrink: 1,
    textAlign: 'right',
  },
  legenda: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  resultadoTexto: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  aviso: {
    marginTop: Spacing.lg,
  },
  botoes: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  semPadding: {
    paddingVertical: 0,
  },
  resposta: {
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  respostaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});
