// Peças do layout de computador (≥ 900px): o painel com filtros à esquerda, as
// linhas de tabela que são ligações, os números de um voto e a faixa dos grupos
// parlamentares. Ver .claude/DESIGN.md › Desktop.
import { Link, type Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';

import { Amostra } from '@/components/Amostra';
import { transicao, useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';
import type { Posicao } from '@/types';

// A página com uma coluna de filtros fixa à esquerda (240px) e o conteúdo à direita.
export function Painel({ rail, children, style }: { rail: React.ReactNode; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const cores = useCores();
  return (
    <View style={[styles.painel, style]}>
      <View style={[styles.rail, { borderRightColor: cores.border }]}>{rail}</View>
      <View style={styles.principal}>{children}</View>
    </View>
  );
}

export function RailSecao({ titulo, children, primeira = false }: { titulo: string; children: React.ReactNode; primeira?: boolean }) {
  const cores = useCores();
  return (
    <View style={!primeira && styles.railSecao} accessibilityRole="list" aria-label={titulo}>
      <Text style={[styles.railTitulo, { color: cores.textMuted }]}>{titulo}</Text>
      {children}
    </View>
  );
}

// Uma opção do filtro: ícone ou ponto da cor do partido, rótulo e contagem.
export function RailItem({
  rotulo,
  contagem,
  icone,
  ponto,
  ativo,
  onPress,
  accessibilityLabel,
}: {
  rotulo: string;
  contagem?: number;
  icone?: keyof typeof MaterialIcons.glyphMap;
  ponto?: string;
  ativo: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const cores = useCores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      aria-pressed={ativo}
      accessibilityLabel={accessibilityLabel ?? (contagem !== undefined ? `${rotulo}, ${contagem}` : rotulo)}
      style={({ hovered }: { hovered?: boolean }) => [
        styles.railItem,
        transicao,
        ativo ? { backgroundColor: cores.tintBg } : hovered && { backgroundColor: cores.surfaceAlt },
      ]}
    >
      {icone ? <MaterialIcons name={icone} size={18} color={cores.tintInk} /> : null}
      {ponto ? <View style={[styles.ponto, { backgroundColor: ponto }]} /> : null}
      <Text style={[styles.railRotulo, { color: ativo ? cores.tintInk : cores.text }, ativo && styles.railAtivo]} numberOfLines={1}>
        {rotulo}
      </Text>
      {contagem !== undefined ? <Text style={[styles.railContagem, { color: cores.textMuted }]}>{contagem}</Text> : null}
    </Pressable>
  );
}

// Um cartão que contém linhas de tabela (cabeçalho opcional em `cabecalho`).
export function Tabela({ cabecalho, children, style }: { cabecalho?: React.ReactNode; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const cores = useCores();
  return (
    <View style={[styles.tabela, { backgroundColor: cores.surface, borderColor: cores.border }, style]}>
      {cabecalho ? <View style={[styles.linha, styles.cabecalho, { backgroundColor: cores.surfaceAlt, borderBottomColor: cores.border }]}>{cabecalho}</View> : null}
      {children}
    </View>
  );
}

export function Coluna({ children, largura, flex, direita }: { children: React.ReactNode; largura?: number; flex?: boolean; direita?: boolean }) {
  const cores = useCores();
  return (
    <Text style={[styles.colunaTexto, { color: cores.textMuted }, largura ? { width: largura } : null, flex && styles.flex, direita && styles.direita]} numberOfLines={1}>
      {children}
    </Text>
  );
}

// Uma linha de tabela que é uma ligação a sério (Ctrl/Cmd+clique abre noutro separador).
// O estilo é estático e o realce de hover vem pela função dos filhos (o Link com
// asChild perde os estilos-função do Pressable no react-native-web).
export function LinhaLigacao({
  href,
  children,
  accessibilityLabel,
  ativa = false,
  ultima = false,
}: {
  href: Href;
  children: React.ReactNode;
  accessibilityLabel: string;
  ativa?: boolean;
  ultima?: boolean;
}) {
  const cores = useCores();
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={accessibilityLabel} aria-current={ativa ? 'page' : undefined}>
        {({ hovered }: { hovered?: boolean }) => (
          <View
            style={[
              styles.linha,
              transicao,
              !ultima && { borderBottomColor: cores.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ativa ? { backgroundColor: cores.tintBg } : hovered ? { backgroundColor: cores.surfaceAlt } : null,
            ]}
          >
            {children}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

// "■ 91  ▨ 79  □ 60": os deputados por sentido, com as amostras de tinta.
export function NumerosVoto({ favor, contra, abstencao, compacto = false }: { favor: number; contra: number; abstencao: number; compacto?: boolean }) {
  const cores = useCores();
  const valores: [Posicao, number][] = [
    ['favor', favor],
    ['contra', contra],
    ['abstencao', abstencao],
  ];
  return (
    <View
      style={[styles.numeros, compacto && styles.numerosCompactos]}
      accessible
      accessibilityLabel={`${favor} a favor, ${contra} contra, ${abstencao} abstenções`}
    >
      {valores.map(([p, n]) => (
        <View key={p} style={styles.numero}>
          <Amostra posicao={p} tamanho={11} />
          <Text style={[styles.numeroTexto, { color: compacto ? cores.textMuted : cores.text }]}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

// O sentido de cada grupo parlamentar numa votação: uma amostra por grupo, na
// ordem dada (do maior para o menor). Os rótulos de coluna vêm de SiglasFaixa.
export function FaixaPartidos({ partidos, posicaoDe }: { partidos: string[]; posicaoDe: (p: string) => Posicao }) {
  return (
    <View
      style={styles.faixa}
      accessible
      accessibilityLabel={partidos.map((p) => `${p}: ${ROTULO_ACESSIVEL[posicaoDe(p)]}`).join(', ')}
    >
      {partidos.map((p) => (
        <View key={p} style={styles.faixaCelula}>
          <Amostra posicao={posicaoDe(p)} tamanho={16} />
        </View>
      ))}
    </View>
  );
}

export function SiglasFaixa({ partidos }: { partidos: string[] }) {
  const cores = useCores();
  return (
    <View style={styles.faixa} aria-hidden>
      {partidos.map((p) => (
        <Text key={p} style={[styles.faixaSigla, { color: cores.textMuted }]} numberOfLines={1}>
          {p}
        </Text>
      ))}
    </View>
  );
}

const ROTULO_ACESSIVEL: Record<Posicao, string> = { favor: 'a favor', contra: 'contra', abstencao: 'abstenção', ausente: 'ausente' };
export const LARGURA_FAIXA = (n: number) => n * 22;

// Os 230 lugares da Assembleia como pontos num meio anel, um bloco por grupo
// parlamentar (cores oficiais), do maior grupo para o menor. Não reproduz a
// disposição real dos lugares no hemiciclo: é uma contagem desenhada.
// Decorativo para leitores de ecrã: a legenda por baixo tem os números e filtra.
export function Assentos({ lugares, selecionado }: { lugares: [string, number][]; selecionado: string | null }) {
  const total = lugares.reduce((s, [, n]) => s + n, 0);
  const pontos = React.useMemo(() => {
    const filas = 8;
    const raios = Array.from({ length: filas }, (_, i) => 0.42 + (0.58 * i) / (filas - 1));
    const soma = raios.reduce((a, b) => a + b, 0);
    const pos: { a: number; r: number }[] = [];
    raios.forEach((r) => {
      const n = Math.round((total * r) / soma);
      for (let j = 0; j < n; j++) pos.push({ a: Math.PI * (1 - j / (n - 1)), r });
    });
    // Da esquerda para a direita, para os grupos ficarem em fatias.
    return pos.slice(0, total).sort((x, y) => y.a - x.a || x.r - y.r);
  }, [total]);
  const cores: string[] = [];
  const grupos: string[] = [];
  lugares.forEach(([p, n]) => {
    for (let i = 0; i < n; i++) {
      cores.push(getCorPartido(p));
      grupos.push(p);
    }
  });
  return (
    <Svg width="100%" height={200} viewBox="0 0 300 156" aria-hidden>
      {pontos.map((pt, i) => (
        <Circle
          key={i}
          cx={150 + 140 * pt.r * Math.cos(pt.a)}
          cy={150 - 140 * pt.r * Math.sin(pt.a)}
          r={4.4}
          fill={cores[i]}
          opacity={selecionado && grupos[i] !== selecionado ? 0.2 : 1}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  painel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xxxl,
  },
  rail: {
    width: 240,
    paddingTop: Spacing.xxl,
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  principal: {
    flex: 1,
    minWidth: 0,
    paddingTop: Spacing.xxl,
  },
  railSecao: {
    marginTop: Spacing.xxl,
  },
  railTitulo: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 10,
    borderRadius: Radii.chip,
  },
  railRotulo: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  railAtivo: {
    fontFamily: Fonts.bold,
  },
  railContagem: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  ponto: {
    width: 9,
    height: 9,
    borderRadius: Radii.pill,
  },
  tabela: {
    borderWidth: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cabecalho: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colunaTexto: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  flex: {
    flex: 1,
  },
  direita: {
    textAlign: 'right',
  },
  numeros: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  numerosCompactos: {
    gap: Spacing.sm,
  },
  numero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 36,
  },
  numeroTexto: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  faixa: {
    flexDirection: 'row',
  },
  faixaCelula: {
    width: 22,
    alignItems: 'center',
  },
  faixaSigla: {
    width: 22,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 8,
    lineHeight: 10,
  },
});
