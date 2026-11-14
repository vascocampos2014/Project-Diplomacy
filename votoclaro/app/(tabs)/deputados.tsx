import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoEdificio } from '@/components/Azulejo';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { LinhaOpcoes } from '@/components/LinhaOpcoes';
import { useEspacoBarra } from '@/components/BarraSeparadores';
import { anim, CampoPesquisa, CabecalhoEcra, Chip, Contentor, useCores, useDisposicao } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { MAX_WIDTH_LARGO, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { filtrarDeputados } from '@/lib/deputados';

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
            <CabecalhoEdificio edificio="torre-belem">
              <CabecalhoEcra
                titulo="Deputados"
                subtitulo={data ? `${data.deputados.length} deputados em funções` : undefined}
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
              <Chip label="Todos" selecionado={partido === null} onPress={() => setPartido(null)} />
              {partidos.map(([sigla, n]) => (
                <Chip
                  key={sigla}
                  label={`${sigla} ${n}`}
                  cor={getCorPartido(sigla)}
                  selecionado={partido === sigla}
                  onPress={() => setPartido(partido === sigla ? null : sigla)}
                  accessibilityLabel={`Filtrar por ${sigla}, ${n} deputados`}
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
              accao={{ label: 'Limpar pesquisa', onPress: () => (setPesquisa(''), setPartido(null)) }}
            />
          )
        }
      />
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
});
