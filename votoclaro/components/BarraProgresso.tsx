import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface BarraProgressoProps {
  favor: number;
  contra: number;
  abstencao: number;
  // favor + contra + abstencao + ausentes = 100
  height?: number;
  animated?: boolean;
}

export function BarraProgresso({
  favor,
  contra,
  abstencao,
  height = 8,
  animated = true,
}: BarraProgressoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const ausente = Math.max(0, 100 - favor - contra - abstencao);

  const categorias = [
    { valor: favor, cor: colors.favor },
    { valor: contra, cor: colors.contra },
    { valor: abstencao, cor: colors.abstencao },
    { valor: ausente, cor: colors.border },
  ];

  const animatedValues = useRef(categorias.map(() => new Animated.Value(animated ? 0 : 1))).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel(
      animatedValues.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 400,
          delay: index * 50,
          useNativeDriver: false,
        })
      )
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { height, backgroundColor: colors.border }]}>
      {categorias.map((categoria, index) =>
        categoria.valor > 0 ? (
          <Animated.View
            key={index}
            style={{
              flex: animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.0001, categoria.valor],
              }),
              backgroundColor: categoria.cor,
            }}
          />
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
});
