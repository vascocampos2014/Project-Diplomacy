import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao, useCores } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

interface EcraVazioProps {
  icone: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descricao: string;
  accao?: {
    label: string;
    onPress: () => void;
  };
}

// Erro útil e ecrã vazio = convite (DESIGN.md › Tom de voz).
export function EcraVazio({ icone, titulo, descricao, accao }: EcraVazioProps) {
  const cores = useCores();
  return (
    <View style={styles.container}>
      {/* Um boletim em branco: a caixa por marcar, com o ícone do motivo. */}
      <View style={[styles.icone, { borderColor: cores.rule }]}>
        <MaterialIcons name={icone} size={22} color={cores.textMuted} accessible={false} />
      </View>
      <Text style={[Typography.title, styles.titulo, { color: cores.text }]} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={[Typography.bodySm, styles.descricao, { color: cores.textMuted }]}>{descricao}</Text>
      {accao ? <Botao label={accao.label} onPress={accao.onPress} variante="secundario" style={styles.botao} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xxl,
  },
  icone: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderRadius: Radii.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  descricao: {
    marginTop: Spacing.xs,
    textAlign: 'center',
    maxWidth: 360,
  },
  botao: {
    marginTop: Spacing.xl,
  },
});
