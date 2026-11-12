// 4 células tingidas — ver DESIGN.md › EstatisticasVotacao
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { coresPosicao, ROTULO } from '@/components/VotoIndicator';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import type { Posicao } from '@/types';

interface EstatisticasVotacaoProps {
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
}

export function EstatisticasVotacao({ favor, contra, abstencao, ausentes }: EstatisticasVotacaoProps) {
  const total = favor + contra + abstencao + ausentes;
  const celulas: [Posicao, number][] = [
    ['favor', favor],
    ['contra', contra],
    ['abstencao', abstencao],
    ['ausente', ausentes],
  ];
  return (
    <View style={styles.grelha}>
      {celulas.map(([posicao, n]) => (
        <Celula key={posicao} posicao={posicao} n={n} pct={total > 0 ? (n / total) * 100 : 0} />
      ))}
    </View>
  );
}

function Celula({ posicao, n, pct }: { posicao: Posicao; n: number; pct: number }) {
  const cores = useCores();
  const c = coresPosicao(cores, posicao);
  const label = posicao === 'abstencao' ? 'Absten.' : ROTULO[posicao];
  return (
    <View
      style={[styles.celula, { backgroundColor: c.fundo }]}
      accessible
      accessibilityLabel={`${ROTULO[posicao]}: ${n} votos, ${pct.toFixed(1)}%`}
    >
      <Text style={[Typography.eyebrow, { color: c.tinta }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[Typography.data, styles.numero, { color: c.tinta }]}>{n}</Text>
      <Text style={[Typography.caption, { color: cores.textMuted }]}>{pct.toFixed(1)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grelha: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  celula: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.chip,
  },
  numero: {
    marginVertical: 2,
    fontSize: 24,
  },
});
