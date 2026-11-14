// O azulejo: o padrão azul e branco que identifica a app (faixas no topo
// dos ecrãs e separadores). É geometria desenhada aqui, não uma imagem.
// Ver .claude/DESIGN.md › Azulejo.
import React, { useId } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { anim, useCores } from '@/components/ui';
import { EDIFICIOS, type EdificioId } from '@/constants/Edificios';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

const LADO = 32; // um azulejo, em unidades do desenho
const PAPEL = '#F8F9FA';

// Uma faixa de azulejos. Até 32px de altura mostra uma fila inteira de
// azulejos mais pequenos; acima disso repete a tamanho real.
export function FaixaAzulejo({ altura = 14 }: { altura?: number }) {
  const cores = useCores();
  const id = `az${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const escala = altura < LADO ? altura / LADO : 1;
  const lado = LADO * escala;
  const linha = cores.azulejo;
  return (
    <View style={{ height: altura, width: '100%', overflow: 'hidden' }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height={altura}>
        <Defs>
          <Pattern id={id} x={0} y={0} width={lado} height={lado} patternUnits="userSpaceOnUse">
            <G scale={escala}>
              <Rect width={LADO} height={LADO} fill={cores.azulejoFundo} />
              <Rect x={0.8} y={0.8} width={LADO - 1.6} height={LADO - 1.6} fill="none" stroke={linha} strokeWidth={1.6} />
              <Circle cx={16} cy={16} r={6} fill="none" stroke={linha} strokeWidth={1.6} />
              <Path
                d="M0 9 A9 9 0 0 0 9 0 M23 0 A9 9 0 0 0 32 9 M32 23 A9 9 0 0 0 23 32 M9 32 A9 9 0 0 0 0 23 M16 4 L19 10 M16 4 L13 10 M16 28 L19 22 M16 28 L13 22 M4 16 L10 13 M4 16 L10 19 M28 16 L22 13 M28 16 L22 19"
                fill="none"
                stroke={linha}
                strokeWidth={1.6}
              />
              <Circle cx={16} cy={16} r={2.2} fill={linha} />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height={altura} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// Cabeçalho de um separador: a faixa de azulejos e, por cima, a janela com o
// edifício (quando a imagem existe em assets/edificios). Sem imagem fica só a
// faixa: nunca se desenha um edifício falso.
export function JanelaAzulejo({ edificio }: { edificio: EdificioId }) {
  const cores = useCores();
  const e = EDIFICIOS[edificio];
  if (!e.imagem) return <FaixaAzulejo altura={32} />;
  return (
    <View style={styles.janelaZona}>
      <FaixaAzulejo altura={64} />
      {/* A janela é sempre "papel" claro, também no modo escuro: as gravuras são
          tinta preta sobre #F8F9FA. */}
      <View style={[styles.janela, { backgroundColor: PAPEL, borderColor: cores.tint }]}>
        <View {...anim('imagem')}>
          <Image
            source={e.imagem}
            style={styles.imagem}
            resizeMode="contain"
            accessibilityLabel={e.nome}
            accessibilityIgnoresInvertColors
          />
        </View>
        <Text style={[Typography.caption, styles.legenda, { color: '#585D64' }]}>{e.nome}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  janelaZona: {
    paddingBottom: Spacing.sm,
  },
  janela: {
    marginTop: -48,
    marginHorizontal: Spacing.xxl,
    borderWidth: 2,
    borderRadius: Radii.card,
    padding: Spacing.sm,
    alignSelf: 'center',
    width: '86%',
    maxWidth: 520,
  },
  imagem: {
    width: '100%',
    aspectRatio: 2,
  },
  legenda: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: 12,
  },
});
