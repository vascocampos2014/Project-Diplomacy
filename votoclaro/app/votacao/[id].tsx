import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaixaAzulejo } from '@/components/Azulejo';
import { Amostra } from '@/components/Amostra';
import { Coluna, LinhaLigacao, NumerosVoto, Tabela } from '@/components/Computador';
import { Carimbo } from '@/components/Hemiciclo';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { Hemiciclo, LegendaVotos } from '@/components/Hemiciclo';
import { anim, Aviso, Botao, Cartao, Contentor, Etiqueta, nivel, TituloSecao, useCores, useDisposicao } from '@/components/ui';
import { PartidosPorSentido } from '@/components/VotacaoCard';
import { getCorPartido, nomePartido } from '@/constants/CORES_PARTIDOS';
import { ROTULO } from '@/components/VotoIndicator';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacaoDetalhe } from '@/hooks/useVotacaoDetalhe';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
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
      <View style={desktop ? styles.mestreDetalhe : styles.ecra}>
      {desktop ? <ListaVotacoes ativa={id} /> : null}
      <ScrollView style={styles.ecra} contentContainerStyle={styles.conteudo}>
        {desktop ? null : <FaixaAzulejo altura={14} />}
        <Contentor style={[styles.corpo, desktop && styles.corpoLargo]}>
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

          {desktop ? (
            <>
              <Cartao style={styles.resultadoCartao}>
                {total > 0 ? (
                  <View style={styles.resultadoLinha}>
                    <View style={styles.resultadoHemiciclo}>
                      <Hemiciclo
                        favor={iniciativa.favor}
                        contra={iniciativa.contra}
                        abstencao={iniciativa.abstencao}
                        ausentes={iniciativa.ausentes}
                        resultado={iniciativa.resultado}
                        animar
                      />
                    </View>
                    <View style={styles.resultadoTexto}>
                      <LegendaVotos favor={iniciativa.favor} contra={iniciativa.contra} abstencao={iniciativa.abstencao} ausentes={iniciativa.ausentes} />
                      <Text style={[Typography.caption, styles.escalaLargo, { color: cores.textMuted }]}>
                        {total} deputados. Os votos são registados por grupo parlamentar.
                      </Text>
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
                ) : null}
              </Cartao>
              <TituloSecao nota="Do maior para o menor grupo parlamentar.">Por grupo parlamentar</TituloSecao>
              <TabelaGrupos posicaoPorPartido={posicaoPorPartido} lugares={lugares} />
              <Link href={{ pathname: '/glossario', params: { termo: 'Abstenção' } }} asChild>
                <Pressable accessibilityRole="link" accessibilityLabel="O que é uma abstenção? Abre o glossário" style={styles.abstencao}>
                  <Text style={[styles.ligacao, { color: cores.tintInk }]}>O que é uma abstenção? ›</Text>
                </Pressable>
              </Link>
            </>
          ) : (
          <View>
            <View>
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
            </View>
            <View>
          <Cartao style={styles.partidos}>
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
          )}

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
      </View>
    </SafeAreaView>
  );
}

