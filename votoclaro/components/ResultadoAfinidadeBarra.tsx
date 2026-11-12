import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

interface ResultadoAfinidadeBarraProps {
  partido: string;
  pontuacao: number;
}

export function ResultadoAfinidadeBarra({ partido, pontuacao }: ResultadoAfinidadeBarraProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const cor = getCorPartido(partido);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[Typography.label, { color: colors.text }]}>{partido}</Text>
        <Text style={[Typography.label, { color: colors.tabIconDefault }]}>{pontuacao}%</Text>
      </View>
      <View style={[styles.trilho, { backgroundColor: colors.border }]}>
        <View style={[styles.barra, { width: `${pontuacao}%`, backgroundColor: cor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  trilho: {
    height: 10,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
  },
});
