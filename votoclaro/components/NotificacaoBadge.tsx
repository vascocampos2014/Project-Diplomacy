import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface NotificacaoBadgeProps {
  count: number;
  max?: number;
}

export function NotificacaoBadge({ count, max = 99 }: NotificacaoBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (count <= 0) return null;

  const label = count > max ? `${max}+` : `${count}`;
  const wide = label.length > 2;
  const accessibilityLabel = count === 1 ? '1 notificação nova' : `${label} notificações novas`;

  return (
    <View
      style={[styles.badge, wide && styles.badgeWide, { backgroundColor: colors.tint }]}
      accessibilityLabel={accessibilityLabel}
      accessible
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeWide: {
    minWidth: 20,
    borderRadius: 10,
  },
  text: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
