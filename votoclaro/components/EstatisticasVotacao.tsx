import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import type { Posicao } from '@/types';

interface EstatisticasVotacaoProps {
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
}

const ORDEM: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];

const LABELS: Record<Posicao, string> = {
  favor: 'Favor',
  contra: 'Contra',
  abstencao: 'Abstenção',
  ausente: 'Ausente',
};

export function EstatisticasVotacao({ favor, contra, abstencao, ausentes }: EstatisticasVotacaoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const valores: Record<Posicao, number> = { favor, contra, abstencao, ausente: ausentes };
  const total = favor + contra + abstencao + ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {ORDEM.map((posicao, index) => (
        <View
          key={posicao}
          style={[styles.celula, index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border }]}
        >
          <Text style={[Typography.label, styles.label, { color: colors[posicao] }]} numberOfLines={1} adjustsFontSizeToFit>
            {LABELS[posicao].toUpperCase()}
          </Text>
          <Text style={[Typography.data, styles.valor, { color: colors[posicao] }]}>{valores[posicao]}</Text>
          <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>{pct(valores[posicao]).toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  celula: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valor: {
    marginBottom: 2,
  },
});
