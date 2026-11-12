// Escala tipográfica VotoClaro — ver .claude/DESIGN.md (Inter em toda a app)
import type { TextStyle } from 'react-native';

export const Fonts = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_900Black',
};

export const Typography = {
  displayLg: {
    fontFamily: Fonts.black,
    fontWeight: '900',
    fontSize: 34,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  displaySm: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: -0.3,
    lineHeight: 31,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 21,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 13,
  },
  eyebrow: {
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  data: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;
