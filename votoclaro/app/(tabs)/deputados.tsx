import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoEdificio, NumerosCabecalho } from '@/components/Azulejo';
import { Assentos, Coluna, LinhaLigacao, Painel, RailItem, RailSecao, Tabela } from '@/components/Computador';
import { Avatar } from '@/components/Avatar';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { LinhaOpcoes } from '@/components/LinhaOpcoes';
import { useEspacoBarra } from '@/components/BarraSeparadores';
import { anim, CampoPesquisa, CabecalhoEcra, Chip, Contentor, transicao, useCores, useDisposicao } from '@/components/ui';
import { getCorPartido, nomePartido } from '@/constants/CORES_PARTIDOS';
import { MAX_WIDTH_LARGO, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { filtrarDeputados } from '@/lib/deputados';
import type { Deputado } from '@/types';

export default function DeputadosScreen() {
  const cores = useCores();
  const router = useRouter();
  // ?q= (pesquisa da barra do topo) e ?partido= (menu Deputados) chegam pelo URL.
  const params = useLocalSearchParams<{ q?: string; partido?: string }>();
  const [pesquisa, setPesquisa] = useState(typeof params.q === 'string' ? params.q.slice(0, 60) : '');
  const [partido, setPartido] = useState<string | null>(typeof params.partido === 'string' ? params.partido : null);
  useEffect(() => {
    if (typeof params.q === 'string') setPesquisa(params.q.slice(0, 60));
  }, [params.q]);
  useEffect(() => {
    if (typeof params.partido === 'string') setPartido(params.partido);
  }, [params.partido]);
  // O partido escolhido fica também no URL, para "Todos" limpar o ?partido= que
  // veio do menu (e a ligação poder ser partilhada).
  const escolherPartido = (p: string | null) => {
    setPartido(p);
    router.setParams({ partido: p ?? undefined });
  };
  const { data, isLoading, isError, refetch } = useDeputados();

  const partidos = useMemo(
    () => Object.entries(data?.lugaresPorPartido ?? {}).sort((a, b) => b[1] - a[1]),
    [data]
  );
  const deputados = useMemo(() => filtrarDeputados(data?.deputados ?? [], pesquisa, partido), [data, pesquisa, partido]);

  const espacoBarra = useEspacoBarra();
  // Telemóvel: uma lista contínua. Computador: uma grelha de 2 ou 3 colunas,
  // cada deputado no seu cartão.
  const { desktop, colunas, largura } = useDisposicao();
  const larguraPagina = Math.min(largura - Spacing.lg * 2, MAX_WIDTH_LARGO);
  const larguraCelula = (larguraPagina - Spacing.md * (colunas - 1)) / colunas;

  if (desktop) {
    return (
      <DeputadosComputador
        todos={data?.deputados}
        partidos={partidos}
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        partido={partido}
        escolherPartido={escolherPartido}
        isLoading={isLoading}
        isError={isError}
        refetch={() => refetch()}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <FlatList
        key={`colunas-${colunas}`}
        numColumns={colunas}
        columnWrapperStyle={colunas > 1 ? [styles.linhaGrelha, { width: larguraPagina }] : undefined}
        data={deputados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.lista, { paddingBottom: Spacing.xxxl + espacoBarra }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View {...anim('pagina')}>
          <View style={styles.faixa}>
            <CabecalhoEdificio
              edificio="torre-belem"
              direita={
                data ? (
                  <NumerosCabecalho
                    itens={[
                      { valor: data.deputados.length, rotulo: 'deputados' },
                      { valor: partidos.length, rotulo: 'grupos parlamentares' },
                      { valor: new Set(data.deputados.map((d) => d.circulo)).size, rotulo: 'círculos eleitorais' },
                    ]}
                  />
                ) : undefined
              }
            >
              <CabecalhoEcra
                titulo="Deputados"
                // No computador o número está nos números do cabeçalho.
                subtitulo={desktop ? 'Em funções na XVII legislatura.' : data ? `${data.deputados.length} deputados em funções` : undefined}
              />
              <View style={desktop ? styles.pesquisaLarga : undefined}>
                <CampoPesquisa
                  valor={pesquisa}
                  onMudar={setPesquisa}
                  placeholder="Nome, partido ou círculo…"
                  accessibilityLabel="Procurar deputado"
                  accessibilityHint="Filtra a lista por nome, partido ou círculo eleitoral"
                />
              </View>
            </CabecalhoEdificio>
          </View>
          <Contentor largo>
            <View style={styles.partidos}>
            <LinhaOpcoes>
              <Chip label="Todos" selecionado={partido === null} onPress={() => escolherPartido(null)} />
              {partidos.map(([sigla, n]) => (
                <Chip
                  key={sigla}
                  label={`${sigla} ${n}`}
                  cor={getCorPartido(sigla)}
                  selecionado={partido === sigla}
                  onPress={() => escolherPartido(partido === sigla ? null : sigla)}
                  accessibilityLabel={`Filtrar por ${sigla}, ${n} ${n === 1 ? 'deputado' : 'deputados'}`}
                />
              ))}
            </LinhaOpcoes>
            </View>
            {data && (pesquisa || partido) ? (
              <Text style={[Typography.caption, styles.contagem, { color: cores.textMuted }]}>
                {deputados.length} {deputados.length === 1 ? 'resultado' : 'resultados'}
              </Text>
            ) : null}
          </Contentor>
          </View>
        }
        renderItem={({ item, index }) => (
          <Contentor style={desktop ? { width: larguraCelula, maxWidth: larguraCelula, alignSelf: 'stretch' } : undefined}>
            <View
              style={[
                styles.linha,
                { backgroundColor: cores.surface, borderColor: cores.border },
                desktop
                  ? styles.celula
                  : [index === 0 && styles.primeira, index === deputados.length - 1 && styles.ultima],
              ]}
            >
              <DeputadoRow
                nome={item.nome}
                partido={item.partido}
                circulo={item.circulo}
                fotoUrl={item.fotoUrl}
                onPress={() => router.push({ pathname: '/deputado/[id]', params: { id: item.id } })}
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
              accao={{ label: 'Tentar de novo', onPress: () => refetch() }}
            />
          ) : (
            <EcraVazio
              icone="person-search"
              titulo="Nenhum deputado encontrado"
              descricao="Tenta outro nome, ou procura pelo teu círculo eleitoral."
              accao={{ label: 'Limpar pesquisa', onPress: () => (setPesquisa(''), escolherPartido(null)) }}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const CIRCULOS_VISIVEIS = 10;

// Computador: filtros à esquerda (pesquisa, grupo, círculo eleitoral), os 230
// lugares desenhados por grupo parlamentar (com a legenda que também filtra) e a
// tabela dos deputados.
function DeputadosComputador({
  todos,
  partidos,
  pesquisa,
  setPesquisa,
  partido,
  escolherPartido,
  isLoading,
  isError,
  refetch,
}: {
  todos: Deputado[] | undefined;
  partidos: [string, number][];
  pesquisa: string;
  setPesquisa: (t: string) => void;
  partido: string | null;
  escolherPartido: (p: string | null) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  const cores = useCores();
  const [circulo, setCirculo] = useState<string | null>(null);
  const [verCirculos, setVerCirculos] = useState(false);
  const lista = todos ?? [];
  const circulos = useMemo(() => {
    const c = new Map<string, number>();
    for (const d of lista) c.set(d.circulo, (c.get(d.circulo) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt'));
  }, [lista]);
  const visiveis = filtrarDeputados(lista, pesquisa, partido).filter((d) => !circulo || d.circulo === circulo);

  const rail = (
    <>
      <CampoPesquisa
        valor={pesquisa}
        onMudar={setPesquisa}
        placeholder="Nome, partido ou círculo…"
        accessibilityLabel="Procurar deputado"
        accessibilityHint="Filtra a lista por nome, partido ou círculo eleitoral"
      />
      <RailSecao titulo="Grupo parlamentar">
        <RailItem rotulo="Todos" contagem={lista.length} ativo={!partido} onPress={() => escolherPartido(null)} />
        {partidos.map(([p, n]) => (
          <RailItem
            key={p}
            rotulo={p}
            ponto={getCorPartido(p)}
            contagem={n}
            ativo={partido === p}
            onPress={() => escolherPartido(partido === p ? null : p)}
            accessibilityLabel={`${nomePartido(p)}, ${n} ${n === 1 ? 'deputado' : 'deputados'}`}
          />
        ))}
      </RailSecao>
      <RailSecao titulo="Círculo eleitoral">
        <RailItem rotulo="Todos" ativo={!circulo} onPress={() => setCirculo(null)} />
        {(verCirculos ? circulos : circulos.slice(0, CIRCULOS_VISIVEIS)).map(([c, n]) => (
          <RailItem key={c} rotulo={c} contagem={n} ativo={circulo === c} onPress={() => setCirculo(circulo === c ? null : c)} />
        ))}
        {circulos.length > CIRCULOS_VISIVEIS ? (
          <Pressable onPress={() => setVerCirculos((v) => !v)} accessibilityRole="button" aria-expanded={verCirculos} style={styles.verTodos}>
            <Text style={[styles.verTodosTexto, { color: cores.tintInk }]}>
              {verCirculos ? 'Mostrar menos' : `Todos os ${circulos.length} círculos`}
            </Text>
          </Pressable>
        ) : null}
      </RailSecao>
    </>
  );

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.paginaComputador} keyboardShouldPersistTaps="handled">
        <View {...anim('pagina')}>
          <CabecalhoEdificio
            edificio="torre-belem"
            direita={
              todos ? (
                <NumerosCabecalho
                  itens={[
                    { valor: lista.length, rotulo: 'deputados' },
                    { valor: partidos.length, rotulo: 'grupos parlamentares' },
                    { valor: circulos.length, rotulo: 'círculos eleitorais' },
                  ]}
                />
              ) : undefined
            }
          >
            <CabecalhoEcra titulo="Deputados" subtitulo="Em funções na XVII legislatura." />
          </CabecalhoEdificio>
        </View>
        <Contentor largo style={styles.margensComputador}>
          <Painel rail={rail}>
            {isLoading ? (
              <View style={styles.carregar}>
                <ActivityIndicator color={cores.tint} />
              </View>
            ) : isError ? (
              <EcraVazio icone="cloud-off" titulo="Não foi possível carregar" descricao="Verifica a tua ligação à internet e tenta de novo." accao={{ label: 'Tentar de novo', onPress: refetch }} />
            ) : (
              <>
                <View style={[styles.assentos, { backgroundColor: cores.surface, borderColor: cores.border }]}>
                  <Assentos lugares={partidos} selecionado={partido} />
                  <View style={styles.legendaAssentos}>
                    {partidos.map(([p, n]) => (
                      <Pressable
                        key={p}
                        onPress={() => escolherPartido(partido === p ? null : p)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: partido === p }}
                        aria-pressed={partido === p}
                        accessibilityLabel={`${nomePartido(p)}, ${n} ${n === 1 ? 'deputado' : 'deputados'}`}
                        style={({ hovered }: { hovered?: boolean }) => [
                          styles.legendaItem,
                          transicao,
                          (partido === p || hovered) && { backgroundColor: cores.surfaceAlt },
                        ]}
                      >
                        <View style={[styles.ponto, { backgroundColor: getCorPartido(p) }]} />
                        <Text style={[Typography.caption, { color: cores.text }]}>
                          {p} <Text style={styles.legendaNumero}>{n}</Text>
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[Typography.caption, styles.notaAssentos, { color: cores.textMuted }]}>
                    Os 230 lugares, por grupo parlamentar, do maior para o menor.
                  </Text>
                </View>
                {pesquisa || partido || circulo ? (
                  <Text style={[Typography.caption, styles.contagem, { color: cores.textMuted }]}>
                    {visiveis.length} {visiveis.length === 1 ? 'resultado' : 'resultados'}
                  </Text>
                ) : null}
                {visiveis.length === 0 ? (
                  <EcraVazio
                    icone="person-search"
                    titulo="Nenhum deputado encontrado"
                    descricao="Tenta outro nome, ou procura pelo teu círculo eleitoral."
                    accao={{ label: 'Limpar filtros', onPress: () => (setPesquisa(''), escolherPartido(null), setCirculo(null)) }}
                  />
                ) : (
                  <Tabela
                    cabecalho={
                      <>
                        <Coluna flex>Nome</Coluna>
                        <Coluna largura={200}>Grupo parlamentar</Coluna>
                        <Coluna largura={160}>Círculo</Coluna>
                        <View style={styles.seta} />
                      </>
                    }
                  >
                    {visiveis.map((d, n) => (
                      <LinhaLigacao
                        key={d.id}
                        href={{ pathname: '/deputado/[id]', params: { id: d.id } }}
                        accessibilityLabel={`${d.nome}, ${nomePartido(d.partido)}, ${d.circulo}`}
                        ultima={n === visiveis.length - 1}
                      >
                        <View style={styles.nome}>
                          <Avatar nome={d.nome} fotoUrl={d.fotoUrl} partido={d.partido} size={32} />
                          <Text style={[Typography.bodySm, styles.nomeTexto, { color: cores.text }]} numberOfLines={1}>
                            {d.nome}
                          </Text>
                        </View>
                        <View style={styles.grupo}>
                          <View style={[styles.ponto, { backgroundColor: getCorPartido(d.partido) }]} />
                          <Text style={[Typography.bodySm, { color: cores.text }]} numberOfLines={1}>
                            {d.partido}
                          </Text>
                        </View>
                        <Text style={[Typography.bodySm, styles.circulo, { color: cores.textMuted }]} numberOfLines={1}>
                          {d.circulo}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color={cores.textMuted} style={styles.seta} />
                      </LinhaLigacao>
                    ))}
                  </Tabela>
                )}
              </>
            )}
          </Painel>
        </Contentor>
      </ScrollView>
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
  pesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radii.chip,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  faixa: {
    marginHorizontal: -Spacing.lg,
  },
  partidos: {
    paddingVertical: Spacing.sm,
  },
  contagem: {
    marginBottom: Spacing.sm,
  },
  linha: {
    paddingHorizontal: Spacing.lg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pesquisaLarga: {
    maxWidth: 480,
  },
  linhaGrelha: {
    alignSelf: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  celula: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.card,
  },
  primeira: {
    borderTopWidth: 1,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
  },
  ultima: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: Radii.card,
    borderBottomRightRadius: Radii.card,
  },
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
  paginaComputador: {
    paddingBottom: Spacing.huge,
  },
  margensComputador: {
    paddingHorizontal: Spacing.lg,
  },
  verTodos: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 10,
  },
  verTodosTexto: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  assentos: {
    borderWidth: 1,
    borderRadius: Radii.card,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  legendaAssentos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.md,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  legendaNumero: {
    fontFamily: Fonts.bold,
  },
  notaAssentos: {
    marginTop: Spacing.sm,
  },
  ponto: {
    width: 9,
    height: 9,
    borderRadius: 9,
  },
  nome: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nomeTexto: {
    fontFamily: Fonts.semibold,
    flexShrink: 1,
  },
  grupo: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  circulo: {
    width: 160,
  },
  seta: {
    width: 20,
  },
});
