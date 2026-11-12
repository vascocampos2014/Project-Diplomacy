import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Fonts } from '@/constants/Typography';
import { hexToRgba, iniciais } from '@/lib/format';

// Foto circular com fallback de iniciais na cor do partido.
export function Avatar({ nome, fotoUrl, partido, size = 36 }: { nome: string; fotoUrl?: string; partido: string; size?: number }) {
  const [erro, setErro] = useState(false);
  const cores = useCores();
  const cor = getCorPartido(partido);
  const caixa = { width: size, height: size, borderRadius: size / 2 };

  if (!fotoUrl || erro) {
    return (
      <View style={[styles.fallback, caixa, { backgroundColor: hexToRgba(cor, 0.15) }]} accessible={false}>
        <Text style={[styles.iniciais, { color: cores.text, fontSize: size * 0.38 }]}>{iniciais(nome)}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: fotoUrl }}
      style={[caixa, { backgroundColor: hexToRgba(cor, 0.15) }]}
      resizeMode="cover"
      onError={() => setErro(true)}
      accessible={false}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    fontFamily: Fonts.bold,
  },
});
