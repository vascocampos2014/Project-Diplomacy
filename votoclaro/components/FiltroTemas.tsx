import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';

interface FiltroTemasProps {
  temas: string[];
  selecionado: string | null;
  onSelecionar: (tema: string | null) => void;
}

export function FiltroTemas({ temas, selecionado, onSelecionar }: FiltroTemasProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linha}>
      <Chip label="Todos" selecionado={selecionado === null} onPress={() => onSelecionar(null)} />
      {temas.map((tema) => (
        <Chip
          key={tema}
          label={tema}
          selecionado={selecionado === tema}
          onPress={() => onSelecionar(selecionado === tema ? null : tema)}
          accessibilityLabel={`Filtrar por ${tema}`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
