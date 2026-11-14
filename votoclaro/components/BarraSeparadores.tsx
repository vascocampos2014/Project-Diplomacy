// Barra de separadores de baixo (telemóvel) — ver .claude/DESIGN.md › Navegação.
// Uma cápsula a flutuar sobre o conteúdo, com papel fosco por trás (o conteúdo
// passa por baixo e continua legível) e uma pílula azul suave que desliza para o
// separador ativo. Sem sombra: a elevação é a linha fina, como nos cartões.
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCores } from '@/components/ui';
import { LARGURA_DESKTOP, Motion, Radii, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';

const ALTURA = 68;
const FOLGA = 6; // entre a cápsula e a pílula ativa
const MARGEM_BAIXO = Spacing.md;

export const ICONES: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'how-to-vote',
  deputados: 'people-outline',
  perguntar: 'chat-bubble-outline',
  comparar: 'compare-arrows',
};

// Quanto espaço os ecrãs deixam no fundo para a barra não tapar o último item.
// No computador não há barra (a navegação está no topo), por isso devolve 0.
export function useEspacoBarra(): number {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  if (width >= LARGURA_DESKTOP) return 0;
  return ALTURA + MARGEM_BAIXO + insets.bottom + Spacing.lg;
}

// Papel fosco só na web, onde o conteúdo passa por baixo com blur nativo do
// browser; no nativo a cápsula é papel sólido.
const fosco = (cor: string): object =>
  Platform.OS === 'web'
    ? { backgroundColor: `${cor}D9`, backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)' }
    : { backgroundColor: cor };

export function BarraSeparadores({ state, descriptors, navigation }: BottomTabBarProps) {
  const cores = useCores();
  const insets = useSafeAreaInsets();
  const reduzir = useReducedMotion();
  const [largura, setLargura] = useState(0);
  const n = state.routes.length;
  const passo = largura > 0 ? (largura - FOLGA * 2) / n : 0;

  const pilula = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(state.index * passo, {
          duration: reduzir || passo === 0 ? 0 : Motion.fast,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
      },
    ],
  }));

  return (
    <View style={[styles.zona, { bottom: insets.bottom + MARGEM_BAIXO, pointerEvents: 'box-none' }]}>
      <View
        style={[styles.capsula, fosco(cores.surface), { borderColor: cores.border }]}
        onLayout={(e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width)}
        accessibilityRole="tablist"
      >
        {passo > 0 ? (
          <Animated.View style={[styles.pilula, { width: passo, backgroundColor: cores.tintBg }, pilula]} />
        ) : null}
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key];
          const ativo = state.index === i;
          const cor = ativo ? cores.tintInk : cores.tabIconDefault;
          const titulo = typeof options.title === 'string' ? options.title : route.name;

          const carregar = () => {
            const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!ativo && !evento.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={carregar}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              aria-selected={ativo}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? titulo}
              style={({ pressed }) => [styles.item, pressed && !ativo && styles.premido]}
            >
              <MaterialIcons name={ICONES[route.name] ?? 'circle'} size={24} color={cor} />
              <Text style={[styles.rotulo, { color: cor }, ativo && styles.rotuloAtivo]} numberOfLines={1}>
                {titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zona: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
  },
  capsula: {
    width: '100%',
    maxWidth: 440,
    height: ALTURA,
    flexDirection: 'row',
    padding: FOLGA,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pilula: {
    position: 'absolute',
    top: FOLGA,
    bottom: FOLGA,
    left: FOLGA,
    borderRadius: Radii.pill,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: Radii.pill,
  },
  premido: {
    opacity: 0.6,
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  rotuloAtivo: {
    fontFamily: Fonts.bold,
  },
});
