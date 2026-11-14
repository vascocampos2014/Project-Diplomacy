import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { FaixaAzulejo } from '@/components/Azulejo';
import { Coluna, LinhaLigacao, Tabela } from '@/components/Computador';
import { EcraVazio } from '@/components/EcraVazio';
import { FiltroPosicao } from '@/components/FiltroPosicao';
import { anim, Aviso, Botao, CampoPesquisa, Cartao, Contentor, nivel, TituloSecao, useCores, useDisposicao } from '@/components/ui';
import { Amostra } from '@/components/Amostra';
import { ROTULO, VotoIndicator } from '@/components/VotoIndicator';
import { getCorPartido, nomePartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputado } from '@/hooks/useDeputado';
import { useDeputados } from '@/hooks/useDeputados';
import { usePartidoStats } from '@/hooks/usePartidoStats';
import { concordancia } from '@/lib/comparar';
import { normalizar } from '@/lib/deputados';
import { fotoUrl } from '@/lib/parlamento-api';
import type { Posicao } from '@/types';

export default function DeputadoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cores = useCores();
  const { desktop } = useDisposicao();
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

  if (desktop) {
    return <DeputadoComputador deputado={deputado} />;
  }

  const cor = getCorPartido(deputado.partido);
  const stat = statsQuery.data?.stats[deputado.partido];
  const presentes = stat ? stat.total - stat.ausente : 0;
  const pct = (n: number) => (presentes > 0 ? Math.round((n / presentes) * 100) : undefined);

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: deputado.nome }} />
      <FlatList
        data={historico}
        keyExtractor={(item, i) => `${item.votacaoId}-${i}`}
        contentContainerStyle={styles.lista}
        initialNumToRender={20}
        ListHeaderComponent={
          <View {...anim('pagina')}>
          {/* No computador a barra do topo já é de azulejo: sem segunda faixa. */}
          {desktop ? (
            <View style={styles.semFaixa} />
          ) : (
            <View style={styles.faixa}>
              <FaixaAzulejo altura={56} />
            </View>
          )}
          <Contentor>
            <View style={styles.perfil}>
              <View style={[styles.moldura, desktop && styles.molduraLarga, { borderColor: cores.tint, backgroundColor: cores.background }]}>
                <Avatar nome={deputado.nome} fotoUrl={fotoUrl(deputado.id)} partido={deputado.partido} size={76} />
              </View>
              <View style={styles.perfilTextos}>
                <Text style={[Typography.displayLg, { color: cores.text }]} accessibilityRole="header" {...nivel(1)}>
                  {deputado.nome}
                </Text>
                {deputado.nomeCompleto !== deputado.nome ? (
                  <Text style={[Typography.caption, styles.completo, { color: cores.textMuted }]}>{deputado.nomeCompleto}</Text>
                ) : null}
                <View style={styles.meta}>
                  <View style={[styles.partido, { borderColor: cores.border }]}>
                    <View style={[styles.ponto, { backgroundColor: cor }]} />
                    <Text style={[styles.partidoTexto, { color: cores.text }]}>{deputado.partido}</Text>
                  </View>
                  <Text style={[Typography.bodySm, { color: cores.textMuted }]}>Círculo de {deputado.circulo}</Text>
                </View>
              </View>
            </View>

            {/* Os votos são registados por grupo parlamentar, não por deputado: os números
                são do grupo e o título di-lo, para não parecerem o registo pessoal. */}
            <TituloSecao
              nota={`Na Assembleia, os votos são registados por grupo parlamentar, não por pessoa. Estes números são do ${nomePartido(deputado.partido)} nesta legislatura.`}
            >
              {`Como vota o grupo parlamentar ${deputado.partido}`}
            </TituloSecao>
            <View style={[styles.stats, { borderTopColor: cores.tint, borderBottomColor: cores.border }]}>
              <Stat label="A favor" valor={pct(stat?.favor ?? 0)} posicao="favor" />
              <Stat label="Contra" valor={pct(stat?.contra ?? 0)} posicao="contra" />
              <Stat label="Abstenção" valor={pct(stat?.abstencao ?? 0)} posicao="abstencao" />
            </View>

            <TituloSecao nota={stat ? `${stat.total} votações do grupo parlamentar` : undefined}>Historial do grupo</TituloSecao>
            <FiltroPosicao selecionado={filtro} onSelecionar={setFiltro} />
          </Contentor>
          </View>
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
              accessibilityLabel={`${item.titulo}, ${item.dataVoto}, ${ROTULO[item.posicao]}`}
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

const PAGINA = 40;

// Computador: a ficha fixa à esquerda (fotografia, dados, percentagens do grupo)
// e, à direita, o historial do grupo com pesquisa e filtro, e com quem o grupo
// vota da mesma forma.
function DeputadoComputador({ deputado }: { deputado: NonNullable<ReturnType<typeof useDeputado>['data']> }) {
  const cores = useCores();
  const statsQuery = usePartidoStats();
  const deputadosQuery = useDeputados();
  const [filtro, setFiltro] = useState<Posicao | null>(null);
  const [pesquisa, setPesquisa] = useState('');
  const [mostrar, setMostrar] = useState(PAGINA);
  const p = deputado.partido;
  const todos = statsQuery.data?.historicoPorPartido[p] ?? [];
  const termo = normalizar(pesquisa);
  const historico = todos.filter((h) => (!filtro || h.posicao === filtro) && (!termo || normalizar(h.titulo).includes(termo)));
  const stat = statsQuery.data?.stats[p];
  const presentes = stat ? stat.total - stat.ausente : 0;
  const pct = (n: number) => (presentes > 0 ? Math.round((n / presentes) * 100) : undefined);

  const proximidade = useMemo(() => {
    const h = statsQuery.data?.historicoPorPartido;
    const lugares = deputadosQuery.data?.lugaresPorPartido;
    if (!h || !lugares || !h[p]) return [];
    return Object.keys(lugares)
      .filter((q) => q !== p && h[q])
      .map((q) => ({ partido: q, percentagem: concordancia(h[p], h[q]).percentagem }))
      .filter((x): x is { partido: string; percentagem: number } => x.percentagem !== null)
      .sort((a, b) => b.percentagem - a.percentagem || a.partido.localeCompare(b.partido));
  }, [statsQuery.data, deputadosQuery.data, p]);

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: deputado.nome }} />
      <ScrollView contentContainerStyle={styles.paginaComputador}>
        <Contentor largo style={styles.margensComputador}>
          <View style={styles.duasColunas} {...anim('pagina')}>
            <View style={[styles.ficha, { borderRightColor: cores.border }]}>
              <View style={[styles.moldura, styles.molduraLarga, { borderColor: getCorPartido(p), backgroundColor: cores.background }]}>
                <Avatar nome={deputado.nome} fotoUrl={fotoUrl(deputado.id)} partido={p} size={112} />
              </View>
              <Text style={[Typography.displayLg, styles.fichaNome, { color: cores.tintInk }]} accessibilityRole="header" {...nivel(1)}>
                {deputado.nome}
              </Text>
              {deputado.nomeCompleto !== deputado.nome ? (
                <Text style={[Typography.caption, styles.completo, { color: cores.textMuted }]}>{deputado.nomeCompleto}</Text>
              ) : null}
              <View style={styles.fichaPartido}>
                <View style={[styles.ponto, { backgroundColor: getCorPartido(p) }]} />
                <Text style={[Typography.bodySm, styles.partidoTexto, { color: cores.text }]}>{nomePartido(p)}</Text>
              </View>
              <View style={styles.dados}>
                <Dado rotulo="Círculo" valor={deputado.circulo} />
                <Dado rotulo="Legislatura" valor="XVII" />
              </View>
              <View style={styles.miniStats}>
                {(['favor', 'contra', 'abstencao'] as const).map((k) => (
                  <View key={k} style={[styles.miniStat, { backgroundColor: cores.surface, borderColor: cores.border }]} accessible accessibilityLabel={`${ROTULO[k]}: ${pct(stat?.[k] ?? 0) ?? '—'}%`}>
                    <Amostra posicao={k} />
                    <Text style={[Typography.data, { color: cores.text }]}>{pct(stat?.[k] ?? 0) ?? '—'}%</Text>
                    <Text style={[Typography.caption, { color: cores.textMuted }]}>{ROTULO[k].toLowerCase()}</Text>
                  </View>
                ))}
              </View>
              <Text style={[Typography.caption, styles.fichaNota, { color: cores.textMuted }]}>
                {`Sentido de voto do grupo ${p} nas ${stat?.total ?? 0} votações da legislatura. Na Assembleia os votos são registados por grupo parlamentar, não por deputado.`}
              </Text>
            </View>

            <View style={styles.direita}>
              <TituloSecao nota={`${todos.length} votações do grupo parlamentar ${p}`}>Historial do grupo</TituloSecao>
              <View style={styles.filtrosHistorial}>
                <View style={styles.pesquisaHistorial}>
                  <CampoPesquisa
                    valor={pesquisa}
                    onMudar={(t) => (setPesquisa(t), setMostrar(PAGINA))}
                    placeholder="Procurar no historial…"
                    accessibilityLabel="Procurar no historial do grupo"
                  />
                </View>
                <FiltroPosicao selecionado={filtro} onSelecionar={(f) => (setFiltro(f), setMostrar(PAGINA))} />
              </View>
              {statsQuery.isLoading ? (
                <ActivityIndicator color={cores.tint} />
              ) : historico.length === 0 ? (
                <Aviso>{filtro || termo ? 'Nenhuma votação com estes filtros.' : 'Ainda não há historial de votos disponível.'}</Aviso>
              ) : (
                <>
                  <Tabela
                    cabecalho={
                      <>
                        <Coluna largura={96}>Data</Coluna>
                        <Coluna flex>Iniciativa</Coluna>
                        <Coluna largura={130}>Sentido do grupo</Coluna>
                      </>
                    }
                  >
                    {historico.slice(0, mostrar).map((h, n, arr) => (
                      <LinhaLigacao
                        key={`${h.votacaoId}-${n}`}
                        href={{ pathname: '/votacao/[id]', params: { id: h.votacaoId, iniciativaId: String(h.iniciativaId) } }}
                        accessibilityLabel={`${h.titulo}, ${h.dataVoto}, ${ROTULO[h.posicao]}`}
                        ultima={n === arr.length - 1}
                      >
                        <Text style={[Typography.caption, styles.colData, { color: cores.textMuted }]}>{h.dataVoto}</Text>
                        <View style={styles.colTitulo}>
                          <Text style={[Typography.bodySm, { color: cores.text }]} numberOfLines={1}>
                            {h.titulo}
                          </Text>
                          <Text style={[Typography.caption, { color: cores.textMuted }]}>{h.tema}</Text>
                        </View>
                        <View style={styles.colSentido}>
                          <VotoIndicator posicao={h.posicao} size="sm" />
                        </View>
                      </LinhaLigacao>
                    ))}
                  </Tabela>
                  {historico.length > mostrar ? (
                    <Botao
                      label={`Mostrar mais ${Math.min(PAGINA, historico.length - mostrar)} de ${historico.length - mostrar}`}
                      variante="secundario"
                      onPress={() => setMostrar((m) => m + PAGINA)}
                      style={styles.mais}
                    />
                  ) : null}
                </>
              )}

              {proximidade.length > 0 ? (
                <>
                  <TituloSecao nota="Percentagem de votações com o mesmo sentido, nas votações da legislatura em que os dois grupos estiveram presentes.">
                    {`Com quem o ${p} vota da mesma forma`}
                  </TituloSecao>
                  <Cartao>
                    {proximidade.map((x) => (
                      <View key={x.partido} style={styles.prox} accessible accessibilityLabel={`${nomePartido(x.partido)}: ${x.percentagem}%`}>
                        <View style={styles.proxSigla}>
                          <View style={[styles.ponto, { backgroundColor: getCorPartido(x.partido) }]} />
                          <Text style={[Typography.label, { color: cores.text }]}>{x.partido}</Text>
                        </View>
                        <View style={[styles.proxTrilho, { backgroundColor: cores.border }]}>
                          <View style={[styles.proxBarra, { width: `${x.percentagem}%`, backgroundColor: cores.text }]} />
                        </View>
                        <Text style={[Typography.label, styles.proxValor, { color: cores.text }]}>{x.percentagem}%</Text>
                      </View>
                    ))}
                  </Cartao>
                </>
              ) : null}
            </View>
          </View>
        </Contentor>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  const cores = useCores();
  return (
    <View style={styles.dado}>
      <Text style={[Typography.caption, styles.dadoRotulo, { color: cores.textMuted }]}>{rotulo}</Text>
      <Text style={[Typography.bodySm, styles.partidoTexto, { color: cores.text }]}>{valor}</Text>
    </View>
  );
}

