import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JanelaAzulejo } from '@/components/Azulejo';
import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { anim, CabecalhoEcra, Contentor, TituloSecao, useCores } from '@/components/ui';
import { VotacaoCard } from '@/components/VotacaoCard';
import { Spacing } from '@/constants/Spacing';
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
          <View {...anim('pagina')}>
          <View style={styles.faixa}>
            <JanelaAzulejo edificio="sao-bento" />
          </View>
          <Contentor>
            <CabecalhoEcra titulo="Votações" subtitulo="O que o Parlamento votou nos últimos dias e como votou cada partido." />
            <View style={styles.filtros}>
              <FiltroTemas temas={TEMAS} selecionado={tema} onSelecionar={setTema} />
            </View>
          </Contentor>
          </View>
        }
        renderItem={({ item, index }) => (
          // A primeira votação é a manchete; as outras são cartões.
          <Contentor style={index === 0 ? styles.destaque : styles.item}>
            {index === 1 ? <TituloSecao>Votações recentes</TituloSecao> : null}
            <View {...anim('item', index)}>
              <VotacaoCard
                destaque={index === 0}
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
            </View>
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
  item: {
    marginBottom: Spacing.md,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
