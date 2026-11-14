// O azulejo: o padrão azul e branco que identifica a app (faixas no topo
// dos ecrãs e separadores). É geometria desenhada aqui, não uma imagem.
// Ver .claude/DESIGN.md › Azulejo.
import React, { useId } from 'react';
import { Image, Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { Contentor, CoresCabecalho, useCores, useDisposicao } from '@/components/ui';
import { useColorScheme } from '@/components/useColorScheme';
import { EDIFICIOS, type EdificioId } from '@/constants/Edificios';
import { MAX_WIDTH, MAX_WIDTH_LARGO, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';

const LADO = 32; // um azulejo, em unidades do desenho

// O desenho de um azulejo (unidades 32×32), nas cores dadas.
function DesenhoAzulejo({ linha, fundo }: { linha: string; fundo: string }) {
  return (
    <>
      <Rect width={LADO} height={LADO} fill={fundo} />
      <Rect x={0.8} y={0.8} width={LADO - 1.6} height={LADO - 1.6} fill="none" stroke={linha} strokeWidth={1.6} />
      <Circle cx={16} cy={16} r={6} fill="none" stroke={linha} strokeWidth={1.6} />
      <Path
        d="M0 9 A9 9 0 0 0 9 0 M23 0 A9 9 0 0 0 32 9 M32 23 A9 9 0 0 0 23 32 M9 32 A9 9 0 0 0 0 23 M16 4 L19 10 M16 4 L13 10 M16 28 L19 22 M16 28 L13 22 M4 16 L10 13 M4 16 L10 19 M28 16 L22 13 M28 16 L22 19"
        fill="none"
        stroke={linha}
        strokeWidth={1.6}
      />
      <Circle cx={16} cy={16} r={2.2} fill={linha} />
    </>
  );
}

// Uma superfície coberta de azulejos (`lado` em px por azulejo), a toda a
// largura e com a altura dada. Decorativa: escondida dos leitores de ecrã.
export function PadraoAzulejo({
  altura,
  lado,
  linha,
  fundo,
  style,
}: {
  altura: number;
  lado: number;
  linha: string;
  fundo: string;
  style?: StyleProp<ViewStyle>;
}) {
  const id = `az${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      style={[{ height: altura, width: '100%', overflow: 'hidden' }, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Svg width="100%" height={altura}>
        <Defs>
          <Pattern id={id} x={0} y={0} width={lado} height={lado} patternUnits="userSpaceOnUse">
            <G scale={lado / LADO}>
              <DesenhoAzulejo linha={linha} fundo={fundo} />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height={altura} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// Um único azulejo, por exemplo o que marca o separador ativo na barra do topo.
export function AzulejoUnico({ tamanho, linha, fundo }: { tamanho: number; linha: string; fundo: string }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox={`0 0 ${LADO} ${LADO}`} aria-hidden>
      <DesenhoAzulejo linha={linha} fundo={fundo} />
    </Svg>
  );
}

// Uma faixa de azulejos. Até 32px de altura mostra uma fila inteira de
// azulejos mais pequenos; acima disso repete a tamanho real.
// No computador as faixas de topo (até 32px) não se desenham: a barra de
// navegação já é um painel de azulejo (BarraComputador).
export function FaixaAzulejo({ altura = 14 }: { altura?: number }) {
  const cores = useCores();
  const { desktop } = useDisposicao();
  if (desktop && altura <= LADO) return null;
  const lado = altura < LADO ? altura : LADO;
  return <PadraoAzulejo altura={altura} lado={lado} linha={cores.azulejo} fundo={cores.azulejoFundo} />;
}

// A gravura do edifício, sem moldura: o papel da imagem (#F8F9FA, a cor da
// página) funde-se com o fundo. Na web, em modo escuro, uma inversão parcial
// leva o papel a #232323 e o traço a cinzento claro; as margens esbatem-se
// (máscara em +html.tsx, [data-gravura]), para o edifício não acabar num corte.
// No nativo a imagem aparece como está.
export function Gravura({
  edificio,
  style,
  legenda = true,
}: {
  edificio: EdificioId;
  style?: StyleProp<ViewStyle>;
  legenda?: boolean;
}) {
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
      {legenda ? <Text style={[Typography.caption, styles.legenda, { color: cores.textMuted }]}>{e.nome}</Text> : null}
    </View>
  );
}

// O painel do cabeçalho no computador é sempre desta cor no escuro (como a barra).
const ULTRA = '#120A8F';

// Cabeçalho de um separador: o título do ecrã (`children`) com o edifício.
// - Telemóvel: a faixa de azulejos, o edifício a toda a largura e o título a seguir.
// - Computador: um painel (branco no claro, Ultramarine no escuro, a continuar a
//   barra) com o edifício só em traço (Ultramarine no claro, branco no escuro) a
//   nascer do fundo, à direita; a página assenta por cima da base dele, numa folha.
//   `direita` são os números do cabeçalho (NumerosCabecalho).
// Sem imagem fica só o título: nunca se desenha um edifício falso.
// `estreito`: alinha com o conteúdo de largura normal (760) em vez da larga (1200),
// por exemplo na conversa do Perguntar.
// Espera ocupar a largura toda do ecrã (sem padding lateral à volta).
export function CabecalhoEdificio({
  edificio,
  estreito = false,
  direita,
  children,
}: {
  edificio: EdificioId;
  estreito?: boolean;
  direita?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cores = useCores();
  const { desktop } = useDisposicao();
  const escuro = useColorScheme() === 'dark';
  const e = EDIFICIOS[edificio];

  if (desktop) {
    const sobre = escuro
      ? { titulo: '#FFFFFF', sub: '#C9C6F0', legenda: '#A9A4E8' }
      : { titulo: cores.tintInk, sub: cores.textMuted, legenda: cores.textMuted };
    const web = Platform.OS === 'web' ? { dataSet: { horizonte: '1' } } : {};
    return (
      <View style={[styles.painel, { backgroundColor: escuro ? ULTRA : cores.surface }]}>
        {e.tinta ? (
          <View style={[styles.horizonte, estreito && styles.horizonteEstreito]} pointerEvents="none" {...web}>
            <Image
              source={e.tinta}
              style={[styles.imagem, { tintColor: escuro ? '#FFFFFF' : ULTRA, opacity: escuro ? 0.5 : 0.55 }]}
              resizeMode="contain"
              accessibilityLabel={e.nome}
              accessibilityIgnoresInvertColors
            />
          </View>
        ) : null}
        <Contentor largo={!estreito} style={[styles.margens, !estreito && styles.margensLargas, styles.painelConteudo]}>
          <View style={styles.painelTexto}>
            <CoresCabecalho.Provider value={sobre}>{children}</CoresCabecalho.Provider>
            {e.tinta ? <Text style={[Typography.caption, styles.legendaPainel, { color: sobre.legenda }]}>{e.nome}</Text> : null}
          </View>
          {direita ? <CoresCabecalho.Provider value={sobre}>{direita}</CoresCabecalho.Provider> : null}
        </Contentor>
        {/* O topo da folha da página: cobre a base do edifício e continua no fundo da página. */}
        <View
          style={[
            styles.folha,
            estreito ? styles.folhaEstreita : styles.folhaLarga,
            { backgroundColor: cores.background, borderColor: escuro ? 'transparent' : cores.border },
          ]}
        />
      </View>
    );
  }

  if (!e.imagem) {
    return (
      <View>
        <FaixaAzulejo altura={32} />
        <Contentor style={styles.margens}>{children}</Contentor>
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

// Os números do cabeçalho (p. ex. "2341 votações na XVII legislatura"), à direita
// do título, nas cores do painel.
export function NumerosCabecalho({ itens }: { itens: { valor: number | string; rotulo: string }[] }) {
  const cores = useCores();
  const escuro = useColorScheme() === 'dark';
  const valor = escuro ? '#FFFFFF' : cores.text;
  const rotulo = escuro ? '#C9C6F0' : cores.textMuted;
  return (
    <View style={styles.numeros}>
      {itens.map((i) => (
        <View key={i.rotulo} style={styles.numero} accessible accessibilityLabel={`${i.valor} ${i.rotulo}`}>
          <Text style={[styles.numeroValor, { color: valor }]}>{i.valor}</Text>
          <Text style={[Typography.caption, { color: rotulo }]}>{i.rotulo}</Text>
        </View>
      ))}
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
  // Painel do computador: o edifício ocupa a metade direita e nasce do fundo.
  painel: {
    minHeight: 460,
    overflow: 'hidden',
    position: 'relative',
  },
  horizonte: {
    position: 'absolute',
    left: '66%',
    marginLeft: -420,
    bottom: -40,
    width: 840,
    height: 420,
  },
  horizonteEstreito: {
    left: '70%',
    marginLeft: -380,
    width: 760,
    height: 380,
  },
  painelConteudo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xxxl,
    paddingTop: Spacing.huge,
    paddingBottom: 72,
  },
  painelTexto: {
    flex: 1,
    minWidth: 0,
    maxWidth: 560,
  },
  legendaPainel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  folha: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 'auto',
    height: 28,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  folhaLarga: {
    maxWidth: MAX_WIDTH_LARGO + Spacing.lg * 2,
  },
  folhaEstreita: {
    maxWidth: MAX_WIDTH + Spacing.lg * 2,
  },
  numeros: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  numero: {
    alignItems: 'flex-end',
  },
  numeroValor: {
    fontFamily: Fonts.black,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
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
