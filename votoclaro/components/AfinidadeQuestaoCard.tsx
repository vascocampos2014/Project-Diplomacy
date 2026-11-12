import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import type { RespostaAfinidade } from '@/types';

interface AfinidadeQuestaoCardProps {
  tema: string;
  afirmacao: string;
  respostaSelecionada: RespostaAfinidade | null;
  onResponder: (resposta: RespostaAfinidade) => void;
}

const OPCOES: { valor: RespostaAfinidade; label: string }[] = [
  { valor: 'discordo', label: 'Discordo' },
  { valor: 'neutro', label: 'Neutro' },
  { valor: 'concordo', label: 'Concordo' },
];

export function AfinidadeQuestaoCard({
  tema,
  afirmacao,
  respostaSelecionada,
  onResponder,
}: AfinidadeQuestaoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View>
      <Text style={[Typography.label, styles.tema, { color: colors.tabIconDefault }]}>{tema.toUpperCase()}</Text>
      <Text style={[Typography.displaySm, styles.afirmacao, { color: colors.text }]}>{afirmacao}</Text>
      <View style={styles.opcoes}>
        {OPCOES.map(({ valor, label }) => {
          const ativo = respostaSelecionada === valor;
          return (
            <TouchableOpacity
              key={valor}
              style={[
                styles.opcao,
                {
                  backgroundColor: ativo ? colors.tint : 'transparent',
                  borderColor: ativo ? colors.tint : colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onResponder(valor)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: ativo }}
            >
              <Text style={[Typography.label, { color: ativo ? colors.background : colors.text }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tema: {
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  afirmacao: {
    marginBottom: Spacing.xxl,
  },
  opcoes: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  opcao: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.badge,
    paddingVertical: Spacing.md,
  },
});
