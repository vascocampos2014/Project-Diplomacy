import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/components/BarraProgresso';
import { ResultadoBadge } from '@/components/ContagemVotos';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { EstatisticasVotacao } from '@/components/EstatisticasVotacao';
import { Aviso, Botao, Cartao, Chip, Contentor, TituloSecao, useCores } from '@/components/ui';
import { VotoIndicator } from '@/components/VotoIndicator';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacaoDetalhe } from '@/hooks/useVotacaoDetalhe';
import type { Posicao } from '@/types';

const ORDEM: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];

export default function VotacaoDetalheScreen() {
  const { id, iniciativaId } = useLocalSearchParams<{ id: string; iniciativaId: string }>();
  const cores = useCores();
  const router = useRouter();
  const [verDeputados, setVerDeputados] = useState(false);

  const { iniciativa, posicaoPorPartido, isLoading, isError } = useVotacaoDetalhe(id, iniciativaId);
  const deputadosQuery = useDeputados();
  const lugares = deputadosQuery.data?.lugaresPorPartido ?? {};

  // Partidos agrupados por posição, maiores primeiro dentro de cada grupo.
  const porPosicao = useMemo(() => {
    if (!posicaoPorPartido) return [];
    return ORDEM.map((posicao) => ({
      posicao,
      partidos: [...posicaoPorPartido.entries()]
        .filter(([, p]) => p === posicao)
        .map(([partido]) => partido)
        .sort((a, b) => (lugares[b] ?? 0) - (lugares[a] ?? 0)),
    })).filter((g) => g.partidos.length > 0);
  }, [posicaoPorPartido, lugares]);

  if (isLoading || deputadosQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.ecra, styles.centro, { backgroundColor: cores.background }]}>
        <Stack.Screen options={{ title: 'Votação' }} />
        <ActivityIndicator color={cores.tint} />
      </SafeAreaView>
    );
  }

  if (isError || deputadosQuery.isError || !iniciativa || !posicaoPorPartido) {
    return (
      <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]}>
        <Stack.Screen options={{ title: 'Votação' }} />
        <EcraVazio
          icone="search-off"
          titulo="Votação não encontrada"
          descricao="Esta votação pode já não estar disponível."
          accao={{ label: 'Ir para as votações', onPress: () => router.replace('/') }}
        />
      </SafeAreaView>
    );
  }

  const deputados = [...(deputadosQuery.data?.deputados ?? [])].sort(
    (a, b) =>
      ORDEM.indexOf(posicaoPorPartido.get(a.partido) ?? 'ausente') -
        ORDEM.indexOf(posicaoPorPartido.get(b.partido) ?? 'ausente') ||
      a.partido.localeCompare(b.partido) ||
      a.nome.localeCompare(b.nome, 'pt')
  );
  const total = iniciativa.favor + iniciativa.contra + iniciativa.abstencao + iniciativa.ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: iniciativa.tema }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Contentor>
          <View style={styles.topo}>
            <Chip label={iniciativa.tema.toUpperCase()} selecionado />
            <Text style={[Typography.caption, { color: cores.textMuted }]}>{iniciativa.dataVoto}</Text>
          </View>
          <Text style={[Typography.displaySm, styles.titulo, { color: cores.text }]} accessibilityRole="header">
            {iniciativa.titulo}
          </Text>
          <View style={styles.resultado}>
            <ResultadoBadge resultado={iniciativa.resultado} />
            {total > 0 ? <Text style={[Typography.caption, { color: cores.textMuted }]}>{total} deputados</Text> : null}
          </View>

          {total > 0 ? (
            <>
              <View style={styles.barra}>
                <BarraProgresso favor={pct(iniciativa.favor)} contra={pct(iniciativa.contra)} abstencao={pct(iniciativa.abstencao)} height={10} />
              </View>
              <EstatisticasVotacao
                favor={iniciativa.favor}
                contra={iniciativa.contra}
                abstencao={iniciativa.abstencao}
                ausentes={iniciativa.ausentes}
              />
            </>
          ) : null}

          <TituloSecao nota="Os votos são registados por grupo parlamentar.">Como votou cada partido</TituloSecao>
          <Cartao style={styles.partidos}>
            {porPosicao.map((grupo, gi) => (
              <View key={grupo.posicao} style={[styles.grupo, gi > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <VotoIndicator posicao={grupo.posicao} size="md" showLabel />
                <View style={styles.siglas}>
                  {grupo.partidos.map((partido) => (
                    <View key={partido} style={[styles.sigla, { borderColor: cores.border }]} accessible accessibilityLabel={`${partido}, ${lugares[partido] ?? 0} deputados`}>
                      <View style={[styles.ponto, { backgroundColor: getCorPartido(partido) }]} />
                      <Text style={[styles.siglaTexto, { color: cores.text }]}>{partido}</Text>
                      {lugares[partido] ? (
                        <Text style={[Typography.caption, { color: cores.textMuted }]}>{lugares[partido]}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Cartao>

          <TituloSecao nota="A posição de cada deputado é a do seu grupo parlamentar.">Deputados</TituloSecao>
          {verDeputados ? (
            <Cartao style={styles.deputados}>
              {deputados.map((d, i) => (
                <View key={d.id} style={i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth }}>
                  <DeputadoRow
                    nome={d.nome}
                    partido={d.partido}
                    circulo={d.circulo}
                    fotoUrl={d.fotoUrl}
                    posicao={posicaoPorPartido.get(d.partido) ?? 'ausente'}
                    onPress={() => router.push({ pathname: '/deputado/[id]', params: { id: d.id } })}
                  />
                </View>
              ))}
            </Cartao>
          ) : (
            <Botao
              label={`Ver os ${deputados.length} deputados`}
              icone="people"
              variante="secundario"
              onPress={() => setVerDeputados(true)}
            />
          )}

          <View style={styles.fonte}>
            <Aviso>Fonte: dados abertos da Assembleia da República, via API openAR.</Aviso>
          </View>
        </Contentor>
      </ScrollView>
    </SafeAreaView>
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
  conteudo: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    marginTop: Spacing.md,
  },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  barra: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  partidos: {
    paddingVertical: Spacing.xs,
  },
  grupo: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  siglas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sigla: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  siglaTexto: {
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  deputados: {
    paddingVertical: Spacing.xs,
  },
  fonte: {
    marginTop: Spacing.xxl,
  },
});
