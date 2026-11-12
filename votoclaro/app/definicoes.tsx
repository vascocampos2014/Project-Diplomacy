import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

export default function DefinicoesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Definições' }} />
      <View style={styles.secao}>
        <Text style={[Typography.label, styles.secaoLabel, { color: colors.tabIconDefault }]}>APARÊNCIA</Text>
        <ThemeToggle />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secao: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  secaoLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
});
