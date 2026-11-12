import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cartao, Chip, useCores } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import type { RespostaAfinidade } from '@/types';

interface AfinidadeQuestaoCardProps {
  tema: string;
  afirmacao: string;
  respostaSelecionada: RespostaAfinidade | null;
  onResponder: (resposta: RespostaAfinidade) => void;
}

const OPCOES: { valor: RespostaAfinidade; label: string; simbolo: string }[] = [
  { valor: 'concordo', label: 'Concordo', simbolo: '✓' },
  { valor: 'neutro', label: 'Neutro', simbolo: '—' },
  { valor: 'discordo', label: 'Discordo', simbolo: '✗' },
];

export function AfinidadeQuestaoCard({ tema, afirmacao, respostaSelecionada, onResponder }: AfinidadeQuestaoCardProps) {
  const cores = useCores();
  return (
    <Cartao style={styles.cartao}>
      <View style={styles.tema}>
        <Chip label={tema.toUpperCase()} selecionado />
      </View>
      <Text style={[Typography.title, styles.afirmacao, { color: cores.text }]} accessibilityRole="header">
        {afirmacao}
      </Text>
      <View style={styles.opcoes} accessibilityRole="radiogroup">
        {OPCOES.map((o) => {
          const ativa = respostaSelecionada === o.valor;
          return (
            <Pressable
              key={o.valor}
              onPress={() => onResponder(o.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativa }}
              accessibilityLabel={o.label}
              style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.opcao,
                { borderColor: ativa || hovered ? cores.tint : cores.border, backgroundColor: ativa ? cores.tintBg : cores.surface },
                pressed && styles.premido,
              ]}
            >
              <Text style={[styles.simbolo, { color: ativa ? cores.tintInk : cores.textMuted }]}>{o.simbolo}</Text>
              <Text style={[styles.label, { color: ativa ? cores.tintInk : cores.text }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    padding: Spacing.xl,
  },
  tema: {
    flexDirection: 'row',
  },
  afirmacao: {
    marginTop: Spacing.lg,
    fontSize: 21,
    lineHeight: 28,
  },
  opcoes: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 52,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1.5,
    borderRadius: Radii.pill,
  },
  premido: {
    transform: [{ scale: 0.98 }],
  },
  simbolo: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    width: 18,
    textAlign: 'center',
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
});
