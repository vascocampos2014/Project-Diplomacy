import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useThemeStore, type ThemeOverride } from '@/store/themeStore';

const OPCOES: { valor: ThemeOverride; label: string; icone: keyof typeof MaterialIcons.glyphMap }[] = [
  { valor: null, label: 'Sistema', icone: 'brightness-auto' },
  { valor: 'light', label: 'Claro', icone: 'light-mode' },
  { valor: 'dark', label: 'Escuro', icone: 'dark-mode' },
];

export function ThemeToggle() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const override = useThemeStore((state) => state.override);
  const setOverride = useThemeStore((state) => state.setOverride);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {OPCOES.map((opcao) => {
        const selecionado = override === opcao.valor;
        return (
          <TouchableOpacity
            key={opcao.label}
            style={[styles.opcao, selecionado && { backgroundColor: colors.tint }]}
            onPress={() => setOverride(opcao.valor)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Tema ${opcao.label}`}
            accessibilityState={{ selected: selecionado }}
          >
            <MaterialIcons name={opcao.icone} size={18} color={selecionado ? colors.background : colors.tabIconDefault} />
            <Text style={[Typography.label, styles.opcaoLabel, { color: selecionado ? colors.background : colors.text }]}>
              {opcao.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radii.badge,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
  },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.badge,
  },
  opcaoLabel: {
    fontFamily: 'PublicSans_600SemiBold',
  },
});
