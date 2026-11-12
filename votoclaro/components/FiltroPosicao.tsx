import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import { ROTULO, SIMBOLO } from '@/components/VotoIndicator';
import { Spacing } from '@/constants/Spacing';
import type { Posicao } from '@/types';

const POSICOES: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];

export function FiltroPosicao({ selecionado, onSelecionar }: { selecionado: Posicao | null; onSelecionar: (p: Posicao | null) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linha}>
      <Chip label="Todas" selecionado={selecionado === null} onPress={() => onSelecionar(null)} />
      {POSICOES.map((p) => (
        <Chip
          key={p}
          label={`${SIMBOLO[p]} ${ROTULO[p]}`}
          selecionado={selecionado === p}
          onPress={() => onSelecionar(selecionado === p ? null : p)}
          accessibilityLabel={`Mostrar votações: ${ROTULO[p]}`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
