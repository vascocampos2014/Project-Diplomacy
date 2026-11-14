import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JanelaAzulejo } from '@/components/Azulejo';
import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { anim, CabecalhoEcra, Contentor, TituloSecao, useCores, useDisposicao } from '@/components/ui';
import { useEspacoBarra } from '@/components/BarraSeparadores';
import { VotacaoCard } from '@/components/VotacaoCard';
import { MAX_WIDTH_LARGO, Spacing } from '@/constants/Spacing';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import type { ItemFeed } from '@/lib/feed';
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

  const espacoBarra = useEspacoBarra();

  async function atualizar() {
    setAAtualizar(true);
    await refetch().finally(() => setAAtualizar(false));
  }

  // A primeira votação é a manchete (no cabeçalho da lista); as outras são
  // cartões, numa coluna no telemóvel e numa grelha no computador.
  const [manchete, ...resto] = filtrados;
  const { desktop, colunas, largura } = useDisposicao();
  const larguraPagina = Math.min(largura - Spacing.lg * 2, MAX_WIDTH_LARGO);
  const larguraCartao = desktop ? (larguraPagina - Spacing.lg * (colunas - 1)) / colunas : undefined;

  const cartao = (item: ItemFeed, destaque: boolean, index: number) => (
    <VotacaoCard
      destaque={destaque}
      largo={destaque && desktop}
      esticar={!destaque && desktop}
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
      key={`${item.votacaoId}-${index}`}
    />
  );

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <FlatList
        // numColumns não pode mudar em andamento: a key força uma lista nova.
        key={`colunas-${colunas}`}
        numColumns={colunas}
        columnWrapperStyle={colunas > 1 ? [styles.linhaGrelha, { width: larguraPagina }] : undefined}
        data={resto}
        keyExtractor={(item) => item.votacaoId}
        contentContainerStyle={[styles.lista, { paddingBottom: Spacing.xxxl + espacoBarra }]}
        refreshControl={<RefreshControl refreshing={aAtualizar} onRefresh={atualizar} tintColor={cores.tint} />}
        ListHeaderComponent={
          <View {...anim('pagina')}>
            <View style={styles.faixa}>
              <JanelaAzulejo edificio="sao-bento" />
            </View>
            <Contentor largo>
              <CabecalhoEcra titulo="Votações" subtitulo="O que o Parlamento votou nos últimos dias e como votou cada partido." />
              <View style={styles.filtros}>
                <FiltroTemas temas={TEMAS} selecionado={tema} onSelecionar={setTema} />
              </View>
              {manchete ? (
                <View style={[styles.destaque, desktop && styles.destaqueLargo, desktop && { borderBottomColor: cores.border }]} {...anim('item', 0)}>
                  {cartao(manchete, true, 0)}
                </View>
              ) : null}
              {resto.length > 0 ? <TituloSecao>Votações recentes</TituloSecao> : null}
            </Contentor>
          </View>
        }
        renderItem={({ item, index }) => (
          <Contentor style={[styles.item, larguraCartao !== undefined && { width: larguraCartao, maxWidth: larguraCartao, alignSelf: 'stretch' }]}>
            <View {...anim('item', index + 1)} style={desktop ? styles.celula : undefined}>
              {cartao(item, false, index + 1)}
            </View>
          </Contentor>
        )}
        ListEmptyComponent={
          manchete ? null : isLoading ? (
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
  faixa: {
    marginHorizontal: -Spacing.lg,
  },
  filtros: {
    marginBottom: Spacing.sm,
  },
  destaque: {
    marginBottom: Spacing.sm,
  },
  // No computador a manchete fecha com uma linha fina, como numa primeira página.
  destaqueLargo: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    marginBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linhaGrelha: {
    alignSelf: 'center',
    gap: Spacing.lg,
    alignItems: 'stretch',
  },
  celula: {
    flex: 1,
  },
  item: {
    marginBottom: Spacing.md,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
