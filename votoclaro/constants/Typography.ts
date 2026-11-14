// Escala tipográfica VotoClaro — ver .claude/DESIGN.md
// Uma só família, Public Sans: um tipo de trabalho, neutro e muito legível,
// com algarismos tabulares para as contagens. A hierarquia vem do peso e do
// tamanho, nunca de etiquetas por cima dos títulos.
import type { TextStyle } from 'react-native';

export const Fonts = {
  regular: 'PublicSans_400Regular',
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
  black: 'PublicSans_800ExtraBold',
};

export const Typography = {
  // Manchete: o título de uma votação em destaque, em azul ultramarino.
  manchete: {
    fontFamily: Fonts.black,
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  displayLg: {
    fontFamily: Fonts.black,
    fontWeight: '800',
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  displaySm: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.15,
    lineHeight: 21,
  },
  bodyLg: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 26,
  },
  bodySm: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 14,
  },
  // Texto pequeno em maiúsculas: só para o carimbo do resultado.
  eyebrow: {
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
  },
  data: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;
