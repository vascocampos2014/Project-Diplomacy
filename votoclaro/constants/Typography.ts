// Escala tipográfica VotoClaro — ver .claude/DESIGN.md
import type { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: 'Newsreader_700Bold',
    fontWeight: '700',
    fontSize: 40,
    letterSpacing: -0.2,
    lineHeight: 44,
  },
  displaySm: {
    fontFamily: 'Newsreader_600SemiBold',
    fontWeight: '600',
    fontSize: 26,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: 'PublicSans_400Regular',
    fontWeight: '400',
    fontSize: 17,
  },
  bodySm: {
    fontFamily: 'PublicSans_400Regular',
    fontWeight: '400',
    fontSize: 15,
  },
  label: {
    fontFamily: 'PublicSans_600SemiBold',
    fontWeight: '600',
    fontSize: 13,
  },
  caption: {
    fontFamily: 'PublicSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
  },
  data: {
    fontFamily: 'Newsreader_700Bold',
    fontWeight: '700',
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
};
