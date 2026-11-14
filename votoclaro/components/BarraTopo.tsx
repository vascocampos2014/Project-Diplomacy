// Barra do topo no telemóvel: logótipo e o menu ⋮ (a navegação é a cápsula de
// baixo). No computador é a BarraComputador, um painel de azulejo com menus.
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraComputador } from '@/components/BarraComputador';
import { MenuTresPontos } from '@/components/MenuTresPontos';
import { useCores } from '@/components/ui';
import { LARGURA_DESKTOP, MAX_WIDTH_LARGO, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';

const ICONE = require('@/assets/brand/logo-icon-96.png');

export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  const cores = useCores();
  return (
    <View style={styles.marca} accessible accessibilityRole="image" accessibilityLabel="VotoClaro">
      <Image source={ICONE} style={{ width: tamanho, height: tamanho }} accessibilityIgnoresInvertColors />
      <Text style={[styles.palavra, { color: cores.text }]}>
        <Text style={styles.voto}>Voto</Text>Claro
      </Text>
    </View>
  );
}

// `voltar` mostra a seta de voltar (ecrãs de detalhe). Quem chega por uma
// ligação partilhada não tem para onde voltar: a seta leva às votações.
export function BarraTopo({ voltar = false }: { voltar?: boolean }) {
  const cores = useCores();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = width >= LARGURA_DESKTOP;

  // No computador: o painel de azulejo com menus (BarraComputador).
  if (desktop) return <BarraComputador voltar={voltar} />;

  return (
    <View style={[styles.barra, { paddingTop: insets.top, backgroundColor: cores.surface, borderBottomColor: cores.border }]}>
      <View style={styles.interior}>
        {voltar ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            style={styles.voltar}
          >
            <MaterialIcons name="arrow-back" size={22} color={cores.tintInk} />
          </Pressable>
        ) : null}
        <Link href="/" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="VotoClaro, início" style={styles.marcaLigacao}>
            <Marca />
          </Pressable>
        </Link>

        <View style={styles.espaco} />

        <MenuTresPontos />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  interior: {
    width: '100%',
    // A barra alinha com a página larga do computador (no telemóvel não há limite).
    maxWidth: MAX_WIDTH_LARGO + Spacing.lg * 2,
    alignSelf: 'center',
    height: 56,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  voltar: {
    width: 40,
    height: 40,
    marginLeft: -Spacing.sm,
    marginRight: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaLigacao: {
    minHeight: 44,
    justifyContent: 'center',
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  palavra: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  voto: {
    fontFamily: Fonts.black,
  },
  espaco: {
    flex: 1,
  },
});