// Computador: as votações recentes numa coluna à esquerda, como no correio; a
// votação aberta fica marcada e o detalhe muda ao lado sem sair da página.
function ListaVotacoes({ ativa }: { ativa: string | undefined }) {
  const cores = useCores();
  const { itens } = useVotacoesFeed();
  return (
    <ScrollView style={[styles.lista, { backgroundColor: cores.surface, borderRightColor: cores.border }]} accessibilityLabel="Votações recentes">
      <Text style={[styles.listaTitulo, { color: cores.textMuted, borderBottomColor: cores.border }]}>Votações recentes</Text>
      {(itens ?? []).map((i, n) => (
        <LinhaLigacao
          key={i.votacaoId}
          href={{ pathname: '/votacao/[id]', params: { id: i.votacaoId, iniciativaId: String(i.iniciativaId) } }}
          accessibilityLabel={`${i.iniciativa.titulo}, ${i.iniciativa.dataVoto}, ${i.iniciativa.resultado === 'aprovada' ? 'aprovada' : 'chumbada'}`}
          ativa={i.votacaoId === ativa}
          ultima={n === (itens?.length ?? 0) - 1}
        >
          <View style={styles.listaItem}>
            <Text style={[Typography.caption, { color: cores.textMuted }]}>{i.iniciativa.dataVoto}</Text>
            <Text style={[Typography.bodySm, styles.listaItemTitulo, { color: cores.text }]} numberOfLines={2}>
              {i.iniciativa.titulo}
            </Text>
            <View style={styles.listaPe}>
              <Carimbo resultado={i.iniciativa.resultado} />
              <NumerosVoto favor={i.iniciativa.favor} contra={i.iniciativa.contra} abstencao={i.iniciativa.abstencao} compacto />
            </View>
          </View>
        </LinhaLigacao>
      ))}
    </ScrollView>
  );
}

// Computador: um grupo parlamentar por linha, do maior para o menor, com o sentido de voto.
function TabelaGrupos({ posicaoPorPartido, lugares }: { posicaoPorPartido: Map<string, Posicao>; lugares: Record<string, number> }) {
  const cores = useCores();
  const linhas = [...posicaoPorPartido.entries()].sort(([a], [b]) => (lugares[b] ?? 0) - (lugares[a] ?? 0) || a.localeCompare(b));
  return (
    <Tabela
      style={styles.tabelaGrupos}
      cabecalho={
        <>
          <Coluna flex>Grupo parlamentar</Coluna>
          <Coluna largura={90} direita>
            Deputados
          </Coluna>
          <Coluna largura={130}>Sentido</Coluna>
        </>
      }
    >
      {linhas.map(([p, posicao], n) => (
        <View
          key={p}
          style={[styles.grupoLinha, n < linhas.length - 1 && { borderBottomColor: cores.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
          accessible
          accessibilityLabel={`${nomePartido(p)}, ${lugares[p] ?? 0} deputados: ${ROTULO[posicao]}`}
        >
          <View style={styles.grupoNome}>
            <View style={[styles.ponto, { backgroundColor: getCorPartido(p) }]} />
            <Text style={[Typography.bodySm, styles.grupoSigla, { color: cores.text }]}>{p}</Text>
            <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
              {nomePartido(p)}
            </Text>
          </View>
          <Text style={[Typography.bodySm, styles.grupoLugares, { color: cores.text }]}>{lugares[p] ?? 0}</Text>
          <View style={styles.grupoSentido}>
            <Amostra posicao={posicao} />
            <Text style={[Typography.bodySm, { color: cores.text }]}>{ROTULO[posicao]}</Text>
          </View>
        </View>
      ))}
    </Tabela>
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
    paddingHorizontal: Spacing.huge,
    maxWidth: 960,
  },
  tituloLargo: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.2,
    maxWidth: 900,
  },
  mestreDetalhe: {
    flex: 1,
    flexDirection: 'row',
  },
  lista: {
    width: 380,
    flexGrow: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  listaTitulo: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listaItem: {
    flex: 1,
    gap: 4,
  },
  listaItemTitulo: {
    fontFamily: Fonts.semibold,
  },
  listaPe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  resultadoCartao: {
    marginTop: Spacing.xl,
  },
  resultadoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxxl,
  },
  resultadoHemiciclo: {
    width: 300,
  },
  resultadoTexto: {
    flex: 1,
    minWidth: 0,
  },
  escalaLargo: {
    marginTop: Spacing.sm,
  },
  tabelaGrupos: {
    marginTop: Spacing.xs,
  },
  grupoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  grupoNome: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ponto: {
    width: 9,
    height: 9,
    borderRadius: 9,
  },
  grupoSigla: {
    fontFamily: Fonts.bold,
  },
  grupoLugares: {
    width: 90,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  grupoSentido: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fonte: {
    marginTop: Spacing.xxl,
  },
});
