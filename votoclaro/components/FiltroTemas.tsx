import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

interface FiltroTemasProps {
  temas: string[];
  selecionado: string | null;
  onSelecionar: (tema: string | null) => void;
}

export function FiltroTemas({ temas, selecionado, onSelecionar }: FiltroTemasProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityRole="tablist"
    >
      <Tab label="Todos" ativo={selecionado === null} onPress={() => onSelecionar(null)} colors={colors} />
      {temas.map((tema) => (
        <Tab key={tema} label={tema} ativo={selecionado === tema} onPress={() => onSelecionar(tema)} colors={colors} />
      ))}
    </ScrollView>
  );
}

function Tab({
  label,
  ativo,
  onPress,
  colors,
}: {
  label: string;
  ativo: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, { borderBottomColor: ativo ? colors.tint : 'transparent' }]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="tab"
      accessibilityLabel={`Filtrar por ${label}`}
      accessibilityState={{ selected: ativo }}
    >
      <Text style={[Typography.label, { color: ativo ? colors.tint : colors.tabIconDefault }]}>
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  tab: {
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
  },
});
