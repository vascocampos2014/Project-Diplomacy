// Contagem (91 a favor · 79 contra · 60 abstenção) e carimbo de resultado.
// Ver DESIGN.md › Boletim.
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { coresPosicao, ROTULO } from '@/components/VotoIndicator';
import { Radii, Spacing } from '@/constants/Spacing';
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
          <Numero key={posicao} posicao={posicao} n={n} />
        ))}
    </View>
  );
}

function Numero({ posicao, n }: { posicao: Posicao; n: number }) {
  const cores = useCores();
  const c = coresPosicao(cores, posicao);
  return (
    <View style={styles.numero} accessible accessibilityLabel={`${n} ${ROTULO[posicao].toLowerCase()}`}>
      <Text style={[styles.valor, { color: n > 0 ? c.tinta : cores.textMuted }]}>{n}</Text>
      <Text style={[styles.legenda, { color: cores.textMuted }]}>{ROTULO[posicao].toLowerCase()}</Text>
    </View>
  );
}

const RESULTADO: Record<Resultado, { label: string; icone: keyof typeof MaterialIcons.glyphMap }> = {
  aprovada: { label: 'Aprovada', icone: 'check' },
  chumbada: { label: 'Chumbada', icone: 'close' },
  pendente: { label: 'Pendente', icone: 'schedule' },
};

// O carimbo: caixa reta, a caneta para "aprovada", tinta para "chumbada".
export function ResultadoBadge({ resultado }: { resultado: Resultado }) {
  const cores = useCores();
  const r = RESULTADO[resultado];
  const cheio = resultado === 'aprovada';
  const cor = resultado === 'aprovada' ? cores.tint : resultado === 'chumbada' ? cores.text : cores.textMuted;
  return (
    <View style={[styles.carimbo, { borderColor: cor, backgroundColor: cheio ? cor : 'transparent' }]}>
      <MaterialIcons name={r.icone} size={14} color={cheio ? cores.onTint : cor} />
      <Text style={[styles.carimboTexto, { color: cheio ? cores.onTint : cor }]}>{r.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.lg,
    rowGap: 2,
  },
  numero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valor: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  legenda: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  carimbo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderRadius: Radii.badge,
  },
  carimboTexto: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
