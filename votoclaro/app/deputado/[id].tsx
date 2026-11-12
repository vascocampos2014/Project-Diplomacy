import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { EcraVazio } from '@/components/EcraVazio';
import { FiltroPosicao } from '@/components/FiltroPosicao';
import { Aviso, Contentor, TituloSecao, useCores } from '@/components/ui';
import { VotoIndicator, coresPosicao } from '@/components/VotoIndicator';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputado } from '@/hooks/useDeputado';
import { usePartidoStats } from '@/hooks/usePartidoStats';
import { fotoUrl } from '@/lib/parlamento-api';
import { hexToRgba } from '@/lib/format';
import type { Posicao } from '@/types';

export default function DeputadoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cores = useCores();
  const [filtro, setFiltro] = useState<Posicao | null>(null);

  const deputadoQuery = useDeputado(id);
  const statsQuery = usePartidoStats();
  const deputado = deputadoQuery.data;
  const historico = useMemo(() => {
    const todos = (deputado && statsQuery.data?.historicoPorPartido[deputado.partido]) || [];
    return filtro ? todos.filter((h) => h.posicao === filtro) : todos;
  }, [deputado, statsQuery.data, filtro]);

  if (deputadoQuery.isLoading || statsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.ecra, styles.centro, { backgroundColor: cores.background }]}>
        <Stack.Screen options={{ title: 'Deputado' }} />
        <ActivityIndicator color={cores.tint} />
      </SafeAreaView>
    );
  }

  if (!deputado || deputadoQuery.isError) {
    return (
      <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]}>
        <Stack.Screen options={{ title: 'Deputado' }} />
        <EcraVazio
          icone="person-off"
          titulo="Deputado não encontrado"
          descricao="Este perfil pode já não estar disponível."
          accao={{ label: 'Ver deputados', onPress: () => router.replace('/deputados') }}
        />
      </SafeAreaView>
    );
  }

  const cor = getCorPartido(deputado.partido);
  const stat = statsQuery.data?.stats[deputado.partido];
  const presentes = stat ? stat.total - stat.ausente : 0;
  const pct = (n: number) => (presentes > 0 ? Math.round((n / presentes) * 100) : undefined);
  const presenca = stat && stat.total > 0 ? Math.round((presentes / stat.total) * 100) : undefined;

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: deputado.nome }} />
      <FlatList
        data={historico}
        keyExtractor={(item, i) => `${item.votacaoId}-${i}`}
        contentContainerStyle={styles.lista}
        initialNumToRender={20}
        ListHeaderComponent={
          <Contentor>
            <View style={[styles.perfil, { backgroundColor: cores.surface, borderColor: cores.border }]}>
              <View style={[styles.faixa, { backgroundColor: hexToRgba(cor, 0.14) }]} />
              <View style={[styles.avatarAro, { borderColor: cores.surface }]}>
                <Avatar nome={deputado.nome} fotoUrl={fotoUrl(deputado.id)} partido={deputado.partido} size={88} />
              </View>
              <Text style={[Typography.displaySm, styles.nome, { color: cores.text }]} accessibilityRole="header">
                {deputado.nome}
              </Text>
              {deputado.nomeCompleto !== deputado.nome ? (
                <Text style={[Typography.caption, styles.centrado, { color: cores.textMuted }]}>{deputado.nomeCompleto}</Text>
              ) : null}
              <View style={styles.meta}>
                <View style={[styles.partido, { borderColor: cor }]}>
                  <View style={[styles.ponto, { backgroundColor: cor }]} />
                  <Text style={[styles.partidoTexto, { color: cores.text }]}>{deputado.partido}</Text>
                </View>
                <Text style={[Typography.bodySm, { color: cores.textMuted }]}>Círculo de {deputado.circulo}</Text>
              </View>
            </View>

            <TituloSecao nota={`Votações do grupo parlamentar ${deputado.partido} nesta legislatura.`}>Como vota</TituloSecao>
            <View style={styles.stats}>
              <Stat label="A favor" valor={pct(stat?.favor ?? 0)} posicao="favor" />
              <Stat label="Contra" valor={pct(stat?.contra ?? 0)} posicao="contra" />
              <Stat label="Abstenção" valor={pct(stat?.abstencao ?? 0)} posicao="abstencao" />
              <Stat label="Presença" valor={presenca} posicao="ausente" />
            </View>

            <TituloSecao nota={stat ? `${stat.total} votações` : undefined}>Historial</TituloSecao>
            <FiltroPosicao selecionado={filtro} onSelecionar={setFiltro} />
          </Contentor>
        }
        renderItem={({ item, index }) => (
          <Contentor>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/votacao/[id]', params: { id: item.votacaoId, iniciativaId: String(item.iniciativaId) } })
              }
              style={({ pressed }) => [
                styles.item,
                { borderColor: cores.border, backgroundColor: cores.surface },
                index === 0 && styles.primeira,
                index === historico.length - 1 && styles.ultima,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.titulo}, ${item.dataVoto}`}
              accessibilityHint="Abre o detalhe da votação"
            >
              <View style={styles.itemInfo}>
                <Text style={[Typography.bodySm, { color: cores.text }]} numberOfLines={2}>
                  {item.titulo}
                </Text>
                <Text style={[Typography.caption, styles.itemMeta, { color: cores.textMuted }]}>
                  {item.tema} · {item.dataVoto}
                </Text>
              </View>
              <VotoIndicator posicao={item.posicao} size="md" />
            </Pressable>
          </Contentor>
        )}
        ListEmptyComponent={
          <Contentor>
            <Aviso>{filtro ? 'Nenhuma votação com esta posição.' : 'Ainda não há historial de votos disponível.'}</Aviso>
          </Contentor>
        }
      />
    </SafeAreaView>
  );
}

function Stat({ label, valor, posicao }: { label: string; valor?: number; posicao: Posicao }) {
  const c = coresPosicao(useCores(), posicao);
  const cores = useCores();
  return (
    <View style={[styles.stat, { backgroundColor: c.fundo }]} accessible accessibilityLabel={`${label}: ${valor ?? 'sem dados'}%`}>
      <Text style={[Typography.data, { color: c.tinta }]}>{valor !== undefined ? `${valor}%` : '—'}</Text>
      <Text style={[Typography.caption, { color: cores.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ecra: {
    flex: 1,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  perfil: {
    alignItems: 'center',
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  faixa: {
    alignSelf: 'stretch',
    height: 64,
  },
  avatarAro: {
    marginTop: -44,
    borderWidth: 4,
    borderRadius: Radii.pill,
  },
  nome: {
    marginTop: Spacing.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  centrado: {
    textAlign: 'center',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  partido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  partidoTexto: {
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.chip,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  primeira: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
  },
  ultima: {
    borderBottomLeftRadius: Radii.card,
    borderBottomRightRadius: Radii.card,
  },
  itemInfo: {
    flex: 1,
  },
  itemMeta: {
    marginTop: 2,
  },
});
