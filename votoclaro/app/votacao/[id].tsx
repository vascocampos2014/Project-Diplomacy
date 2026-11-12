import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/components/BarraProgresso';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { EstatisticasVotacao } from '@/components/EstatisticasVotacao';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacaoDetalhe } from '@/hooks/useVotacaoDetalhe';
import type { Resultado } from '@/types';

const RESULTADO_LABELS: Record<Resultado, string> = {
  aprovada: 'Aprovada',
  chumbada: 'Chumbada',
  pendente: 'Pendente',
};

export default function VotacaoDetalheScreen() {
  const { id, iniciativaId } = useLocalSearchParams<{ id: string; iniciativaId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const { iniciativa, posicaoPorPartido, isLoading, isError } = useVotacaoDetalhe(id, iniciativaId);
  const deputadosQuery = useDeputados();

  if (isLoading || deputadosQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Votação' }} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || deputadosQuery.isError || !iniciativa || !posicaoPorPartido) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Votação' }} />
        <EcraVazio
          icone="search-off"
          titulo="Votação não encontrada"
          descricao="Esta votação pode já não estar disponível."
        />
      </SafeAreaView>
    );
  }

  const deputados = deputadosQuery.data?.deputados ?? [];
  const total = iniciativa.favor + iniciativa.contra + iniciativa.abstencao + iniciativa.ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const resultadoColor =
    iniciativa.resultado === 'aprovada'
      ? colors.favor
      : iniciativa.resultado === 'chumbada'
        ? colors.contra
        : colors.abstencao;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: iniciativa.tema }} />
      <FlatList
        data={deputados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={[Typography.caption, styles.tema, { color: colors.tint }]}>
                {iniciativa.tema.toUpperCase()}
              </Text>
              <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>{iniciativa.dataVoto}</Text>
            </View>
            <Text style={[Typography.displaySm, styles.titulo, { color: colors.text }]}>{iniciativa.titulo}</Text>
            <View style={styles.barraWrapper}>
              <BarraProgresso
                favor={pct(iniciativa.favor)}
                contra={pct(iniciativa.contra)}
                abstencao={pct(iniciativa.abstencao)}
                height={8}
              />
            </View>
            {total > 0 && (
              <View style={styles.statsWrapper}>
                <EstatisticasVotacao
                  favor={iniciativa.favor}
                  contra={iniciativa.contra}
                  abstencao={iniciativa.abstencao}
                  ausentes={iniciativa.ausentes}
                />
              </View>
            )}
            <Text style={[Typography.label, styles.resultado, { color: resultadoColor }]}>
              {RESULTADO_LABELS[iniciativa.resultado]}
              {total > 0 ? ` · ${total} votos totais` : ''}
            </Text>
            <Text style={[Typography.label, styles.subheading, { color: colors.text }]}>
              Como votou cada deputado
            </Text>
            <Text style={[Typography.caption, styles.nota, { color: colors.tabIconDefault }]}>
              A posição mostrada corresponde ao voto do grupo parlamentar de cada deputado nesta votação.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => (
          <DeputadoRow
            nome={item.nome}
            partido={item.partido}
            circulo={item.circulo}
            fotoUrl={item.fotoUrl}
            posicao={posicaoPorPartido.get(item.partido) ?? 'ausente'}
          />
        )}
        ListEmptyComponent={
          <Text style={[Typography.bodySm, { color: colors.tabIconDefault }]}>Ainda não há registo de votos.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tema: {
    letterSpacing: 0.5,
  },
  titulo: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  barraWrapper: {
    marginBottom: Spacing.md,
  },
  statsWrapper: {
    marginBottom: Spacing.md,
  },
  resultado: {
    marginBottom: Spacing.xl,
  },
  subheading: {
    marginBottom: Spacing.xs,
  },
  nota: {
    marginBottom: Spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