function Stat({ label, valor, posicao }: { label: string; valor?: number; posicao: Posicao }) {
  const cores = useCores();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${valor !== undefined ? `${valor}%` : 'sem dados'}`}>
      <Text style={[Typography.data, { color: cores.text }]}>{valor !== undefined ? `${valor}%` : '—'}</Text>
      <View style={styles.statRotulo}>
        <Amostra posicao={posicao} />
        <Text style={[Typography.caption, { color: cores.textMuted }]}>{label}</Text>
      </View>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  faixa: {
    marginHorizontal: -Spacing.lg,
  },
  perfil: {
    gap: Spacing.md,
  },
  semFaixa: {
    height: Spacing.xxl,
  },
  molduraLarga: {
    marginTop: 0,
  },
  moldura: {
    marginTop: -36,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderRadius: Radii.pill,
    padding: 2,
  },
  perfilTextos: {
    flex: 1,
  },
  completo: {
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  partido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: Radii.chip,
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
    borderTopWidth: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stat: {
    flex: 1,
    paddingVertical: Spacing.md,
    gap: 2,
  },
  statRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  paginaComputador: {
    paddingBottom: Spacing.huge,
  },
  margensComputador: {
    paddingHorizontal: Spacing.lg,
  },
  duasColunas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xxxl,
  },
  ficha: {
    width: 300,
    paddingTop: Spacing.xxxl,
    paddingRight: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  fichaNome: {
    marginTop: Spacing.lg,
  },
  fichaPartido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dados: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  dado: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dadoRotulo: {
    width: 80,
  },
  miniStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  miniStat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.chip,
    padding: Spacing.sm,
    gap: 2,
  },
  fichaNota: {
    marginTop: Spacing.sm,
  },
  direita: {
    flex: 1,
    minWidth: 0,
    paddingTop: Spacing.sm,
  },
  filtrosHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pesquisaHistorial: {
    width: 300,
    marginBottom: Spacing.sm,
  },
  colData: {
    width: 96,
  },
  colTitulo: {
    flex: 1,
    minWidth: 0,
  },
  colSentido: {
    width: 130,
  },
  mais: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  prox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  proxSigla: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proxTrilho: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  proxBarra: {
    height: '100%',
  },
  proxValor: {
    width: 44,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
