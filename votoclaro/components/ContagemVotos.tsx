// Pills de contagem (✓ 132 ✗ 58 — 12 · 28) e badge de resultado — ver DESIGN.md › VotacaoCard
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { coresPosicao, ROTULO, SIMBOLO } from '@/components/VotoIndicator';
import { Radii } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';
import type { Posicao, Resultado } from '@/types';

export function ContagemVotos({
  favor,
  contra,
  abstencao,
  ausentes,
}: {
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
}) {
  const valores: [Posicao, number][] = [
    ['favor', favor],
    ['contra', contra],
    ['abstencao', abstencao],
    ['ausente', ausentes],
  ];
  return (
    <View style={styles.linha}>
      {valores
        .filter(([posicao, n]) => n > 0 || posicao !== 'ausente')
        .map(([posicao, n]) => (
          <PillContagem key={posicao} posicao={posicao} n={n} />
        ))}
    </View>
  );
}

function PillContagem({ posicao, n }: { posicao: Posicao; n: number }) {
  const c = coresPosicao(useCores(), posicao);
  return (
    <View
      style={[styles.pill, { backgroundColor: c.fundo }]}
      accessible
      accessibilityLabel={`${n} ${ROTULO[posicao].toLowerCase()}`}
    >
      <Text style={[styles.pillTexto, { color: c.tinta }]}>
        {SIMBOLO[posicao]} {n}
      </Text>
    </View>
  );
}

const RESULTADO: Record<Resultado, { label: string; posicao: Posicao }> = {
  aprovada: { label: 'Aprovada', posicao: 'favor' },
  chumbada: { label: 'Chumbada', posicao: 'contra' },
  pendente: { label: 'Pendente', posicao: 'abstencao' },
};

export function ResultadoBadge({ resultado }: { resultado: Resultado }) {
  const r = RESULTADO[resultado];
  const c = coresPosicao(useCores(), r.posicao);
  return (
    <View style={[styles.pill, styles.badge, { backgroundColor: c.fundo }]}>
      <View style={[styles.ponto, { backgroundColor: c.cheia }]} />
      <Text style={[styles.pillTexto, { color: c.tinta }]}>{r.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  pillTexto: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ponto: {
    width: 7,
    height: 7,
    borderRadius: Radii.pill,
  },
});
