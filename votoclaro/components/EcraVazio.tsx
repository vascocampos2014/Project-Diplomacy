import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
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

export function EcraVazio({ icone, titulo, descricao, accao }: EcraVazioProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <MaterialIcons name={icone} size={32} color={colors.tabIconDefault} accessible={false} />
      <Text style={[Typography.displaySm, styles.titulo, { color: colors.text }]}>{titulo}</Text>
      <Text style={[Typography.bodySm, styles.descricao, { color: colors.tabIconDefault }]} numberOfLines={2}>
        {descricao}
      </Text>
      {accao && (
        <TouchableOpacity
          style={[styles.botao, { borderColor: colors.tint }]}
          onPress={accao.onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={accao.label}
        >
          <Text style={[Typography.label, { color: colors.tint }]}>{accao.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.huge,
  },
  titulo: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  descricao: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  botao: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radii.badge,
  },
});
