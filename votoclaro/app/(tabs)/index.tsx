import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoEdificio, NumerosCabecalho } from '@/components/Azulejo';
import { Carimbo } from '@/components/Hemiciclo';
import { Coluna, FaixaPartidos, LARGURA_FAIXA, LinhaLigacao, NumerosVoto, Painel, RailItem, RailSecao, SiglasFaixa, Tabela } from '@/components/Computador';
import { EcraVazio } from '@/components/EcraVazio';
import { FiltroTemas } from '@/components/FiltroTemas';
import { anim, CabecalhoEcra, Contentor, TituloSecao, useCores, useDisposicao } from '@/components/ui';
import { useEspacoBarra } from '@/components/BarraSeparadores';
import { VotacaoCard } from '@/components/VotacaoCard';
import { MAX_WIDTH_LARGO, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import type { Posicao, Resultado } from '@/types';
import type { ItemFeed } from '@/lib/feed';
import { TEMAS } from '@/lib/temas';
import { ICONE_TEMA } from '@/components/BarraComputador';

export default function FeedScreen() {
  const cores = useCores();
  const router = useRouter();
  // O tema escolhido fica no URL (?tema=Saúde), para a ligação poder ser partilhada.
  const params = useLocalSearchParams<{ tema?: string }>();
  const tema = params.tema && TEMAS.includes(params.tema) ? params.tema : null;
  const setTema = (t: string | null) => router.setParams({ tema: t ?? undefined });
  const [aAtualizar, setAAtualizar] = useState(false);
  const { itens, total, isLoading, isError, refetch } = useVotacoesFeed();

  const filtrados = useMemo(() => (itens ?? []).filter((i) => !tema || i.iniciativa.tema === tema), [itens, tema]);

  const espacoBarra = useEspacoBarra();

  async function atualizar() {
    setAAtualizar(true);
    await refetch().finally(() => setAAtualizar(false));
  }

  // A primeira votação é a manchete (no cabeçalho da lista); as outras são
  // cartões, numa coluna no telemóvel e numa grelha no computador.
  const [manchete, ...resto] = filtrados;
  const { desktop, colunas, largura } = useDisposicao();
  const larguraPagina = Math.min(largura - Spacing.lg * 2, MAX_WIDTH_LARGO);
  const larguraCartao = desktop ? (larguraPagina - Spacing.lg * (colunas - 1)) / colunas : undefined;

  const cartao = (item: ItemFeed, destaque: boolean, index: number) => (
    <VotacaoCard
      destaque={destaque}
      largo={destaque && desktop}
      esticar={!destaque && desktop}
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
      key={`${item.votacaoId}-${index}`}
    />
  );

  if (desktop) {
    return <VotacoesComputador itens={itens} total={total} isLoading={isLoading} isError={isError} atualizar={atualizar} tema={tema} setTema={setTema} />;
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <FlatList
        // numColumns não pode mudar em andamento: a key força uma lista nova.
        key={`colunas-${colunas}`}
        numColumns={colunas}
        columnWrapperStyle={colunas > 1 ? [styles.linhaGrelha, { width: larguraPagina }] : undefined}
        data={resto}
        keyExtractor={(item) => item.votacaoId}
        contentContainerStyle={[styles.lista, { paddingBottom: Spacing.xxxl + espacoBarra }]}
        refreshControl={<RefreshControl refreshing={aAtualizar} onRefresh={atualizar} tintColor={cores.tint} />}
        ListHeaderComponent={
          <View {...anim('pagina')}>
            <View style={styles.faixa}>
              <CabecalhoEdificio
                edificio="sao-bento"
                direita={total ? <NumerosCabecalho itens={[{ valor: total, rotulo: 'votações na XVII legislatura' }]} /> : undefined}
              >
                <CabecalhoEcra titulo="Votações" subtitulo="O que o Parlamento votou nos últimos dias e como votou cada partido." />
                <View style={styles.filtros}>
                  <FiltroTemas temas={TEMAS} selecionado={tema} onSelecionar={setTema} />
                </View>
              </CabecalhoEdificio>
            </View>
            <Contentor largo>
              {manchete ? (
                <View style={[styles.destaque, desktop && styles.destaqueLargo, desktop && { borderBottomColor: cores.border }]} {...anim('item', 0)}>
                  {cartao(manchete, true, 0)}
                </View>
              ) : null}
              {resto.length > 0 ? <TituloSecao>Votações recentes</TituloSecao> : null}
            </Contentor>
          </View>
        }
        renderItem={({ item, index }) => (
          <Contentor style={[styles.item, larguraCartao !== undefined && { width: larguraCartao, maxWidth: larguraCartao, alignSelf: 'stretch' }]}>
            <View {...anim('item', index + 1)} style={desktop ? styles.celula : undefined}>
              {cartao(item, false, index + 1)}
            </View>
          </Contentor>
        )}
        ListEmptyComponent={
          manchete ? null : isLoading ? (
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

const TIPOS = ['Projeto de Lei', 'Proposta de Lei', 'Projeto de Resolução'];

// Computador: filtros fixos à esquerda (tema, resultado, tipo, com contagens das
// votações mostradas) e uma tabela, uma linha por votação, com o sentido de cada
// grupo parlamentar numa faixa de amostras de tinta e os números.
function VotacoesComputador({
  itens,
  total,
  isLoading,
  isError,
  atualizar,
  tema,
  setTema,
}: {
  itens: ItemFeed[] | undefined;
  total: number | undefined;
  isLoading: boolean;
  isError: boolean;
  atualizar: () => void;
  tema: string | null;
  setTema: (t: string | null) => void;
}) {
  const cores = useCores();
  const deputados = useDeputados();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const todos = itens ?? [];
  const partidos = useMemo(
    () =>
      Object.entries(deputados.data?.lugaresPorPartido ?? {})
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([p]) => p),
    [deputados.data]
  );
  const tipoDe = (i: ItemFeed) => TIPOS.find((t) => i.referencia.startsWith(t)) ?? null;
  const visiveis = todos.filter(
    (i) => (!tema || i.iniciativa.tema === tema) && (!resultado || i.iniciativa.resultado === resultado) && (!tipo || tipoDe(i) === tipo)
  );
  const conta = (f: (i: ItemFeed) => boolean) => todos.filter(f).length;
  const posicaoDe = (i: ItemFeed) => (p: string): Posicao =>
    i.partidos.favor.includes(p) ? 'favor' : i.partidos.contra.includes(p) ? 'contra' : i.partidos.abstencao.includes(p) ? 'abstencao' : 'ausente';

  const rail = (
    <>
      <RailSecao titulo="Tema" primeira>
        <RailItem rotulo="Todos" icone="apps" contagem={todos.length} ativo={!tema} onPress={() => setTema(null)} />
        {TEMAS.map((t) => (
          <RailItem key={t} rotulo={t} icone={ICONE_TEMA[t]} contagem={conta((i) => i.iniciativa.tema === t)} ativo={tema === t} onPress={() => setTema(tema === t ? null : t)} />
        ))}
      </RailSecao>
      <RailSecao titulo="Resultado">
        <RailItem rotulo="Todos" ativo={!resultado} onPress={() => setResultado(null)} />
        <RailItem rotulo="Aprovadas" contagem={conta((i) => i.iniciativa.resultado === 'aprovada')} ativo={resultado === 'aprovada'} onPress={() => setResultado(resultado === 'aprovada' ? null : 'aprovada')} />
        <RailItem rotulo="Chumbadas" contagem={conta((i) => i.iniciativa.resultado === 'chumbada')} ativo={resultado === 'chumbada'} onPress={() => setResultado(resultado === 'chumbada' ? null : 'chumbada')} />
      </RailSecao>
      <RailSecao titulo="Tipo">
        <RailItem rotulo="Todos" ativo={!tipo} onPress={() => setTipo(null)} />
        {TIPOS.map((t) => (
          <RailItem key={t} rotulo={t} contagem={conta((i) => tipoDe(i) === t)} ativo={tipo === t} onPress={() => setTipo(tipo === t ? null : t)} />
        ))}
      </RailSecao>
    </>
  );

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.paginaComputador}>
        <View {...anim('pagina')}>
          <CabecalhoEdificio
            edificio="sao-bento"
            direita={total ? <NumerosCabecalho itens={[{ valor: total, rotulo: 'votações na XVII legislatura' }]} /> : undefined}
          >
            <CabecalhoEcra titulo="Votações" subtitulo="As votações mais recentes do Parlamento e como votou cada grupo parlamentar." />
          </CabecalhoEdificio>
        </View>
        <Contentor largo style={styles.margensComputador}>
          <Painel rail={rail}>
            {isLoading ? (
              <View style={styles.carregar}>
                <ActivityIndicator color={cores.tint} />
              </View>
            ) : isError ? (
              <EcraVazio icone="cloud-off" titulo="Não foi possível carregar" descricao="Verifica a tua ligação à internet e tenta de novo." accao={{ label: 'Tentar de novo', onPress: atualizar }} />
            ) : visiveis.length === 0 ? (
              <EcraVazio
                icone="filter-alt-off"
                titulo="Nenhuma votação com estes filtros"
                descricao="Nas votações mais recentes não há nenhuma assim."
                accao={{ label: 'Limpar filtros', onPress: () => (setTema(null), setResultado(null), setTipo(null)) }}
              />
            ) : (
              <Tabela
                cabecalho={
                  <>
                    <Coluna largura={64}>Data</Coluna>
                    <Coluna flex>Iniciativa</Coluna>
                    <View style={{ width: LARGURA_FAIXA(partidos.length) }}>
                      <SiglasFaixa partidos={partidos} />
                    </View>
                    <Coluna largura={150}>Deputados</Coluna>
                    <Coluna largura={104}>Resultado</Coluna>
                  </>
                }
              >
                {visiveis.map((i, n) => (
                  <LinhaLigacao
                    key={i.votacaoId}
                    href={{ pathname: '/votacao/[id]', params: { id: i.votacaoId, iniciativaId: String(i.iniciativaId) } }}
                    accessibilityLabel={`${i.iniciativa.titulo}. ${i.referencia}. ${i.iniciativa.dataVoto}. ${i.iniciativa.resultado === 'aprovada' ? 'Aprovada' : 'Chumbada'}: ${i.iniciativa.favor} a favor, ${i.iniciativa.contra} contra, ${i.iniciativa.abstencao} abstenções`}
                    ultima={n === visiveis.length - 1}
                  >
                    <Text style={[Typography.caption, styles.data, { color: cores.textMuted }]}>{i.iniciativa.dataVoto.replace(/ \d{4}$/, '')}</Text>
                    <View style={styles.titulo}>
                      <Text style={[Typography.bodySm, styles.tituloTexto, { color: cores.text }]} numberOfLines={1}>
                        {i.iniciativa.titulo}
                      </Text>
                      <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
                        {i.referencia}
                      </Text>
                    </View>
                    <FaixaPartidos partidos={partidos} posicaoDe={posicaoDe(i)} />
                    <View style={styles.numerosColuna}>
                      <NumerosVoto favor={i.iniciativa.favor} contra={i.iniciativa.contra} abstencao={i.iniciativa.abstencao} />
                    </View>
                    <View style={styles.resultadoColuna}>
                      <Carimbo resultado={i.iniciativa.resultado} />
                    </View>
                  </LinhaLigacao>
                ))}
              </Tabela>
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
  faixa: {
    marginHorizontal: -Spacing.lg,
  },
  filtros: {
    marginBottom: Spacing.sm,
  },
  destaque: {
    marginBottom: Spacing.sm,
  },
  // No computador a manchete fecha com uma linha fina, como numa primeira página.
  destaqueLargo: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    marginBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linhaGrelha: {
    alignSelf: 'center',
    gap: Spacing.lg,
    alignItems: 'stretch',
  },
  celula: {
    flex: 1,
  },
  item: {
    marginBottom: Spacing.md,
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
  data: {
    width: 64,
  },
  titulo: {
    flex: 1,
    minWidth: 0,
  },
  tituloTexto: {
    fontFamily: Fonts.semibold,
  },
  numerosColuna: {
    width: 150,
  },
  resultadoColuna: {
    width: 104,
    alignItems: 'flex-start',
  },
});
