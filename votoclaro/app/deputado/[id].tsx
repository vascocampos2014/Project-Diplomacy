import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { VotoIndicator } from '@/components/VotoIndicator';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useDeputado } from '@/hooks/useDeputado';
import { usePartidoStats } from '@/hooks/usePartidoStats';
import { hexToRgba, iniciais } from '@/lib/format';
import { fotoUrl } from '@/lib/parlamento-api';

export default function DeputadoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [aSeguir, setASeguir] = useState(false);

  const deputadoQuery = useDeputado(id);
  const partidoStatsQuery = usePartidoStats();

  if (deputadoQuery.isLoading || partidoStatsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Deputado' }} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const deputado = deputadoQuery.data;

  if (!deputado || deputadoQuery.isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Deputado' }} />
        <EcraVazio
          icone="search-off"
          titulo="Deputado não encontrado"
          descricao="Este perfil pode já não estar disponível."
        />
      </SafeAreaView>
    );
  }

  const corPartido = getCorPartido(deputado.partido);
  const stat = partidoStatsQuery.data?.stats[deputado.partido];
  const historico = partidoStatsQuery.data?.historicoPorPartido[deputado.partido] ?? [];

  const pct = (n: number) => (stat && stat.total > 0 ? Math.round((n / stat.total) * 100) : undefined);
  const percFavor = stat ? pct(stat.favor) : undefined;
  const percContra = stat ? pct(stat.contra) : undefined;
  const percAbstencao = stat ? pct(stat.abstencao) : undefined;
  const taxaPresenca = stat && stat.total > 0 ? Math.round(((stat.total - stat.ausente) / stat.total) * 100) : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: deputado.nome }} />
      <FlatList
        data={historico}
        keyExtractor={(item, index) => `${item.votacaoId}-${item.iniciativaId}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Avatar nome={deputado.nome} fotoUrl={fotoUrl(deputado.id)} corPartido={corPartido} />
            <Text style={[Typography.displaySm, styles.nome, { color: colors.text }]}>{deputado.nome}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.partido, { color: corPartido }]}>{deputado.partido}</Text>
              <Text style={[Typography.bodySm, { color: colors.tabIconDefault }]}>
                · {deputado.circulo} · {deputado.numMandatos}.º mandato
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.seguirBotao,
                { borderColor: colors.tint, backgroundColor: aSeguir ? colors.tint : 'transparent' },
              ]}
              onPress={() => setASeguir((v) => !v)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={aSeguir ? `Deixar de seguir ${deputado.nome}` : `Seguir ${deputado.nome}`}
              accessibilityHint="Recebe notificações quando este deputado votar"
            >
              <Text style={[styles.seguirLabel, { color: aSeguir ? colors.background : colors.tint }]}>
                {aSeguir ? 'A seguir' : 'Seguir'}
              </Text>
            </TouchableOpacity>

            <View style={styles.statsGrid}>
              <Stat label="A favor" valor={percFavor} cor={colors.favor} />
              <Stat label="Contra" valor={percContra} cor={colors.contra} />
              <Stat label="Abstenção" valor={percAbstencao} cor={colors.abstencao} />
              <Stat label="Presença" valor={taxaPresenca} cor={colors.text} />
            </View>
            <Text style={[Typography.caption, styles.nota, { color: colors.tabIconDefault }]}>
              Estatísticas calculadas a partir das votações do grupo parlamentar {deputado.partido}.
            </Text>

            <Text style={[Typography.label, styles.subheading, { color: colors.text }]}>Historial de votações</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historicoItem}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/votacao/[id]',
                params: { id: item.votacaoId, iniciativaId: String(item.iniciativaId) },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`${item.titulo}, ${item.dataVoto}`}
            accessibilityHint="Abre o detalhe da votação"
          >
            <View style={styles.historicoInfo}>
              <Text style={[Typography.bodyLg, { color: colors.text }]} numberOfLines={1}>
                {item.titulo}
              </Text>
              <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>
                {item.tema} · {item.dataVoto}
              </Text>
            </View>
            <VotoIndicator posicao={item.posicao} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[Typography.bodySm, { color: colors.tabIconDefault }]}>
            Ainda não há historial de votos disponível.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

function Avatar({ nome, fotoUrl: uri, corPartido }: { nome: string; fotoUrl: string; corPartido: string }) {
  const [erro, setErro] = useState(false);

  if (erro) {
    return (
      <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: hexToRgba(corPartido, 0.15) }]}>
        <Text style={[styles.avatarIniciais, { color: corPartido }]}>{iniciais(nome)}</Text>
      </View>
    );
  }

  return (
    <Image source={{ uri }} style={styles.avatar} resizeMode="cover" onError={() => setErro(true)} accessible={false} />
  );
}

function Stat({ label, valor, cor }: { label: string; valor?: number; cor: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <View style={styles.stat}>
      <Text style={[Typography.data, { color: cor }]}>{valor !== undefined ? `${valor}%` : '—'}</Text>
      <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radii.badge,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIniciais: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 24,
  },
  nome: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  partido: {
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  seguirBotao: {
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: Radii.badge,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
  },
  seguirLabel: {
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.sm,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  nota: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  subheading: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  historicoInfo: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
