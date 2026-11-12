import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';

export default function DeputadosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [pesquisa, setPesquisa] = useState('');

  const { data, isLoading, isError } = useDeputados();

  const deputados = useMemo(() => {
    const lista = data?.deputados ?? [];
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(
      (d) =>
        d.nome.toLowerCase().includes(termo) ||
        d.partido.toLowerCase().includes(termo) ||
        d.circulo.toLowerCase().includes(termo)
    );
  }, [data, pesquisa]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[Typography.displayLg, { color: colors.text }]}>Deputados</Text>
          <MenuTresPontos />
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Procurar por nome, partido ou círculo"
          placeholderTextColor={colors.tabIconDefault}
          value={pesquisa}
          onChangeText={setPesquisa}
          accessibilityLabel="Procurar deputado"
          accessibilityHint="Filtra a lista por nome, partido ou círculo eleitoral"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={deputados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => (
          <DeputadoRow
            nome={item.nome}
            partido={item.partido}
            circulo={item.circulo}
            fotoUrl={item.fotoUrl}
            onPress={() => router.push({ pathname: '/deputado/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : isError ? (
            <EcraVazio
              icone="cloud-off"
              titulo="Não foi possível carregar"
              descricao="Verifica a tua ligação à internet e tenta novamente."
            />
          ) : (
            <EcraVazio icone="search-off" titulo="Nenhum resultado" descricao="Tenta com outro nome ou partido." />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.badge,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontFamily: 'PublicSans_400Regular',
    fontSize: Typography.bodyLg.fontSize,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  loading: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
