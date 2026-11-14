// O azulejo: o padrão azul e branco que identifica a app (faixas no topo
// dos ecrãs e separadores). É geometria desenhada aqui, não uma imagem.
// Ver .claude/DESIGN.md › Azulejo.
import React, { useId } from 'react';
import { Image, Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { Contentor, useCores, useDisposicao } from '@/components/ui';
import { useColorScheme } from '@/components/useColorScheme';
import { EDIFICIOS, type EdificioId } from '@/constants/Edificios';
import { MAX_WIDTH, MAX_WIDTH_LARGO, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

const LADO = 32; // um azulejo, em unidades do desenho

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

// A gravura do edifício, sem moldura: o papel da imagem (#F8F9FA, a cor da
// página) funde-se com o fundo. Na web, em modo escuro, uma inversão parcial
// leva o papel a #232323 e o traço a cinzento claro; as margens esbatem-se
// (máscara em +html.tsx, [data-gravura]), para o edifício não acabar num corte.
// No nativo a imagem aparece como está.
function Gravura({ edificio, style }: { edificio: EdificioId; style?: StyleProp<ViewStyle> }) {
  const cores = useCores();
  const escuro = useColorScheme() === 'dark';
  const e = EDIFICIOS[edificio];
  if (!e.imagem) return null;
  const web =
    Platform.OS === 'web' ? { dataSet: { anim: 'imagem', gravura: escuro ? 'escuro' : 'claro' } } : {};
  return (
    <View style={style}>
      <View style={styles.imagemCaixa} {...web}>
        <Image
          source={e.imagem}
          style={styles.imagem}
          resizeMode="contain"
          accessibilityLabel={e.nome}
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[Typography.caption, styles.legenda, { color: cores.textMuted }]}>{e.nome}</Text>
    </View>
  );
}

// Cabeçalho de um separador: a faixa de azulejos, o edifício e o título do
// ecrã (`children`).
// - Telemóvel: o edifício por baixo da faixa, a toda a largura, e o título a seguir.
// - Computador: o título à esquerda e o edifício à direita, como uma primeira página.
// Sem imagem fica só a faixa: nunca se desenha um edifício falso.
// Espera ocupar a largura toda do ecrã (sem padding lateral à volta).
export function CabecalhoEdificio({ edificio, children }: { edificio: EdificioId; children: React.ReactNode }) {
  const { desktop } = useDisposicao();
  const temImagem = !!EDIFICIOS[edificio].imagem;

  if (!temImagem) {
    return (
      <View>
        <FaixaAzulejo altura={32} />
        <Contentor largo style={[styles.margens, desktop && styles.margensLargas]}>
          {children}
        </Contentor>
      </View>
    );
  }
  if (desktop) {
    return (
      <View>
        <FaixaAzulejo altura={32} />
        <Contentor largo style={[styles.margens, styles.margensLargas, styles.lado]}>
          <View style={styles.ladoTexto}>{children}</View>
          <Gravura edificio={edificio} style={styles.gravuraLado} />
        </Contentor>
      </View>
    );
  }
  return (
    <View>
      <FaixaAzulejo altura={32} />
      <Contentor style={styles.margens}>
        <Gravura edificio={edificio} style={styles.gravuraTopo} />
        {children}
      </Contentor>
    </View>
  );
}

const styles = StyleSheet.create({
  imagemCaixa: {
    width: '100%',
    aspectRatio: 2,
  },
  // Largura e altura explícitas: sem elas o react-native-web dá à imagem o
  // tamanho natural do ficheiro (1024×512) e ela sai da moldura.
  imagem: {
    width: '100%',
    height: '100%',
  },
  // O cabeçalho ocupa o ecrã inteiro, por isso põe ele próprio a margem de 16px
  // e soma-a à largura máxima, para alinhar com o conteúdo da lista por baixo.
  margens: {
    paddingHorizontal: Spacing.lg,
    maxWidth: MAX_WIDTH + Spacing.lg * 2,
  },
  margensLargas: {
    maxWidth: MAX_WIDTH_LARGO + Spacing.lg * 2,
  },
  lado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxxl,
  },
  ladoTexto: {
    flex: 1,
    minWidth: 0,
  },
  // No computador o edifício é a imagem principal do cabeçalho: ~60% da página.
  gravuraLado: {
    width: '60%',
    maxWidth: 720,
    marginTop: Spacing.sm,
  },
  gravuraTopo: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  legenda: {
    textAlign: 'center',
    marginTop: -Spacing.xs,
    fontSize: 12,
  },
});
