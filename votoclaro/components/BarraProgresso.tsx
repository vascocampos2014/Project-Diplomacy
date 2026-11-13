// Barra favor/contra/abstenção/ausente, sempre à mesma escala (230 lugares),
// para que duas votações se comparem a olho. Sem animação: os números são
// o conteúdo, não o movimento.
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useCores } from '@/components/ui';

interface BarraProgressoProps {
  // percentagens; o resto até 100 é ausente
  favor: number;
  contra: number;
  abstencao: number;
  height?: number;
  animated?: boolean; // mantido por compatibilidade; ignorado
}

export function BarraProgresso({ favor, contra, abstencao, height = 6 }: BarraProgressoProps) {
  const cores = useCores();
  const ausente = Math.max(0, 100 - favor - contra - abstencao);
  const partes = [
    { valor: favor, cor: cores.favor },
    { valor: contra, cor: cores.contra },
    { valor: abstencao, cor: cores.abstencao },
    { valor: ausente, cor: cores.border },
  ].filter((p) => p.valor > 0);

  return (
    <View
      style={[styles.trilho, { height, backgroundColor: cores.border }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${Math.round(favor)}% a favor, ${Math.round(contra)}% contra, ${Math.round(abstencao)}% abstenção`}
    >
      {partes.map((p, i) => (
        <View key={i} style={{ flex: p.valor, backgroundColor: p.cor }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    width: '100%',
    flexDirection: 'row',
    gap: 2,
    overflow: 'hidden',
  },
});
