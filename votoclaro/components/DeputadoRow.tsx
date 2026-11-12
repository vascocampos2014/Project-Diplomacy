// Linha de deputado — ver DESIGN.md › DeputadoRow
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { useCores } from '@/components/ui';
import { VotoIndicator } from '@/components/VotoIndicator';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
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
  const cores = useCores();
  const conteudo = (
    <>
      <Avatar nome={nome} fotoUrl={fotoUrl} partido={partido} />
      <View style={styles.info}>
        <Text style={[Typography.bodySm, styles.nome, { color: cores.text }]} numberOfLines={1}>
          {nome}
        </Text>
        <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
          {circulo}
        </Text>
      </View>
      <View style={styles.partidoCaixa}>
        <View style={[styles.ponto, { backgroundColor: getCorPartido(partido) }]} />
        <Text style={[styles.partido, { color: cores.text }]}>{partido}</Text>
      </View>
      {posicao ? <VotoIndicator posicao={posicao} size="sm" /> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={cores.textMuted} accessible={false} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.linha} accessible accessibilityLabel={`${nome}, ${partido}, ${circulo}`}>
        {conteudo}
      </View>
    );
  }
  return (
    <Pressable
      style={({ pressed }) => [styles.linha, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nome}, ${partido}, ${circulo}`}
      accessibilityHint="Abre o perfil do deputado"
    >
      {conteudo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: Fonts.semibold,
  },
  partidoCaixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  partido: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
