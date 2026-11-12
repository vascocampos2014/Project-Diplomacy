import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AfinidadeQuestaoCard } from '@/components/AfinidadeQuestaoCard';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { ResultadoAfinidadeBarra } from '@/components/ResultadoAfinidadeBarra';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { calcularAfinidade } from '@/lib/afinidade';
import { hexToRgba } from '@/lib/format';
import { MOCK_PERGUNTAS_AFINIDADE } from '@/lib/quizData';
import type { RespostaAfinidade } from '@/types';

export default function QuizScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, RespostaAfinidade>>({});

  const total = MOCK_PERGUNTAS_AFINIDADE.length;
  const terminou = indice >= total;
  const pergunta = MOCK_PERGUNTAS_AFINIDADE[indice];

  function responder(resposta: RespostaAfinidade) {
    setRespostas((atual) => ({ ...atual, [pergunta.id]: resposta }));
    setIndice((atual) => atual + 1);
  }

  function repetir() {
    setIndice(0);
    setRespostas({});
  }

  const resultados = terminou ? calcularAfinidade(respostas) : [];

  async function partilhar() {
    const principal = resultados[0];
    await Share.share({
      message: principal
        ? `Fiz o teste de afinidade partidária do VotoClaro. As minhas respostas coincidiram mais com o historial de voto do ${principal.partido} (${principal.pontuacao}%). Testa tu também!`
        : 'Fiz o teste de afinidade partidária do VotoClaro!',
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextos}>
              <Text style={[Typography.displayLg, { color: colors.text }]}>Quiz</Text>
              <Text style={[Typography.bodySm, styles.subtitulo, { color: colors.tabIconDefault }]}>
                Afinidade Partidária — responde a afirmações sobre políticas reais e descobre que partidos votaram
                como tu.
              </Text>
            </View>
            <MenuTresPontos />
          </View>
        </View>

        {terminou ? (
          <>
            <View style={styles.resultados}>
              {resultados.map((resultado) => (
                <ResultadoAfinidadeBarra
                  key={resultado.partido}
                  partido={resultado.partido}
                  pontuacao={resultado.pontuacao}
                />
              ))}
            </View>
            <View style={[styles.aviso, { backgroundColor: hexToRgba(colors.text, 0.05) }]}>
              <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>
                Esta comparação baseia-se apenas em dados públicos de votação. É informação, não uma recomendação de
                voto.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: colors.tint }]}
              onPress={repetir}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Repetir teste"
            >
              <Text style={[styles.botaoLabel, { color: colors.background }]}>Repetir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoSecundario, { borderColor: colors.border }]}
              onPress={partilhar}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Partilhar resultado"
            >
              <Text style={[Typography.label, { color: colors.text }]}>Partilhar resultado</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.progresso}>
              <Text style={[Typography.label, { color: colors.tabIconDefault }]}>
                PERGUNTA {indice + 1} DE {total}
              </Text>
              <View style={[styles.trilho, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.barra, { width: `${((indice + 1) / total) * 100}%`, backgroundColor: colors.tint }]}
                />
              </View>
            </View>
            <AfinidadeQuestaoCard
              tema={pergunta.tema}
              afirmacao={pergunta.afirmacao}
              respostaSelecionada={respostas[pergunta.id] ?? null}
              onResponder={responder}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextos: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  subtitulo: {
    marginTop: Spacing.xs,
  },
  progresso: {
    marginBottom: Spacing.xl,
  },
  trilho: {
    height: 6,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  barra: {
    height: '100%',
  },
  resultados: {
    marginBottom: Spacing.lg,
  },
  aviso: {
    borderRadius: Radii.chip,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  botao: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.badge,
  },
  botaoSecundario: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.badge,
    borderWidth: StyleSheet.hairlineWidth,
  },
  botaoLabel: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 15,
  },
});
