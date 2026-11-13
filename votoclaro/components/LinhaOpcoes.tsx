// Uma linha de opções do boletim (filtros). No telemóvel desliza na
// horizontal; no computador as opções quebram em linhas, para nenhuma ficar
// cortada na margem.
import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { LARGURA_DESKTOP, Spacing } from '@/constants/Spacing';

export function LinhaOpcoes({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (width >= LARGURA_DESKTOP) return <View style={[styles.linha, styles.quebra]}>{children}</View>;
  return (
    // Sangra até à borda do ecrã: a opção cortada fica na margem do telemóvel,
    // não a meio da coluna, e lê-se como "desliza para ver mais".
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sangria} contentContainerStyle={[styles.linha, styles.sangriaConteudo]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  sangria: {
    marginHorizontal: -Spacing.lg,
  },
  sangriaConteudo: {
    paddingHorizontal: Spacing.lg,
  },
  quebra: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
