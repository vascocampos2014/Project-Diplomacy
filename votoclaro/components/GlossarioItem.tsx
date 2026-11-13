import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

interface GlossarioItemProps {
  termo: string;
  definicao: string;
}

export function GlossarioItem({ termo, definicao }: GlossarioItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.termo, { color: colors.text }]}>{termo}</Text>
      <Text style={[Typography.bodySm, styles.definicao, { color: colors.tabIconDefault }]}>{definicao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  termo: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: Typography.bodyLg.fontSize,
    marginBottom: Spacing.xs,
  },
  definicao: {
    lineHeight: 20,
  },
});
