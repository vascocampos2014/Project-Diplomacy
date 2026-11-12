import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BarraProgresso } from '@/components/BarraProgresso';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import type { Resultado } from '@/types';

interface VotacaoCardProps {
  titulo: string;
  referencia?: string;
  tema: string;
  data: string;
  resultado: Resultado;
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
  onPress: () => void;
}

const RESULTADO_LABELS: Record<Resultado, string> = {
  aprovada: 'Aprovada',
  chumbada: 'Chumbada',
  pendente: 'Pendente',
};

export function VotacaoCard({
  titulo,
  referencia,
  tema,
  data,
  resultado,
  favor,
  contra,
  abstencao,
  ausentes,
  onPress,
}: VotacaoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const total = favor + contra + abstencao + ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const resultadoColor =
    resultado === 'aprovada' ? colors.favor : resultado === 'chumbada' ? colors.contra : colors.abstencao;
  const accentColor = resultado === 'pendente' ? colors.border : resultadoColor;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accentColor, borderBottomColor: colors.border }]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${referencia ? `${referencia}, ` : ''}${tema}, ${data}, ${RESULTADO_LABELS[resultado]}`}
      accessibilityHint="Abre o detalhe da votação"
    >
      <View style={styles.headerRow}>
        <Text style={[Typography.label, styles.tema, { color: colors.tabIconDefault }]}>{tema.toUpperCase()}</Text>
        <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>{data}</Text>
      </View>

      <Text style={[Typography.displaySm, styles.titulo, { color: colors.text }]} numberOfLines={2}>
        {titulo}
      </Text>

      {referencia ? (
        <Text style={[Typography.caption, styles.referencia, { color: colors.tabIconDefault }]} numberOfLines={1}>
          {referencia}
        </Text>
      ) : null}

      <View style={styles.barraWrapper}>
        <BarraProgresso favor={pct(favor)} contra={pct(contra)} abstencao={pct(abstencao)} animated={false} />
      </View>

      <View style={styles.footerRow}>
        <Text style={[Typography.label, { color: resultadoColor }]}>{RESULTADO_LABELS[resultado].toUpperCase()}</Text>
        {total > 0 && (
          <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>{total} votos totais</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tema: {
    letterSpacing: 0.5,
  },
  titulo: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  referencia: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  barraWrapper: {
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
