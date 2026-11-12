// Peças base da interface — ver .claude/DESIGN.md
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors, { type Paleta } from '@/constants/Colors';
import { MAX_WIDTH, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';

export function useCores(): Paleta {
  return Colors[useColorScheme()];
}

// Limita a largura do conteúdo no web/tablet e centra-o.
export function Contentor({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.contentor, style]}>{children}</View>;
}

export function Cartao({
  children,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const cores = useCores();
  const base = [styles.cartao, { backgroundColor: cores.surface, borderColor: cores.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        base,
        (hovered || pressed) && { borderColor: cores.tint },
        pressed && styles.premido,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  selecionado = false,
  onPress,
  cor,
  accessibilityLabel,
}: {
  label: string;
  selecionado?: boolean;
  onPress?: () => void;
  cor?: string; // ponto colorido à esquerda (cor de partido)
  accessibilityLabel?: string;
}) {
  const cores = useCores();
  const conteudo = (
    <>
      {cor ? <View style={[styles.chipPonto, { backgroundColor: cor }]} /> : null}
      <Text style={[Typography.label, { color: selecionado ? cores.tintInk : cores.text }]}>{label}</Text>
    </>
  );
  const estilo = [
    styles.chip,
    selecionado
      ? { backgroundColor: cores.tintBg, borderColor: cores.tint }
      : { backgroundColor: cores.surface, borderColor: cores.border },
  ];
  if (!onPress) return <View style={estilo}>{conteudo}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilo, pressed && styles.premido]}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={4}
    >
      {conteudo}
    </Pressable>
  );
}

export function Botao({
  label,
  onPress,
  variante = 'primario',
  icone,
  disabled,
  accessibilityHint,
  style,
}: {
  label: string;
  onPress: PressableProps['onPress'];
  variante?: 'primario' | 'secundario';
  icone?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const cores = useCores();
  const primario = variante === 'primario';
  const corTexto = primario ? cores.onTint : cores.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.botao,
        primario
          ? { backgroundColor: cores.tint, borderColor: cores.tint }
          : { backgroundColor: 'transparent', borderColor: cores.border },
        pressed && styles.premido,
        disabled && styles.desativado,
        style,
      ]}
    >
      {icone ? <MaterialIcons name={icone} size={18} color={corTexto} /> : null}
      <Text style={[styles.botaoLabel, { color: corTexto }]}>{label}</Text>
    </Pressable>
  );
}

// Cabeçalho dos ecrãs de topo (tabs): título grande + subtítulo + ação à direita.
export function CabecalhoEcra({
  titulo,
  subtitulo,
  direita,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  direita?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const cores = useCores();
  return (
    <View style={styles.cabecalho}>
      <View style={styles.cabecalhoLinha}>
        <View style={styles.cabecalhoTextos}>
          <Text style={[Typography.displayLg, { color: cores.text }]} accessibilityRole="header">
            {titulo}
          </Text>
          {subtitulo ? (
            <Text style={[Typography.bodySm, styles.cabecalhoSub, { color: cores.textMuted }]}>{subtitulo}</Text>
          ) : null}
        </View>
        {direita}
      </View>
      {children}
    </View>
  );
}

export function TituloSecao({ children, nota }: { children: string; nota?: string }) {
  const cores = useCores();
  return (
    <View style={styles.secao}>
      <Text style={[Typography.title, { color: cores.text }]} accessibilityRole="header">
        {children}
      </Text>
      {nota ? <Text style={[Typography.caption, styles.secaoNota, { color: cores.textMuted }]}>{nota}</Text> : null}
    </View>
  );
}

export function Aviso({ children, icone = 'info-outline' }: { children: string; icone?: keyof typeof MaterialIcons.glyphMap }) {
  const cores = useCores();
  return (
    <View style={[styles.aviso, { backgroundColor: cores.surfaceAlt }]}>
      <MaterialIcons name={icone} size={16} color={cores.textMuted} accessible={false} />
      <Text style={[Typography.caption, styles.avisoTexto, { color: cores.textMuted }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentor: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  cartao: {
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  premido: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  desativado: {
    opacity: 0.45,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  chipPonto: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
  },
  botaoLabel: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  cabecalho: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  cabecalhoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cabecalhoTextos: {
    flex: 1,
  },
  cabecalhoSub: {
    marginTop: Spacing.xs,
  },
  secao: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.md,
  },
  secaoNota: {
    marginTop: 2,
  },
  aviso: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.chip,
    alignItems: 'flex-start',
  },
  avisoTexto: {
    flex: 1,
  },
});
