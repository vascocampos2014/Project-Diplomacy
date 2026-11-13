import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { CabecalhoEcra, Contentor, useCores } from '@/components/ui';
import { VotacaoCard } from '@/components/VotacaoCard';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import { TEMAS } from '@/lib/temas';

export default function FeedScreen() {
  const cores = useCores();
  const router = useRouter();
  // O tema escolhido fica no URL (?tema=Saúde), para a ligação poder ser partilhada.
  const params = useLocalSearchParams<{ tema?: string }>();
  const tema = params.tema && TEMAS.includes(params.tema) ? params.tema : null;
  const setTema = (t: string | null) => router.setParams({ tema: t ?? undefined });
  const [aAtualizar, setAAtualizar] = useState(false);
  const { itens, isLoading, isError, refetch } = useVotacoesFeed();

  const filtrados = useMemo(() => (itens ?? []).filter((i) => !tema || i.iniciativa.tema === tema), [itens, tema]);

  async function atualizar() {
    setAAtualizar(true);
    await refetch().finally(() => setAAtualizar(false));
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.votacaoId}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={aAtualizar} onRefresh={atualizar} tintColor={cores.tint} />}
        ListHeaderComponent={
          <Contentor>
            <CabecalhoEcra titulo="Votações" subtitulo="O que o Parlamento votou nos últimos dias e como votou cada partido." />
            <View style={styles.filtros}>
              <FiltroTemas temas={TEMAS} selecionado={tema} onSelecionar={setTema} />
            </View>
          </Contentor>
        }
        renderItem={({ item, index }) => {
          const novoDia = index === 0 || filtrados[index - 1].iniciativa.dataVoto !== item.iniciativa.dataVoto;
          const doDia = novoDia ? filtrados.filter((i) => i.iniciativa.dataVoto === item.iniciativa.dataVoto).length : 0;
          return (
            <Contentor style={styles.item}>
              {novoDia ? (
                <View style={[styles.dia, { borderBottomColor: cores.rule }]}>
                  <Text style={[styles.diaTitulo, { color: cores.text }]} accessibilityRole="header">
                    {item.iniciativa.dataVoto}
                  </Text>
                  <Text style={[Typography.caption, { color: cores.textMuted }]}>
                    {doDia} {doDia === 1 ? 'votação' : 'votações'}
                  </Text>
                </View>
              ) : null}
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
                partidos={item.partidos}
                href={{ pathname: '/votacao/[id]', params: { id: item.votacaoId, iniciativaId: String(item.iniciativaId) } }}
              />
            </Contentor>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.carregar}>
              <ActivityIndicator color={cores.tint} />
            </View>
          ) : isError ? (
            <EcraVazio
              icone="cloud-off"
              titulo="Não foi possível carregar"
              descricao="Verifica a tua ligação à internet e tenta de novo."
              accao={{ label: 'Tentar de novo', onPress: atualizar }}
            />
          ) : tema ? (
            <EcraVazio
              icone="filter-alt-off"
              titulo={`Sem votações de ${tema}`}
              descricao="Nas votações mais recentes não há iniciativas deste tema."
              accao={{ label: 'Ver todas', onPress: () => setTema(null) }}
            />
          ) : (
            <EcraVazio icone="how-to-vote" titulo="Ainda não há votações" descricao="Volta mais tarde." />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecra: {
    flex: 1,
  },
  lista: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  filtros: {
    marginBottom: Spacing.sm,
  },
  item: {
    marginBottom: Spacing.md,
  },
  diaTitulo: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dia: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1.5,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
