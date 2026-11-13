import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/components/BarraProgresso';
import { ContagemVotos, ResultadoBadge } from '@/components/ContagemVotos';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { BoletimCompleto } from '@/components/BoletimCompleto';
import { Aviso, Botao, Cartao, Contentor, TituloSecao, useCores } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
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
      <Stack.Screen options={{ title: 'Votação' }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Contentor>
          <Text style={[Typography.displaySm, { color: cores.text }]} accessibilityRole="header">
            {iniciativa.titulo}
          </Text>
          <View style={styles.meta}>
            <Text style={[Typography.bodySm, { color: cores.textMuted }]}>{iniciativa.dataVoto}</Text>
            <Text style={[Typography.bodySm, { color: cores.textMuted }]}>{iniciativa.tema}</Text>
          </View>
          <View style={styles.resultado}>
            <ResultadoBadge resultado={iniciativa.resultado} />
            {total > 0 ? (
              <ContagemVotos favor={iniciativa.favor} contra={iniciativa.contra} abstencao={iniciativa.abstencao} ausentes={iniciativa.ausentes} />
            ) : null}
          </View>

          {total > 0 ? (
            <View style={styles.barra}>
              <BarraProgresso favor={pct(iniciativa.favor)} contra={pct(iniciativa.contra)} abstencao={pct(iniciativa.abstencao)} height={8} />
              <Text style={[Typography.caption, styles.escala, { color: cores.textMuted }]}>
                {total} deputados. Os votos são registados por grupo parlamentar.
              </Text>
            </View>
          ) : null}

          <TituloSecao>O boletim</TituloSecao>
          <BoletimCompleto posicaoPorPartido={posicaoPorPartido} lugares={lugares} />

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
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
    marginTop: Spacing.sm,
  },
  resultado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.md,
    rowGap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  barra: {
    marginTop: Spacing.md,
  },
  escala: {
    marginTop: Spacing.sm,
  },
  deputados: {
    paddingVertical: 0,
  },
  fonte: {
    marginTop: Spacing.xxl,
  },
});
