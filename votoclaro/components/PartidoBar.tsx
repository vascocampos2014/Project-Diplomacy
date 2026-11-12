// Barra de partido — ver DESIGN.md › PartidoBar (cor do partido, nunca texto sobre ela)
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';

export function PartidoBar({ partido, percentagem, legenda }: { partido: string; percentagem: number; legenda: string }) {
  const cores = useCores();
  const cor = getCorPartido(partido);
  return (
    <View style={styles.linha} accessible accessibilityLabel={`${partido}: ${percentagem}% ${legenda}`}>
      <Text style={[styles.sigla, { color: cores.text }]} numberOfLines={1}>
        {partido}
      </Text>
      <View style={[styles.trilho, { backgroundColor: cores.border }]}>
        <View style={[styles.barra, { width: `${Math.max(percentagem, 1)}%`, backgroundColor: cor }]} />
      </View>
      <Text style={[Typography.label, styles.valor, { color: cores.text }]}>{percentagem}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  sigla: {
    width: 64,
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  trilho: {
    flex: 1,
    height: 10,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  valor: {
    width: 44,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
