import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
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
      <View style={styles.header}>
        <Text style={[Typography.bodySm, styles.descricao, { color: colors.textMuted }]}>
          Termos comuns do processo legislativo, explicados de forma simples.
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Procurar termo"
          placeholderTextColor={colors.textMuted}
          value={pesquisa}
          onChangeText={setPesquisa}
          accessibilityLabel="Procurar termo no glossário"
          accessibilityHint="Filtra a lista por termo ou definição"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={termos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => <GlossarioItem termo={item.termo} definicao={item.definicao} />}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  descricao: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontFamily: 'Inter_400Regular',
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
