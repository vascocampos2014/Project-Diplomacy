import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VotoIndicator } from '@/components/VotoIndicator';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { hexToRgba, iniciais } from '@/lib/format';
import type { Posicao } from '@/types';

interface DeputadoRowProps {
  nome: string;
  partido: string;
  circulo: string;
  fotoUrl?: string;
  posicao?: Posicao;
  onPress?: () => void;
}

export function DeputadoRow({ nome, partido, circulo, fotoUrl, posicao, onPress }: DeputadoRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const corPartido = getCorPartido(partido);

  const conteudo = (
    <View style={styles.row}>
      <Avatar nome={nome} fotoUrl={fotoUrl} corPartido={corPartido} />
      <View style={styles.info}>
        <Text style={[styles.nome, { color: colors.text }]} numberOfLines={1}>
          {nome}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.partido, { color: corPartido }]}>{partido}</Text>
          <Text style={[Typography.caption, { color: colors.tabIconDefault }]}>· {circulo}</Text>
        </View>
      </View>
      {posicao && <VotoIndicator posicao={posicao} />}
    </View>
  );

  if (!onPress) {
    return conteudo;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nome}, ${partido}, ${circulo}`}
      accessibilityHint="Abre o perfil do deputado"
    >
      {conteudo}
    </TouchableOpacity>
  );
}

function Avatar({ nome, fotoUrl, corPartido }: { nome: string; fotoUrl?: string; corPartido: string }) {
  if (fotoUrl) {
    return <Image source={{ uri: fotoUrl }} style={styles.avatar} resizeMode="cover" accessible={false} />;
  }
  return (
    <View
      style={[styles.avatar, styles.avatarFallback, { backgroundColor: hexToRgba(corPartido, 0.18) }]}
      accessible={false}
    >
      <Text style={[styles.avatarIniciais, { color: corPartido }]}>{iniciais(nome)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.badge,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIniciais: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 15,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
  nome: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: Typography.bodyLg.fontSize,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: Spacing.xs,
  },
  partido: {
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
