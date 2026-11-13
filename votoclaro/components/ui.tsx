// Peças base da interface — ver .claude/DESIGN.md (mundo: o boletim de voto)
import { MaterialIcons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors, { type Paleta } from '@/constants/Colors';
import { MAX_WIDTH, Motion, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';

export function useCores(): Paleta {
  return Colors[useColorScheme()];
}

// Transição única de estado no web (cor da linha, fundo). No nativo é ignorada.
const transicao = (Platform.OS === 'web'
  ? { transitionProperty: 'border-color, background-color, opacity', transitionDuration: `${Motion.duracao}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  : {}) as ViewStyle;

// Limita a largura do conteúdo no web/tablet e centra-o.
export function Contentor({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.contentor, style]}>{children}</View>;
}

// Um boletim: papel branco, cantos retos, linha a tinta. `tinta` desenha a
// moldura forte do boletim; sem ela fica a linha fina das secções.
// Com `href` é uma ligação a sério (<a> no web: Ctrl/Cmd+clique abre noutro
// separador); com `onPress` é um botão.
export function Cartao({
  children,
  style,
  onPress,
  href,
  tinta = false,
  accessibilityLabel,
  accessibilityHint,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  href?: Href;
  tinta?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const cores = useCores();
  const [ativo, setAtivo] = useState(false);
  const [premido, setPremido] = useState(false);
  const base: StyleProp<ViewStyle>[] = [
    styles.cartao,
    { backgroundColor: cores.surface, borderColor: cores.rule },
    tinta && styles.cartaoTinta,
    style,
  ];
  if (!onPress && !href) return <View style={base}>{children}</View>;
  const pressionavel = (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setAtivo(true)}
      onHoverOut={() => setAtivo(false)}
      onPressIn={() => setPremido(true)}
      onPressOut={() => setPremido(false)}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // Achatado: o Link (asChild) do web não aceita listas de estilos.
      style={StyleSheet.flatten<ViewStyle>([...base, transicao, (ativo || premido) && { borderColor: cores.tint }, premido && styles.premido])}
    >
      {children}
    </Pressable>
  );
  return href ? (
    <Link href={href} asChild>
      {pressionavel}
    </Link>
  ) : (
    pressionavel
  );
}

// A caixa quadrada do boletim, com o ✕ desenhado a caneta. Quando `animar`,
// o traço entra como uma caneta (duas linhas seguidas); com movimento
// reduzido aparece já desenhado.
export function MarcaX({
  marcado,
  tamanho = 20,
  animar = false,
  cor,
}: {
  marcado: boolean;
  tamanho?: number;
  animar?: boolean;
  cor?: string;
}) {
  const cores = useCores();
  const reduzido = useReducedMotion();
  const borda = tamanho >= 18 ? 1.5 : 1.25;
  const interior = tamanho - borda * 2;
  const margem = Math.max(3, Math.round(interior * 0.2));
  const espessura = Math.max(2, Math.round(tamanho / 9));
  const diagonal = (interior - margem * 2) * Math.SQRT2;
  const inicial = marcado && animar && !reduzido ? 0 : 1;
  const a = useRef(new Animated.Value(inicial)).current;
  const b = useRef(new Animated.Value(inicial)).current;

  useEffect(() => {
    if (!marcado || !animar || reduzido) {
      a.setValue(1);
      b.setValue(1);
      return;
    }
    const nativo = Platform.OS !== 'web';
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: Motion.traco, easing: Easing.out(Easing.cubic), useNativeDriver: nativo }),
      Animated.delay(Motion.pausa),
      Animated.timing(b, { toValue: 1, duration: Motion.traco, easing: Easing.out(Easing.cubic), useNativeDriver: nativo }),
    ]).start();
  }, [marcado, animar, reduzido, a, b]);

  const linha = (valor: Animated.Value, topo: number, angulo: string) => (
    <Animated.View
      style={{
        position: 'absolute',
        left: margem,
        top: topo - espessura / 2,
        width: diagonal,
        height: espessura,
        borderRadius: espessura / 2,
        backgroundColor: cor ?? cores.tint,
        transformOrigin: 'left center',
        transform: [{ rotate: angulo }, { scaleX: valor }],
      }}
    />
  );

  return (
    <View
      style={[styles.caixa, { width: tamanho, height: tamanho, borderWidth: borda, borderColor: cores.rule }]}
      accessible={false}
    >
      {marcado ? (
        <>
          {linha(a, margem, '45deg')}
          {linha(b, interior - margem, '-45deg')}
        </>
      ) : null}
    </View>
  );
}

// Opção do boletim: caixa + texto. Serve para filtros (tema, partido,
// posição). Quando `cor` existe, mostra o ponto do partido.
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
  cor?: string;
  accessibilityLabel?: string;
}) {
  const cores = useCores();
  if (!onPress) {
    return (
      <View style={styles.etiqueta}>
        {cor ? <View style={[styles.chipPonto, { backgroundColor: cor }]} /> : null}
        <Text style={[Typography.label, { color: cores.textMuted }]}>{label}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.opcao,
        transicao,
        { borderColor: selecionado ? cores.tint : 'transparent', backgroundColor: selecionado ? cores.tintBg : 'transparent' },
        hovered && !selecionado && { backgroundColor: cores.surfaceAlt },
        pressed && styles.premido,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={4}
    >
      <MarcaX marcado={selecionado} tamanho={14} animar />
      {cor ? <View style={[styles.chipPonto, { backgroundColor: cor }]} /> : null}
      <Text style={[Typography.label, { color: selecionado ? cores.tintInk : cores.text }]}>{label}</Text>
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
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.botao,
        transicao,
        primario
          ? { backgroundColor: cores.tint, borderColor: cores.tint }
          : { backgroundColor: hovered ? cores.surfaceAlt : cores.surface, borderColor: hovered ? cores.tint : cores.rule },
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

// Título de um ecrã de topo: título + frase curta + ação à direita.
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

// Título de secção com a voz impressa do boletim: maiúsculas espaçadas e a
// linha a tinta por baixo. A nota fica à direita (ou por baixo, se não couber).
export function TituloSecao({ children, nota }: { children: string; nota?: string }) {
  const cores = useCores();
  return (
    <View style={[styles.secao, { borderBottomColor: cores.rule }]}>
      <Text style={[styles.secaoTitulo, { color: cores.text }]} accessibilityRole="header">
        {children}
      </Text>
      {nota ? <Text style={[Typography.caption, styles.secaoNota, { color: cores.textMuted }]}>{nota}</Text> : null}
    </View>
  );
}

// O único campo de pesquisa da app (deputados, glossário).
export function CampoPesquisa({
  valor,
  onMudar,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
}: {
  valor: string;
  onMudar: (texto: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
}) {
  const cores = useCores();
  return (
    <View style={[styles.pesquisa, { backgroundColor: cores.surface, borderColor: cores.rule }]}>
      <MaterialIcons name="search" size={20} color={cores.textMuted} accessible={false} />
      <TextInput
        style={[styles.pesquisaInput, { color: cores.text }]}
        placeholder={placeholder}
        placeholderTextColor={cores.textMuted}
        value={valor}
        onChangeText={onMudar}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        clearButtonMode="while-editing"
        maxLength={60}
      />
    </View>
  );
}

export function Aviso({ children, icone = 'info-outline' }: { children: string; icone?: keyof typeof MaterialIcons.glyphMap }) {
  const cores = useCores();
  return (
    <View style={[styles.aviso, { borderTopColor: cores.border }]}>
      <MaterialIcons name={icone} size={16} color={cores.textMuted} accessible={false} style={styles.avisoIcone} />
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
    borderWidth: 1,
    padding: Spacing.lg,
  },
  cartaoTinta: {
    borderWidth: 1.5,
  },
  premido: {
    opacity: 0.8,
  },
  desativado: {
    opacity: 0.45,
  },
  caixa: {
    borderRadius: Radii.badge,
    overflow: 'hidden',
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.chip,
    borderWidth: 1,
  },
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.chip,
    borderWidth: 1.5,
  },
  botaoLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
  },
  cabecalho: {
    paddingTop: Spacing.xxl,
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
    maxWidth: 560,
  },
  secao: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: Spacing.md,
  },
  secaoTitulo: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secaoNota: {
    marginTop: 2,
  },
  pesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    borderWidth: 1.5,
    borderRadius: Radii.chip,
    paddingHorizontal: Spacing.md,
  },
  pesquisaInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  aviso: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    alignItems: 'flex-start',
  },
  avisoIcone: {
    marginTop: 1,
  },
  avisoTexto: {
    flex: 1,
  },
});
