import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import type { Posicao } from '@/types';

interface VotoIndicatorProps {
  posicao: Posicao;
}

export const LABELS: Record<Posicao, string> = {
  favor: 'Favor',
  contra: 'Contra',
  abstencao: 'Abstenção',
  ausente: 'Ausente',
};

const ACCESSIBILITY_LABELS: Record<Posicao, string> = {
  favor: 'Voto a favor',
  contra: 'Voto contra',
  abstencao: 'Abstenção',
  ausente: 'Ausente',
};

export function VotoIndicator({ posicao }: VotoIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Text
      style={[Typography.label, styles.label, { color: colors[posicao] }]}
      accessibilityLabel={ACCESSIBILITY_LABELS[posicao]}
      accessible
    >
      {LABELS[posicao].toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
