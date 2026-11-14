// Peças base da interface — ver .claude/DESIGN.md (mundo: o azulejo)
import { MaterialIcons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors, { type Paleta } from '@/constants/Colors';
import { Easing, LARGURA_DESKTOP, LARGURA_LARGA, MAX_WIDTH, MAX_WIDTH_LARGO, Motion, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';

export function useCores(): Paleta {
  return Colors[useColorScheme()];
}

// Transição única de estado no web (borda, fundo, escala ao premir). No
// nativo é ignorada.
export const transicao = (Platform.OS === 'web'
  ? {
      transitionProperty: 'border-color, background-color, color, opacity, transform',
      transitionDuration: `${Motion.duracao}ms`,
      transitionTimingFunction: Easing.smoothOut,
    }
  : {}) as ViewStyle;

// Entradas animadas no web: o CSS está no +html.tsx ([data-anim]) e respeita
// prefers-reduced-motion. `i` dá o atraso em escada (40ms por item, até 8).
// No nativo não faz nada.
export type Animacao = 'pagina' | 'titulo' | 'item' | 'carimbo' | 'imagem' | 'troca';
export function anim(nome: Animacao, i?: number): object {
  if (Platform.OS !== 'web') return {};
  return { dataSet: { anim: nome, ...(i !== undefined ? { i: String(Math.min(i, 8)) } : {}) } };
}

// Limita a largura do conteúdo no web/tablet e centra-o.
// Nível do título para a web (h1/h2…). O react-native-web lê `aria-level`, mas os
// tipos do React Native não o declaram; no nativo não faz nada.
export function nivel(n: 1 | 2 | 3): object {
  return Platform.OS === 'web' ? { 'aria-level': n } : {};
}

// Como o ecrã se organiza: telemóvel (uma coluna), computador (página larga,
// grelha de 2 colunas) e ecrã largo (3 colunas).
export function useDisposicao() {
  const { width } = useWindowDimensions();
  const desktop = width >= LARGURA_DESKTOP;
  return { desktop, colunas: width >= LARGURA_LARGA ? 3 : desktop ? 2 : 1, largura: width };
}

// `largo`: no computador ocupa a página larga (1200) em vez da coluna de leitura.
export function Contentor({ children, style, largo = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; largo?: boolean }) {
  const { desktop } = useDisposicao();
  return <View style={[styles.contentor, largo && desktop && styles.contentorLargo, style]}>{children}</View>;
}

// Um cartão: papel branco, cantos macios, linha fina. `tinta` desenha a
// moldura em azul ultramarino (destaque).
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
    { backgroundColor: cores.surface, borderColor: cores.border },
    tinta && [styles.cartaoTinta, { borderColor: cores.tint }],
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
      style={StyleSheet.flatten<ViewStyle>([...base, transicao, ativo && { borderColor: cores.tint }, premido && styles.encolher])}
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

// Filtro em pílula (tema, partido, posição). Selecionado fica cheio a azul.
// Quando `cor` existe, mostra o ponto do partido.
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
        { borderColor: cores.tint, backgroundColor: selecionado ? cores.tint : 'transparent' },
        hovered && !selecionado && { backgroundColor: cores.tintBg },
        pressed && styles.encolher,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={4}
    >
      {cor ? <View style={[styles.chipPonto, { backgroundColor: cor }, selecionado && { borderColor: cores.onTint, borderWidth: 1 }]} /> : null}
      <Text style={[Typography.label, { color: selecionado ? cores.onTint : cores.tintInk }]}>{label}</Text>
    </Pressable>
  );
}

// Etiqueta de tema (só leitura): pílula azul clara.
export function Etiqueta({ children }: { children: string }) {
  const cores = useCores();
  return (
    <View style={[styles.tag, { backgroundColor: cores.tintBg }]}>
      <Text style={[styles.tagTexto, { color: cores.tintInk }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
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
  // Primário: tinta cheia (carbono). Secundário: cinzento suave sem moldura.
  const primario = variante === 'primario';
  const corTexto = primario ? cores.background : cores.text;
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
          ? { backgroundColor: hovered ? cores.tint : cores.text }
          : { backgroundColor: hovered ? cores.border : cores.surfaceAlt },
        pressed && styles.encolher,
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
          <Text style={[Typography.displayLg, { color: cores.text }]} accessibilityRole="header" {...nivel(1)}>
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

// Título de secção: negrito, frase normal. A nota fica por baixo.
export function TituloSecao({ children, nota, direita }: { children: string; nota?: string; direita?: React.ReactNode }) {
  const cores = useCores();
  return (
    <View style={styles.secao}>
      <Text style={[styles.secaoTitulo, { color: cores.text }]} accessibilityRole="header" {...nivel(2)}>
        {children}
      </Text>
      {direita}
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
    <View style={[styles.pesquisa, { backgroundColor: cores.surface, borderColor: cores.border }]}>
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
  contentorLargo: {
    maxWidth: MAX_WIDTH_LARGO,
  },
  cartao: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  cartaoTinta: {
    borderWidth: 2,
  },
  encolher: {
    transform: [{ scale: 0.98 }],
  },
  desativado: {
    opacity: 0.45,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagTexto: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: Spacing.md,
  },
  secaoTitulo: {
    fontFamily: Fonts.black,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  secaoNota: {
    marginTop: 2,
    width: '100%',
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
