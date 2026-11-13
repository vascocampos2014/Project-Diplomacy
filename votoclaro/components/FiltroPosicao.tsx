import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LinhaOpcoes } from '@/components/LinhaOpcoes';

import { Chip } from '@/components/ui';
import { ROTULO } from '@/components/VotoIndicator';
import { Spacing } from '@/constants/Spacing';
import type { Posicao } from '@/types';

const POSICOES: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];

export function FiltroPosicao({ selecionado, onSelecionar }: { selecionado: Posicao | null; onSelecionar: (p: Posicao | null) => void }) {
  return (
    <View style={styles.linha}>
      <LinhaOpcoes>
      <Chip label="Todas" selecionado={selecionado === null} onPress={() => onSelecionar(null)} />
      {POSICOES.map((p) => (
        <Chip
          key={p}
          label={ROTULO[p]}
          selecionado={selecionado === p}
          onPress={() => onSelecionar(selecionado === p ? null : p)}
          accessibilityLabel={`Mostrar votações: ${ROTULO[p]}`}
        />
      ))}
      </LinhaOpcoes>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    paddingBottom: Spacing.sm,
  },
});
