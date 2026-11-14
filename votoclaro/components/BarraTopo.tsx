// Barra do topo: logótipo + (no computador) a navegação em texto.
// Blue Bell marca só onde estás: o separador ativo.
import { MaterialIcons } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuTresPontos } from '@/components/MenuTresPontos';
import { useCores } from '@/components/ui';
import { LARGURA_DESKTOP, MAX_WIDTH, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';

export const SEPARADORES = [
  { rota: '/', nome: 'Votações' },
  { rota: '/deputados', nome: 'Deputados' },
  { rota: '/perguntar', nome: 'Perguntar' },
  { rota: '/comparar', nome: 'Comparar' },
] as const;

const ICONE = require('@/assets/brand/logo-icon-96.png');

export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  const cores = useCores();
  return (
    <View style={styles.marca} accessible accessibilityRole="header" accessibilityLabel="VotoClaro">
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
  const pathname = usePathname();
  const desktop = width >= LARGURA_DESKTOP;

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

        {desktop ? (
          <View style={styles.nav} role="navigation" aria-label="Principal">
            {SEPARADORES.map((s) => {
              const ativo = s.rota === '/' ? pathname === '/' : pathname.startsWith(s.rota);
              return (
                <Link
                  key={s.rota}
                  href={s.rota}
                  accessibilityRole="link"
                  aria-current={ativo ? 'page' : undefined}
                  style={[styles.navItem, { borderBottomColor: ativo ? cores.marcador : 'transparent' }]}
                >
                  <Text style={[styles.navTexto, { color: ativo ? cores.text : cores.textMuted }, ativo && styles.navAtivo]}>{s.nome}</Text>
                </Link>
              );
            })}
          </View>
        ) : (
          <View style={styles.espaco} />
        )}

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
    maxWidth: MAX_WIDTH + Spacing.lg * 2,
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
  nav: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xl,
  },
  navItem: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    borderBottomWidth: 3,
    paddingTop: 3,
  },
  navTexto: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  navAtivo: {
    fontFamily: Fonts.semibold,
  },
  espaco: {
    flex: 1,
  },
});
