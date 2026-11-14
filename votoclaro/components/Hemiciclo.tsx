// O hemiciclo gravado: as 230 cadeiras como um meio anel dividido pelo
// sentido de voto, desenhado a tinta. A favor = tinta cheia, contra =
// tracejado, abstenção = papel com contorno, ausentes = cinzento.
// O sentido nunca vem só da cor: textura + legenda com números.
// Ver .claude/DESIGN.md › Hemiciclo.
import React, { useEffect, useId, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';

import { RESULTADO } from '@/components/ContagemVotos';
import { anim, useCores } from '@/components/ui';
import type { Paleta } from '@/constants/Colors';
import { Motion, Radii, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';
import type { Posicao, Resultado } from '@/types';

const L = 240; // largura do desenho
const CX = 120;
const CY = 122;
const R_EXT = 118;
const R_INT = 40;

const ROTULO_CURTO: Record<Posicao, string> = {
  favor: 'a favor',
  contra: 'contra',
  abstencao: 'abstenção',
  ausente: 'ausentes',
};

function ponto(r: number, t: number) {
  return `${(CX + r * Math.cos(t)).toFixed(2)} ${(CY - r * Math.sin(t)).toFixed(2)}`;
}

// Setor do anel entre as frações a e b (0 = esquerda, 1 = direita).
function setor(a: number, b: number) {
  const t0 = Math.PI * (1 - a);
  const t1 = Math.PI * (1 - b);
  return `M${ponto(R_EXT, t0)} A${R_EXT} ${R_EXT} 0 0 1 ${ponto(R_EXT, t1)} L${ponto(R_INT, t1)} A${R_INT} ${R_INT} 0 0 0 ${ponto(R_INT, t0)} Z`;
}

function preenchimento(cores: Paleta, posicao: Posicao, mini: boolean, tracejado: string) {
  switch (posicao) {
    case 'favor':
      return cores.favor;
    case 'contra':
      return mini ? cores.contraMini : `url(#${tracejado})`;
    case 'abstencao':
      return cores.abstencao;
    default:
      return cores.ausente;
  }
}

// ease-out exponencial (transitions.dev --ease-smooth-out, aproximado)
const suavizar = (t: number) => 1 - Math.pow(1 - t, 4);

export function Hemiciclo({
  favor,
  contra,
  abstencao,
  ausentes,
  mini = false,
  animar = false,
  resultado,
  style,
}: {
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
  mini?: boolean;
  animar?: boolean;
  resultado?: Resultado;
  style?: StyleProp<ViewStyle>;
}) {
  const cores = useCores();
  const reduzido = useReducedMotion();
  const tracejado = `tr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const varrer = animar && !reduzido;
  const [progresso, setProgresso] = useState(varrer ? 0 : 1);

  useEffect(() => {
    if (!varrer) {
      setProgresso(1);
      return;
    }
    let quadro = 0;
    const inicio = Date.now();
    const passo = () => {
      const t = Math.min(1, (Date.now() - inicio) / Motion.hemiciclo);
      setProgresso(suavizar(t));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [varrer]);

  const valores: [Posicao, number][] = [
    ['favor', favor],
    ['contra', contra],
    ['abstencao', abstencao],
    ['ausente', ausentes],
  ];
  const total = favor + contra + abstencao + ausentes;
  if (total <= 0) return null;

  const tinta = cores.favor;
  const traco = mini ? 3.2 : 1.3;
  let acumulado = 0;
  const setores = valores.map(([posicao, n]) => {
    const a = acumulado / total;
    acumulado += n;
    const b = acumulado / total;
    const fim = Math.min(b, progresso);
    if (n <= 0 || fim <= a) return null;
    return (
      <Path
        key={posicao}
        d={setor(a, fim)}
        fill={preenchimento(cores, posicao, mini, tracejado)}
        stroke={tinta}
        strokeWidth={traco}
        strokeLinejoin="round"
      />
    );
  });

  const descricao = valores
    .filter(([p, n]) => n > 0 || p !== 'ausente')
    .map(([p, n]) => `${n} ${ROTULO_CURTO[p]}`)
    .join(', ');

  return (
    <View
      style={[mini ? styles.mini : styles.grande, style]}
      accessible={!mini}
      accessibilityRole={mini ? undefined : 'image'}
      accessibilityLabel={mini ? undefined : `Hemiciclo: ${descricao}${resultado ? `. ${RESULTADO[resultado].label}` : ''}`}
      importantForAccessibility={mini ? 'no-hide-descendants' : 'yes'}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${L} 126`}>
        {!mini ? (
          <Defs>
            <Pattern id={tracejado} width={3.4} height={3.4} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
              <Rect width={3.4} height={3.4} fill={cores.abstencao} />
              <Line x1={0} y1={0} x2={0} y2={3.4} stroke={tinta} strokeWidth={1.2} />
            </Pattern>
          </Defs>
        ) : null}
        <G>{setores}</G>
        {!mini
          ? [50, 60, 70, 80, 90, 100, 110].map((r) => (
              <Path
                key={r}
                d={`M${CX - r} ${CY} A${r} ${r} 0 0 1 ${CX + r} ${CY}`}
                fill="none"
                stroke={cores.background}
                strokeWidth={1.2}
                strokeOpacity={0.5}
              />
            ))
          : null}
        <Line x1={2} y1={CY + 1} x2={L - 2} y2={CY + 1} stroke={tinta} strokeWidth={traco} />
      </Svg>
      {resultado && !mini ? (
        <View style={styles.carimboZona} pointerEvents="none">
          <Carimbo resultado={resultado} animar={animar} />
        </View>
      ) : null}
    </View>
  );
}

