import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { CabecalhoEcra, CampoPesquisa, Contentor } from '@/components/ui';
import { GlossarioItem } from '@/components/GlossarioItem';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { normalizar } from '@/lib/deputados';
import { GLOSSARIO } from '@/lib/glossarioData';

export default function GlossarioScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [pesquisa, setPesquisa] = useState('');

  const termos = useMemo(() => {
    const termo = normalizar(pesquisa);
    const lista = termo
      ? GLOSSARIO.filter((item) => normalizar(item.termo).includes(termo) || normalizar(item.definicao).includes(termo))
      : GLOSSARIO;
    return [...lista].sort((a, b) => a.termo.localeCompare(b.termo, 'pt'));
  }, [pesquisa]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Glossário' }} />
      <Contentor style={styles.header}>
        <CabecalhoEcra titulo="Glossário" subtitulo="Termos comuns do processo legislativo, explicados de forma simples." />
        <CampoPesquisa
          valor={pesquisa}
          onMudar={setPesquisa}
          placeholder="Procurar termo…"
          accessibilityLabel="Procurar termo no glossário"
          accessibilityHint="Filtra a lista por termo ou definição"
        />
      </Contentor>
      <FlatList
        data={termos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <Contentor>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          </Contentor>
        )}
        renderItem={({ item }) => (
          <Contentor>
            <GlossarioItem termo={item.termo} definicao={item.definicao} />
          </Contentor>
        )}
        ListEmptyComponent={
          <EcraVazio icone="search-off" titulo="Nenhum resultado" descricao="Tenta com outra palavra." />
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
    paddingBottom: Spacing.md,
  },
  descricao: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.chip,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontFamily: 'PublicSans_400Regular',
    fontSize: Typography.bodyLg.fontSize,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
