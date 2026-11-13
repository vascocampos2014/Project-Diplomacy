// Escolha do tema: três opções do boletim (Sistema / Claro / Escuro).
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';
import { useThemeStore, type ThemeOverride } from '@/store/themeStore';

const OPCOES: { valor: ThemeOverride; label: string }[] = [
  { valor: null, label: 'Sistema' },
  { valor: 'light', label: 'Claro' },
  { valor: 'dark', label: 'Escuro' },
];

export function ThemeToggle() {
  const override = useThemeStore((state) => state.override);
  const setOverride = useThemeStore((state) => state.setOverride);

  return (
    <View style={styles.linha} accessibilityRole="radiogroup" accessibilityLabel="Tema">
      {OPCOES.map((opcao) => (
        <Chip
          key={opcao.label}
          label={opcao.label}
          selecionado={override === opcao.valor}
          onPress={() => setOverride(opcao.valor)}
          accessibilityLabel={`Tema ${opcao.label}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
