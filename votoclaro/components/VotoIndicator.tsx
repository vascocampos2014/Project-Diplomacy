// Indicador de posição — ver .claude/DESIGN.md. Nunca só cor: ícone sempre.
// Uma caixa quadrada do boletim, com o ícone da posição desenhado dentro.
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { Radii } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';
import type { Posicao } from '@/types';

export const ICONE: Record<Posicao, keyof typeof MaterialIcons.glyphMap> = {
  favor: 'check',
  contra: 'close',
  abstencao: 'remove',
  ausente: 'more-horiz',
};
export const ROTULO: Record<Posicao, string> = {
  favor: 'A favor',
  contra: 'Contra',
  abstencao: 'Abstenção',
  ausente: 'Ausente',
};
const A11Y: Record<Posicao, string> = {
  favor: 'Voto a favor',
  contra: 'Voto contra',
  abstencao: 'Abstenção',
  ausente: 'Ausente',
};

const TAMANHOS = {
  sm: { caixa: 20, icone: 14 },
  md: { caixa: 26, icone: 18 },
  lg: { caixa: 36, icone: 24 },
};

export function coresPosicao(cores: ReturnType<typeof useCores>, posicao: Posicao) {
  return {
    favor: { fundo: cores.favorBg, tinta: cores.favorInk, cheia: cores.favor },
    contra: { fundo: cores.contraBg, tinta: cores.contraInk, cheia: cores.contra },
    abstencao: { fundo: cores.abstencaoBg, tinta: cores.abstencaoInk, cheia: cores.abstencao },
    ausente: { fundo: cores.ausenteBg, tinta: cores.ausenteInk, cheia: cores.ausente },
  }[posicao];
}

interface VotoIndicatorProps {
  posicao: Posicao;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VotoIndicator({ posicao, size = 'md', showLabel = false }: VotoIndicatorProps) {
  const cores = useCores();
  const c = coresPosicao(cores, posicao);
  const t = TAMANHOS[size];

  return (
    <View style={styles.linha} accessible accessibilityRole="image" accessibilityLabel={A11Y[posicao]}>
      <View style={[styles.caixa, { width: t.caixa, height: t.caixa, backgroundColor: c.fundo, borderColor: c.tinta }]}>
        <MaterialIcons name={ICONE[posicao]} size={t.icone} color={c.tinta} />
      </View>
      {showLabel ? <Text style={[styles.rotulo, { color: c.tinta }]}>{ROTULO[posicao]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.badge,
    borderWidth: 1,
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
});
