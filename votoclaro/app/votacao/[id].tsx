import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaixaAzulejo } from '@/components/Azulejo';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { Hemiciclo, LegendaVotos } from '@/components/Hemiciclo';
import { anim, Aviso, Botao, Cartao, Contentor, Etiqueta, TituloSecao, useCores } from '@/components/ui';
import { PartidosPorSentido } from '@/components/VotacaoCard';
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
  // Partidos por sentido de voto, do maior grupo para o menor.
  const partidos = { favor: [] as string[], contra: [] as string[], abstencao: [] as string[] };
  [...posicaoPorPartido.entries()]
    .sort(([a], [b]) => (lugares[b] ?? 0) - (lugares[a] ?? 0) || a.localeCompare(b))
    .forEach(([partido, posicao]) => {
      if (posicao !== 'ausente') partidos[posicao].push(partido);
    });

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Votação' }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <FaixaAzulejo altura={14} />
        <Contentor style={styles.corpo}>
          <View {...anim('pagina')}>
            <Etiqueta>{iniciativa.tema}</Etiqueta>
            <Text style={[Typography.manchete, styles.titulo, { color: cores.tintInk }]} accessibilityRole="header">
              {iniciativa.titulo}
            </Text>
            <Text style={[Typography.bodySm, { color: cores.textMuted }]}>{iniciativa.dataVoto}</Text>
          </View>

          <TituloSecao>Como votou o Parlamento</TituloSecao>
          {total > 0 ? (
            <View>
              <Hemiciclo
                favor={iniciativa.favor}
                contra={iniciativa.contra}
                abstencao={iniciativa.abstencao}
                ausentes={iniciativa.ausentes}
                resultado={iniciativa.resultado}
                animar
              />
              <LegendaVotos favor={iniciativa.favor} contra={iniciativa.contra} abstencao={iniciativa.abstencao} ausentes={iniciativa.ausentes} />
              <Text style={[Typography.caption, styles.escala, { color: cores.textMuted }]}>
                {total} deputados. Os votos são registados por grupo parlamentar.
              </Text>
            </View>
          ) : null}
          <Cartao style={styles.partidos}>
            <PartidosPorSentido partidos={partidos} semLinha />
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
    paddingBottom: Spacing.huge,
  },
  corpo: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  titulo: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  escala: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  partidos: {
    marginTop: Spacing.lg,
  },
  deputados: {
    paddingVertical: 0,
  },
  fonte: {
    marginTop: Spacing.xxl,
  },
});
