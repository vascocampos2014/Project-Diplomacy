// Skill VotoIndicator — ver .claude/SKILLS.md. Nunca só cor: símbolo sempre.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { Fonts } from '@/constants/Typography';
import type { Posicao } from '@/types';

export const SIMBOLO: Record<Posicao, string> = { favor: '✓', contra: '✗', abstencao: '—', ausente: '·' };
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
  sm: { caixa: 20, simbolo: 11, raio: 4 },
  md: { caixa: 28, simbolo: 15, raio: 6 },
  lg: { caixa: 40, simbolo: 20, raio: 8 },
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
      <View style={[styles.caixa, { width: t.caixa, height: t.caixa, borderRadius: t.raio, backgroundColor: c.fundo }]}>
        <Text style={[styles.simbolo, { fontSize: t.simbolo, color: c.tinta }]}>{SIMBOLO[posicao]}</Text>
      </View>
      {showLabel ? <Text style={[styles.rotulo, { color: c.tinta }]}>{ROTULO[posicao]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  simbolo: {
    fontFamily: Fonts.bold,
    lineHeight: undefined,
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
});
