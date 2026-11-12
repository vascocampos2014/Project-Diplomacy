import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { VotacaoCard } from '@/components/VotacaoCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import { TEMAS } from '@/lib/temas';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>(null);

  const { itens, isLoading, isError } = useVotacoesFeed();

  const itensFiltrados = useMemo(() => {
    if (!itens) return [];
    return temaSelecionado ? itens.filter((item) => item.iniciativa.tema === temaSelecionado) : itens;
  }, [itens, temaSelecionado]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.votacaoId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextos}>
                <Text style={[Typography.displayLg, { color: colors.text }]}>Votações</Text>
                <Text style={[Typography.bodySm, styles.subtitle, { color: colors.tabIconDefault }]}>
                  As iniciativas mais recentes da Assembleia da República
                </Text>
              </View>
              <MenuTresPontos />
            </View>
            <View style={styles.filtros}>
              <FiltroTemas temas={TEMAS} selecionado={temaSelecionado} onSelecionar={setTemaSelecionado} />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => (
          <VotacaoCard
            titulo={item.iniciativa.titulo}
            referencia={item.referencia}
            tema={item.iniciativa.tema}
            data={item.iniciativa.dataVoto}
            resultado={item.iniciativa.resultado}
            favor={item.iniciativa.favor}
            contra={item.iniciativa.contra}
            abstencao={item.iniciativa.abstencao}
            ausentes={item.iniciativa.ausentes}
            onPress={() =>
              router.push({
                pathname: '/votacao/[id]',
                params: { id: item.votacaoId, iniciativaId: String(item.iniciativaId) },
              })
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : isError ? (
            <EcraVazio
              icone="cloud-off"
              titulo="Não foi possível carregar"
              descricao="Verifica a tua ligação à internet e tenta novamente."
            />
          ) : temaSelecionado ? (
            <EcraVazio
              icone="filter-alt-off"
              titulo="Sem votações neste tema"
              descricao={`Ainda não há iniciativas de ${temaSelecionado} para mostrar.`}
            />
          ) : (
            <EcraVazio
              icone="how-to-vote"
              titulo="Ainda não há votações"
              descricao="Volta mais tarde para ver as últimas votações do parlamento."
            />
          )
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
  subtitle: {
    marginTop: Spacing.xs,
  },
  filtros: {
    marginTop: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  loading: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
