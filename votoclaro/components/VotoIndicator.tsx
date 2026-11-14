// Indicador de posição — ver .claude/DESIGN.md. Nunca só cor: textura e palavra.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Amostra } from '@/components/Amostra';
import { useCores } from '@/components/ui';
import { Fonts } from '@/constants/Typography';
import type { Posicao } from '@/types';

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

const TAMANHOS = { sm: 12, md: 14, lg: 18 };

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

// A amostra de tinta (cheia / tracejada / vazia / cinzenta) com a palavra ao lado:
// o mesmo código do hemiciclo, para não haver dois sistemas de sinais.
export function VotoIndicator({ posicao, size = 'md', showLabel = true }: VotoIndicatorProps) {
  const cores = useCores();
  const c = coresPosicao(cores, posicao);

  return (
    <View style={styles.linha} accessible accessibilityRole="image" accessibilityLabel={A11Y[posicao]}>
      <Amostra posicao={posicao} tamanho={TAMANHOS[size]} />
      {showLabel ? (
        <Text style={[styles.rotulo, size === 'sm' && styles.rotuloSm, { color: c.tinta }]}>{ROTULO[posicao]}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  rotuloSm: {
    fontSize: 12,
  },
});
