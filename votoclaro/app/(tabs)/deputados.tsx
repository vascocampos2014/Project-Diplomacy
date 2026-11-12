import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { CabecalhoEcra, Chip, Contentor, useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { filtrarDeputados } from '@/lib/deputados';

export default function DeputadosScreen() {
  const cores = useCores();
  const router = useRouter();
  const [pesquisa, setPesquisa] = useState('');
  const [partido, setPartido] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDeputados();

  const partidos = useMemo(
    () => Object.entries(data?.lugaresPorPartido ?? {}).sort((a, b) => b[1] - a[1]),
    [data]
  );
  const deputados = useMemo(() => filtrarDeputados(data?.deputados ?? [], pesquisa, partido), [data, pesquisa, partido]);

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['top']}>
      <FlatList
        data={deputados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Contentor>
            <CabecalhoEcra
              titulo="Deputados"
              subtitulo={data ? `${data.deputados.length} deputados em funções` : undefined}
              direita={<MenuTresPontos />}
            />
            <View style={[styles.pesquisa, { backgroundColor: cores.surface, borderColor: cores.border }]}>
              <MaterialIcons name="search" size={20} color={cores.textMuted} accessible={false} />
              <TextInput
                style={[styles.input, { color: cores.text }]}
                placeholder="Nome, partido ou círculo"
                placeholderTextColor={cores.textMuted}
                value={pesquisa}
                onChangeText={setPesquisa}
                accessibilityLabel="Procurar deputado"
                accessibilityHint="Filtra a lista por nome, partido ou círculo eleitoral"
                autoCorrect={false}
                clearButtonMode="while-editing"
                maxLength={60}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partidos}>
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
            </ScrollView>
            {data && (pesquisa || partido) ? (
              <Text style={[Typography.caption, styles.contagem, { color: cores.textMuted }]}>
                {deputados.length} {deputados.length === 1 ? 'resultado' : 'resultados'}
              </Text>
            ) : null}
          </Contentor>
        }
        renderItem={({ item, index }) => (
          <Contentor>
            <View
              style={[
                styles.linha,
                { backgroundColor: cores.surface, borderColor: cores.border },
                index === 0 && styles.primeira,
                index === deputados.length - 1 && styles.ultima,
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
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  partidos: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  contagem: {
    marginBottom: Spacing.sm,
  },
  linha: {
    paddingHorizontal: Spacing.lg,
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
  carregar: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
