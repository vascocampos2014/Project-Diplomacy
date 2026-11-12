import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { CabecalhoEcra, Contentor, useCores } from '@/components/ui';
import { VotacaoCard } from '@/components/VotacaoCard';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import { resumirFeed } from '@/lib/feed';
import { TEMAS } from '@/lib/temas';

export default function FeedScreen() {
  const cores = useCores();
  const router = useRouter();
  const [tema, setTema] = useState<string | null>(null);
  const [aAtualizar, setAAtualizar] = useState(false);
  const { itens, isLoading, isError, refetch } = useVotacoesFeed();

  const filtrados = useMemo(() => (itens ?? []).filter((i) => !tema || i.iniciativa.tema === tema), [itens, tema]);
  const resumo = itens ? resumirFeed(itens) : null;

  async function atualizar() {
    setAAtualizar(true);
    await refetch().finally(() => setAAtualizar(false));
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['top']}>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.votacaoId}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={aAtualizar} onRefresh={atualizar} tintColor={cores.tint} />}
        ListHeaderComponent={
          <Contentor>
            <CabecalhoEcra
              titulo="Votações"
              subtitulo="O que a Assembleia da República votou, partido a partido."
              direita={<MenuTresPontos />}
            />
            {resumo && resumo.total > 0 ? (
              <View style={[styles.resumo, { backgroundColor: cores.surface, borderColor: cores.border }]}>
                <Resumo valor={resumo.total} legenda="votações recentes" cor={cores.text} />
                <View style={[styles.divisor, { backgroundColor: cores.border }]} />
                <Resumo valor={resumo.aprovadas} legenda="aprovadas" cor={cores.favorInk} />
                <View style={[styles.divisor, { backgroundColor: cores.border }]} />
                <Resumo valor={resumo.chumbadas} legenda="chumbadas" cor={cores.contraInk} />
              </View>
            ) : null}
            <View style={styles.filtros}>
              <FiltroTemas temas={TEMAS} selecionado={tema} onSelecionar={setTema} />
            </View>
          </Contentor>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => (
          <Contentor>
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
          </Contentor>
        )}
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

function Resumo({ valor, legenda, cor }: { valor: number; legenda: string; cor: string }) {
  const cores = useCores();
  return (
    <View style={styles.resumoItem} accessible accessibilityLabel={`${valor} ${legenda}`}>
      <Text style={[Typography.data, { color: cor }]}>{valor}</Text>
      <Text style={[Typography.caption, { color: cores.textMuted }]}>{legenda}</Text>
    </View>
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
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divisor: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  filtros: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
