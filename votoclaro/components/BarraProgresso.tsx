// Barra Favor/Contra/Abstenção/Ausente. Movimento só ao revelar (DESIGN.md › Motion),
// e nenhum com "reduzir movimento" ativo.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

import { useCores } from '@/components/ui';
import { Radii } from '@/constants/Spacing';

interface BarraProgressoProps {
  // percentagens; o resto até 100 é ausente
  favor: number;
  contra: number;
  abstencao: number;
  height?: number;
  animated?: boolean;
}

export function BarraProgresso({ favor, contra, abstencao, height = 8, animated = true }: BarraProgressoProps) {
  const cores = useCores();
  const ausente = Math.max(0, 100 - favor - contra - abstencao);
  const [reduzir, setReduzir] = useState(false);
  const progresso = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((r) => ativo && setReduzir(!!r))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!animated || reduzir) {
      progresso.setValue(1);
      return;
    }
    Animated.timing(progresso, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [animated, reduzir, progresso]);

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
      <Animated.View
        style={[
          styles.preenchimento,
          { width: progresso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      >
        {partes.map((p, i) => (
          <View key={i} style={{ flex: p.valor, backgroundColor: p.cor }} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radii.pill,
  },
  preenchimento: {
    flexDirection: 'row',
    height: '100%',
    gap: 2,
  },
});
