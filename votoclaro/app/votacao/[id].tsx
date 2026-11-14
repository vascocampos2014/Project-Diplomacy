import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaixaAzulejo } from '@/components/Azulejo';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { Hemiciclo, LegendaVotos } from '@/components/Hemiciclo';
import { anim, Aviso, Botao, Cartao, Contentor, Etiqueta, nivel, TituloSecao, useCores, useDisposicao } from '@/components/ui';
import { PartidosPorSentido } from '@/components/VotacaoCard';
import { nomePartido } from '@/constants/CORES_PARTIDOS';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacaoDetalhe } from '@/hooks/useVotacaoDetalhe';
import { RAG_API_URL } from '@/lib/perguntar';
import type { Posicao } from '@/types';

// Ligação para fora da app. Na web é um <a target="_blank"> verdadeiro (o
// react-native-web lê `href`/`hrefAttrs`, que os tipos do RN não declaram);
// no nativo abre o browser.
function ligacaoExterna(url: string): object {
  return Platform.OS === 'web'
    ? { href: url, hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' } }
    : { onPress: () => Linking.openURL(url) };
}

const ORDEM: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];

export default function VotacaoDetalheScreen() {
  const { id, iniciativaId } = useLocalSearchParams<{ id: string; iniciativaId: string }>();
  const cores = useCores();
  const router = useRouter();
  const [verDeputados, setVerDeputados] = useState(false);
  const [verSiglas, setVerSiglas] = useState(false);
  const { desktop, colunas } = useDisposicao();
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const { iniciativa, posicaoPorPartido, referencia, tipoIniciativa, urlIniciativa, isLoading, isError } =
    useVotacaoDetalhe(id, iniciativaId);
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

  const siglas = [...partidos.favor, ...partidos.contra, ...partidos.abstencao];
  // "Proposta de Lei n.º 110" (sem o autor nem a fase), para a pergunta e a partilha.
  const referenciaCurta = referencia?.split(' · ')[0];
  const pergunta = `O que propõe a iniciativa «${iniciativa.titulo}»${referenciaCurta ? ` (${referenciaCurta})` : ''} e como votaram os partidos?`;

  // Web: partilha nativa do telemóvel; sem ela (computador), copia a ligação.
  // Nativo: a folha de partilha do sistema, com a página oficial.
  async function partilhar() {
    const titulo = iniciativa!.titulo;
    if (Platform.OS !== 'web') {
      await Share.share({ message: urlIniciativa ? `${titulo}\n${urlIniciativa}` : titulo });
      return;
    }
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // Cancelado pelo utilizador: nada a fazer.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setCopiado(false), 2400);
    } catch {
      // Sem acesso à área de transferência: o endereço continua na barra do browser.
    }
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Votação' }} />
      <Head>
        <title>{`${iniciativa.titulo} · VotoClaro`}</title>
      </Head>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <FaixaAzulejo altura={14} />
        <Contentor largo style={[styles.corpo, desktop && styles.corpoLargo]}>
          <View {...anim('pagina')}>
            <Etiqueta>{iniciativa.tema}</Etiqueta>
            <Text style={[Typography.manchete, styles.titulo, desktop && styles.tituloLargo, { color: cores.tintInk }]} accessibilityRole="header" {...nivel(1)}>
              {iniciativa.titulo}
            </Text>
            <Text style={[Typography.bodySm, { color: cores.textMuted }]}>
              {referencia ? `${referencia} · ` : ''}
              {iniciativa.dataVoto}
            </Text>
            <View style={styles.ligacoes}>
              {urlIniciativa ? (
                <Text
                  style={[styles.ligacao, { color: cores.tintInk }]}
                  accessibilityRole="link"
                  accessibilityLabel="Ver a iniciativa no site do Parlamento, abre noutra janela"
                  {...ligacaoExterna(urlIniciativa)}
                >
                  Ver no parlamento.pt ›
                </Text>
              ) : null}
              {tipoIniciativa ? (
                <Link href={{ pathname: '/glossario', params: { termo: tipoIniciativa } }} asChild>
                  <Pressable accessibilityRole="link" accessibilityLabel={`O que quer dizer ${tipoIniciativa}? Abre o glossário`}>
                    <Text style={[styles.ligacao, { color: cores.tintInk }]}>{`O que é «${tipoIniciativa}»? ›`}</Text>
                  </Pressable>
                </Link>
              ) : null}
            </View>
          </View>

          {/* Computador: a câmara à esquerda; quem votou como e as ações à direita. */}
          <View style={desktop ? styles.colunas : undefined}>
            <View style={desktop ? styles.colunaCamara : undefined}>
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
                style={desktop ? styles.hemicicloLargo : undefined}
              />
              <LegendaVotos favor={iniciativa.favor} contra={iniciativa.contra} abstencao={iniciativa.abstencao} ausentes={iniciativa.ausentes} />
              <Text style={[Typography.caption, styles.escala, { color: cores.textMuted }]}>
                {total} deputados. Os votos são registados por grupo parlamentar.
              </Text>
            </View>
          ) : null}
            </View>
            <View style={desktop ? styles.colunaLado : undefined}>
              {desktop ? <TituloSecao>Quem votou como</TituloSecao> : null}
          <Cartao style={[styles.partidos, desktop && styles.semMargem]}>
            <PartidosPorSentido partidos={partidos} semLinha />
            {siglas.length > 0 ? (
              <View style={[styles.siglas, { borderTopColor: cores.border }]}>
                <Pressable
                  onPress={() => setVerSiglas((v) => !v)}
                  accessibilityRole="button"
                  aria-expanded={verSiglas}
                  accessibilityLabel="O que quer dizer cada sigla"
                  hitSlop={8}
                >
                  <Text style={[styles.ligacao, { color: cores.tintInk }]}>
                    {verSiglas ? 'Esconder os nomes dos partidos' : 'O que quer dizer cada sigla?'}
                  </Text>
                </Pressable>
                {verSiglas ? (
                  <View style={styles.siglasLista}>
                    {siglas.map((sigla) => (
                      <Text key={sigla} style={[Typography.bodySm, { color: cores.text }]}>
                        <Text style={{ fontFamily: Fonts.bold }}>{sigla}</Text>
                        <Text style={{ color: cores.textMuted }}>{`  ${nomePartido(sigla)}`}</Text>
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </Cartao>
          <Link href={{ pathname: '/glossario', params: { termo: 'Abstenção' } }} asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="O que é uma abstenção? Abre o glossário" style={styles.abstencao}>
              <Text style={[styles.ligacao, { color: cores.tintInk }]}>O que é uma abstenção? ›</Text>
            </Pressable>
          </Link>

          <View style={styles.accoes}>
            {RAG_API_URL ? (
              <Botao
                label="Perguntar sobre esta votação"
                icone="chat-bubble-outline"
                onPress={() => router.push({ pathname: '/perguntar', params: { pergunta } })}
                accessibilityHint="Abre o separador Perguntar com uma pergunta sobre esta iniciativa"
              />
            ) : null}
            <Botao
              label={copiado ? 'Ligação copiada' : 'Partilhar'}
              icone={copiado ? 'check' : 'ios-share'}
              variante="secundario"
              onPress={partilhar}
              accessibilityHint="Partilha a ligação para esta votação"
            />
          </View>
            </View>
          </View>

          <TituloSecao nota="A posição de cada deputado é a do seu grupo parlamentar.">Deputados</TituloSecao>
          {verDeputados ? (
            // No computador os deputados ficam numa grelha de 2 ou 3 colunas.
            <Cartao style={[styles.deputados, desktop && styles.deputadosGrelha]}>
              {deputados.map((d, i) => (
                <View
                  key={d.id}
                  style={[
                    desktop ? { width: `${100 / colunas}%`, paddingHorizontal: Spacing.sm } : undefined,
                    i >= (desktop ? colunas : 1) && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth },
                  ]}
                >
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
              style={styles.verDeputados}
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
  ligacoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.lg,
    rowGap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  ligacao: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 22,
  },
  siglas: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  siglasLista: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  abstencao: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  accoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  deputados: {
    paddingVertical: 0,
  },
  deputadosGrelha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
  },
  verDeputados: {
    alignSelf: 'flex-start',
  },
  corpoLargo: {
    paddingTop: Spacing.xxxl,
  },
  tituloLargo: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.2,
    maxWidth: 900,
  },
  colunas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.huge,
  },
  colunaCamara: {
    flex: 1,
    minWidth: 0,
  },
  colunaLado: {
    width: 400,
  },
  hemicicloLargo: {
    maxWidth: 560,
  },
  semMargem: {
    marginTop: 0,
  },
  fonte: {
    marginTop: Spacing.xxl,
  },
});