// O carimbo do resultado, inclinado como um carimbo a sério. Entra depois do
// varrimento do hemiciclo (ver [data-anim="carimbo"] no +html.tsx).
export function Carimbo({ resultado, animar = false }: { resultado: Resultado; animar?: boolean }) {
  const cores = useCores();
  const cor = resultado === 'aprovada' ? cores.tintInk : cores.text;
  return (
    <View
      {...(animar ? anim('carimbo') : {})}
      style={[styles.carimbo, { borderColor: cor, backgroundColor: cores.background }]}
    >
      <Text style={[styles.carimboTexto, { color: cor }]}>{RESULTADO[resultado].label.toUpperCase()}</Text>
    </View>
  );
}

// A amostra de textura de uma posição (legendas, listas).
export function Amostra({ posicao, tamanho = 12 }: { posicao: Posicao; tamanho?: number }) {
  const cores = useCores();
  const id = `am${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const tinta = cores.favor;
  const fill =
    posicao === 'favor' ? tinta : posicao === 'contra' ? `url(#${id})` : posicao === 'abstencao' ? cores.abstencao : cores.ausente;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 12 12" accessible={false}>
      {posicao === 'contra' ? (
        <Defs>
          <Pattern id={id} width={3} height={3} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <Rect width={3} height={3} fill={cores.abstencao} />
            <Line x1={0} y1={0} x2={0} y2={3} stroke={tinta} strokeWidth={1.1} />
          </Pattern>
        </Defs>
      ) : null}
      <Rect x={1} y={1} width={10} height={10} rx={2} fill={fill} stroke={posicao === 'ausente' ? cores.ausente : tinta} strokeWidth={1} />
    </Svg>
  );
}

// Legenda em linha: ■ 149 a favor · ▨ 69 contra · □ 12 abstenção
export function LegendaVotos({
  favor,
  contra,
  abstencao,
  ausentes,
}: {
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
}) {
  const cores = useCores();
  const valores: [Posicao, number][] = [
    ['favor', favor],
    ['contra', contra],
    ['abstencao', abstencao],
    ['ausente', ausentes],
  ];
  return (
    <View style={styles.legenda}>
      {valores
        .filter(([p, n]) => n > 0 || p !== 'ausente')
        .map(([p, n]) => (
          <View key={p} style={styles.legendaItem} accessible accessibilityLabel={`${n} ${ROTULO_CURTO[p]}`}>
            <Amostra posicao={p} />
            <Text style={[styles.legendaTexto, { color: cores.text }]}>
              <Text style={styles.legendaNumero}>{n}</Text> {ROTULO_CURTO[p]}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grande: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    aspectRatio: L / 126,
  },
  mini: {
    width: 64,
    height: 34,
  },
  carimboZona: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  carimbo: {
    borderWidth: 2,
    borderRadius: Radii.badge,
    paddingHorizontal: 10,
    paddingVertical: 3,
    transform: [{ rotate: '-4deg' }],
  },
  carimboTexto: {
    fontFamily: Fonts.black,
    fontSize: 13,
    letterSpacing: 1,
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.lg,
    rowGap: Spacing.xs,
    marginTop: Spacing.md,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaTexto: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  legendaNumero: {
    fontFamily: Fonts.bold,
  },
});
