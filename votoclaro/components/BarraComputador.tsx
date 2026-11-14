// Barra do topo no computador (≥ 900px) — ver .claude/DESIGN.md › Navegação.
// Um painel de azulejo ultramarino com o texto a branco. O separador ativo (ou
// o menu aberto) leva um azulejo pendurado por baixo, metade na barra e metade
// no menu. Votações, Deputados e Aprender abrem um menu largo em branco, a toda
// a largura, com conteúdo real: temas e a última votação, grupos
// parlamentares, glossário. No telemóvel a barra é outra (BarraTopo).
import { MaterialIcons } from '@expo/vector-icons';
import { Link, usePathname, useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { AzulejoUnico, PadraoAzulejo } from '@/components/Azulejo';
import { Hemiciclo, LegendaVotos } from '@/components/Hemiciclo';
import { transicao, useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { MAX_WIDTH_LARGO, Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { useVotacoesFeed } from '@/hooks/useVotacoesFeed';
import { TEMAS } from '@/lib/temas';

const ALTURA = 72;
// A barra é sempre ultramarino (também no modo escuro): é uma superfície da marca.
const ULTRA = '#120A8F';
const LINHA_PADRAO = '#2A22A8'; // as linhas do azulejo, um tom acima do fundo
const TEXTO = '#FFFFFF';
const TEXTO_SUAVE = '#E3E1FA'; // 13.5:1 sobre ultramarino

type MenuId = 'votacoes' | 'deputados' | 'aprender';
type ItemId = MenuId | 'perguntar' | 'comparar';

const ITENS: { id: ItemId; nome: string; rota: Href; menu: boolean }[] = [
  { id: 'votacoes', nome: 'Votações', rota: '/', menu: true },
  { id: 'deputados', nome: 'Deputados', rota: '/deputados', menu: true },
  { id: 'perguntar', nome: 'Perguntar', rota: '/perguntar', menu: false },
  { id: 'comparar', nome: 'Comparar', rota: '/comparar', menu: false },
  { id: 'aprender', nome: 'Aprender', rota: '/glossario', menu: true },
];

export const ICONE_TEMA: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Habitação: 'home',
  Saúde: 'local-hospital',
  Ambiente: 'forest',
  Educação: 'school',
  Economia: 'payments',
  Trabalho: 'work',
  Justiça: 'gavel',
  Outros: 'more-horiz',
};

// Em que separador está a página aberta.
function itemDaRota(pathname: string): ItemId | null {
  if (pathname === '/' || pathname.startsWith('/votacao')) return 'votacoes';
  if (pathname.startsWith('/deputado')) return 'deputados';
  if (pathname.startsWith('/perguntar')) return 'perguntar';
  if (pathname.startsWith('/comparar')) return 'comparar';
  if (pathname.startsWith('/glossario') || pathname.startsWith('/definicoes')) return 'aprender';
  return null;
}

// Na web o menu fica fixo por baixo da barra, por cima da página; no nativo
// (tablet) fica absoluto, que é o que o React Native tem.
const fixo = (Platform.OS === 'web' ? { position: 'fixed' } : { position: 'absolute' }) as unknown as ViewStyle;

export function BarraComputador({ voltar = false }: { voltar?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [aberto, setAberto] = useState<MenuId | null>(null);
  const [pesquisa, setPesquisa] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gatilhos = useRef<Partial<Record<MenuId, View | null>>>({});

  // Entre 900 e 1180px não cabe tudo: a pesquisa passa a um ícone que leva a Deputados.
  const compacta = useWindowDimensions().width < 1180;
  const ativo = itemDaRota(pathname);
  const marcado = aberto ?? ativo;

  // Mudar de página fecha o menu.
  useEffect(() => setAberto(null), [pathname]);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Escape fecha o menu e devolve o foco ao botão que o abriu.
  useEffect(() => {
    if (!aberto || Platform.OS !== 'web') return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const gatilho = gatilhos.current[aberto] as unknown as HTMLElement | null;
      setAberto(null);
      gatilho?.focus?.();
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberto]);

  // Rato: abre ao passar (com uma pausa curta, para não abrir de passagem) e
  // fecha um pouco depois de sair da barra e do menu.
  const passarPor = (id: MenuId) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAberto(id), aberto ? 0 : 140);
  };
  const sair = () => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAberto(null), 220);
  };
  const ficar = () => clearTimeout(temporizador.current);
  const fechar = () => {
    clearTimeout(temporizador.current);
    setAberto(null);
  };

  function procurar() {
    const q = pesquisa.trim();
    if (!q) return;
    fechar();
    router.push({ pathname: '/deputados', params: { q } });
    setPesquisa('');
  }

  return (
    <View style={styles.zona}>
      {/* A barra e o menu são uma só zona de rato: sair dela (e só dela) fecha o
          menu. O fundo escurecido fica fora, para não contar como "dentro". */}
      <View style={styles.zonaRato} onPointerEnter={ficar} onPointerLeave={sair}>
      <View style={styles.barra}>
        <PadraoAzulejo altura={ALTURA} lado={48} linha={LINHA_PADRAO} fundo={ULTRA} style={StyleSheet.absoluteFill} />
        <View style={styles.interior}>
          {voltar ? (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={({ hovered }: { hovered?: boolean }) => [styles.icone, transicao, hovered && styles.iconeHover]}
            >
              <MaterialIcons name="arrow-back" size={22} color={TEXTO} />
            </Pressable>
          ) : null}
          <Link href="/" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="VotoClaro, início" style={styles.marca}>
              <MarcaClara />
            </Pressable>
          </Link>

          <View style={styles.nav} role="navigation" aria-label="Principal">
            {ITENS.map((item) => {
              const atual = item.id === ativo;
              const marca = item.id === marcado;
              const conteudo = (estado: { hovered?: boolean }) => (
                <View style={[styles.item, transicao, (estado.hovered || aberto === item.id) && styles.itemHover]}>
                  <Text style={[styles.itemTexto, marca && styles.itemTextoAtivo]}>{item.nome}</Text>
                  {item.menu ? (
                    <MaterialIcons
                      name="expand-more"
                      size={18}
                      color={marca ? TEXTO : TEXTO_SUAVE}
                      style={aberto === item.id ? styles.setaAberta : undefined}
                    />
                  ) : null}
                </View>
              );
              return (
                <View key={item.id} style={styles.celula}>
                  {item.menu ? (
                    <Pressable
                      ref={(r) => {
                        gatilhos.current[item.id as MenuId] = r;
                      }}
                      onPress={() => setAberto((a) => (a === item.id ? null : (item.id as MenuId)))}
                      onHoverIn={() => passarPor(item.id as MenuId)}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.nome}, abrir menu`}
                      aria-expanded={aberto === item.id}
                      aria-current={atual ? 'page' : undefined}
                    >
                      {conteudo}
                    </Pressable>
                  ) : (
                    <Link href={item.rota} asChild>
                      <Pressable accessibilityRole="link" aria-current={atual ? 'page' : undefined} onHoverIn={sair}>
                        {conteudo}
                      </Pressable>
                    </Link>
                  )}
                  {marca ? <Selo /> : null}
                </View>
              );
            })}
          </View>

          {compacta ? (
            <Link href="/deputados" asChild>
              <Pressable accessibilityRole="link" accessibilityLabel="Procurar deputado">
                {({ hovered }: { hovered?: boolean }) => (
                  <View style={[styles.icone, transicao, hovered && styles.iconeHover]}>
                    <MaterialIcons name="search" size={22} color={TEXTO} />
                  </View>
                )}
              </Pressable>
            </Link>
          ) : (
            <View style={styles.pesquisa}>
              <MaterialIcons name="search" size={18} color="#585D64" />
              <TextInput
                value={pesquisa}
                onChangeText={setPesquisa}
                onSubmitEditing={procurar}
                placeholder="Procurar deputado"
                placeholderTextColor="#585D64"
                accessibilityLabel="Procurar deputado por nome, partido ou círculo"
                style={styles.pesquisaInput}
                maxLength={60}
                returnKeyType="search"
              />
            </View>
          )}
          <Link href="/definicoes" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Definições">
              {({ hovered }: { hovered?: boolean }) => (
                <View style={[styles.icone, transicao, hovered && styles.iconeHover]}>
                  <MaterialIcons name="settings" size={21} color={TEXTO} />
                </View>
              )}
            </Pressable>
          </Link>
        </View>
      </View>

      {aberto ? (
        <View
          style={[fixo, styles.menu]}
          onPointerEnter={ficar}
          role="region"
          aria-label={`Menu ${ITENS.find((i) => i.id === aberto)?.nome}`}
        >
          <MenuAberto id={aberto} fechar={fechar} />
        </View>
      ) : null}
      </View>
      {/* O resto da página fica um pouco escurecido; um clique fora fecha. */}
      {aberto ? <Pressable style={[fixo, styles.fundo]} onPress={fechar} accessible={false} focusable={false} /> : null}
    </View>
  );
}

function MarcaClara() {
  return (
    <View style={styles.marcaInterior}>
      <View style={styles.logoFundo}>
        {/* O logótipo tal como é (imagem), num pequeno papel branco para se ler no azul. */}
        <LogoImagem />
      </View>
      <Text style={styles.palavra}>
        <Text style={styles.voto}>Voto</Text>Claro
      </Text>
    </View>
  );
}

const ICONE_LOGO = require('@/assets/brand/logo-icon-96.png');
function LogoImagem() {
  return <Image source={ICONE_LOGO} style={{ width: 26, height: 26 }} accessibilityIgnoresInvertColors />;
}

// O azulejo pendurado por baixo do separador ativo (ou do menu aberto).
function Selo() {
  return (
    <View style={[styles.selo, { pointerEvents: 'none' }]}>
      <AzulejoUnico tamanho={18} linha={ULTRA} fundo="#FFFFFF" />
    </View>
  );
}

function MenuAberto({ id, fechar }: { id: MenuId; fechar: () => void }) {
  if (id === 'votacoes') return <MenuVotacoes fechar={fechar} />;
  if (id === 'deputados') return <MenuDeputados fechar={fechar} />;
  return <MenuAprender fechar={fechar} />;
}

// Uma linha do menu: ícone (opcional), título e uma frase.
function Opcao({
  href,
  fechar,
  icone,
  titulo,
  frase,
  ponto,
  numero,
}: {
  href: Href;
  fechar: () => void;
  icone?: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  frase?: string;
  ponto?: string;
  numero?: number;
}) {
  const cores = useCores();
  return (
    <Link href={href} asChild>
      {/* Com Link asChild o estilo tem de ser fixo (um estilo-função perde-se);
          o hover desenha-se lá dentro. */}
      <Pressable onPress={fechar} accessibilityRole="link" style={styles.opcaoLigacao}>
        {({ hovered }: { hovered?: boolean }) => (
          <View
            style={[
              frase ? styles.opcaoGrande : styles.opcao,
              frase ? null : { borderBottomColor: cores.border },
              transicao,
              hovered && { backgroundColor: cores.surfaceAlt },
            ]}
          >
            {icone ? <MaterialIcons name={icone} size={21} color={cores.tintInk} /> : null}
            {ponto ? <View style={[styles.ponto, { backgroundColor: ponto }]} /> : null}
            <View style={styles.opcaoTextos}>
              <Text style={[styles.opcaoTitulo, { color: cores.text }]}>{titulo}</Text>
              {frase ? <Text style={[Typography.caption, { color: cores.textMuted }]}>{frase}</Text> : null}
            </View>
            {numero !== undefined ? <Text style={[styles.numero, { color: cores.textMuted }]}>{numero}</Text> : null}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Colunas({ children }: { children: React.ReactNode }) {
  const cores = useCores();
  return <View style={[styles.colunas, { borderColor: cores.border, backgroundColor: cores.surface }]}>{children}</View>;
}

function Coluna({ children, rotulo }: { children: React.ReactNode; rotulo?: string }) {
  const cores = useCores();
  return (
    <View style={[styles.coluna, { borderRightColor: cores.border }]}>
      {rotulo ? <Text style={[styles.rotulo, { color: cores.textMuted }]}>{rotulo}</Text> : null}
      {children}
    </View>
  );
}

function VerTodas({ href, texto, fechar }: { href: Href; texto: string; fechar: () => void }) {
  const cores = useCores();
  return (
    <Link href={href} asChild>
      <Pressable onPress={fechar} accessibilityRole="link" style={styles.verTodas}>
        <Text style={[styles.verTodasTexto, { color: cores.tintInk }]}>{texto}</Text>
        <MaterialIcons name="arrow-forward" size={18} color={cores.tintInk} />
      </Pressable>
    </Link>
  );
}

function MenuVotacoes({ fechar }: { fechar: () => void }) {
  const cores = useCores();
  const { itens } = useVotacoesFeed();
  const ultima = itens?.[0];
  return (
    <Colunas>
      <Coluna rotulo="Votações por tema">
        <View style={styles.grelha}>
          {TEMAS.map((t) => (
            <View key={t} style={styles.metade}>
              <Opcao href={{ pathname: '/', params: { tema: t } }} fechar={fechar} icone={ICONE_TEMA[t]} titulo={t} />
            </View>
          ))}
        </View>
      </Coluna>
      <Coluna rotulo="Última votação">
        {ultima ? (
          <Link
            href={{ pathname: '/votacao/[id]', params: { id: ultima.votacaoId, iniciativaId: String(ultima.iniciativaId) } }}
            asChild
          >
            <Pressable
              onPress={fechar}
              accessibilityRole="link"
              accessibilityLabel={`Última votação: ${ultima.iniciativa.titulo}, ${ultima.iniciativa.dataVoto}`}
              style={styles.opcaoLigacao}
            >
              {({ hovered }: { hovered?: boolean }) => (
                <View
                  style={[
                    styles.ultima,
                    { backgroundColor: cores.background, borderColor: hovered ? cores.tint : cores.border },
                    transicao,
                  ]}
                >
                  <Hemiciclo
                    favor={ultima.iniciativa.favor}
                    contra={ultima.iniciativa.contra}
                    abstencao={ultima.iniciativa.abstencao}
                    ausentes={ultima.iniciativa.ausentes}
                    resultado={ultima.iniciativa.resultado}
                    style={styles.ultimaHemiciclo}
                  />
                  <Text style={[styles.ultimaTitulo, { color: cores.text }]} numberOfLines={2}>
                    {ultima.iniciativa.titulo}
                  </Text>
                  <Text style={[Typography.caption, { color: cores.textMuted }]}>
                    {ultima.referencia} · {ultima.iniciativa.dataVoto}
                  </Text>
                  <LegendaVotos
                    favor={ultima.iniciativa.favor}
                    contra={ultima.iniciativa.contra}
                    abstencao={ultima.iniciativa.abstencao}
                    ausentes={ultima.iniciativa.ausentes}
                  />
                </View>
              )}
            </Pressable>
          </Link>
        ) : (
          <Text style={[Typography.bodySm, { color: cores.textMuted }]}>A carregar…</Text>
        )}
        <VerTodas href="/" texto="Ver todas as votações" fechar={fechar} />
      </Coluna>
    </Colunas>
  );
}

function MenuDeputados({ fechar }: { fechar: () => void }) {
  const cores = useCores();
  const { data } = useDeputados();
  const partidos = Object.entries(data?.lugaresPorPartido ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <Colunas>
      <Coluna rotulo="Grupos parlamentares">
        <View style={styles.grelha}>
          {partidos.map(([sigla, n]) => (
            <View key={sigla} style={styles.metade}>
              <Opcao
                href={{ pathname: '/deputados', params: { partido: sigla } }}
                fechar={fechar}
                ponto={getCorPartido(sigla)}
                titulo={sigla}
                numero={n}
              />
            </View>
          ))}
        </View>
        <Text style={[Typography.caption, styles.nota, { color: cores.textMuted }]}>
          Na Assembleia, os votos são registados por grupo parlamentar.
        </Text>
      </Coluna>
      <Coluna rotulo="Deputados">
        <Opcao
          href="/deputados"
          fechar={fechar}
          icone="groups"
          titulo={data ? `Todos os ${data.deputados.length} deputados` : 'Todos os deputados'}
          frase="Em funções na XVII legislatura"
        />
        <Opcao href="/comparar" fechar={fechar} icone="compare-arrows" titulo="Comparar dois partidos" frase="Com que frequência votam da mesma forma" />
      </Coluna>
    </Colunas>
  );
}

function MenuAprender({ fechar }: { fechar: () => void }) {
  const cores = useCores();
  return (
    <Colunas>
      <Coluna rotulo="Perceber o Parlamento">
        <Opcao href="/glossario" fechar={fechar} icone="menu-book" titulo="Glossário" frase="Os termos do processo legislativo, explicados de forma simples" />
        <Opcao
          href={{ pathname: '/glossario', params: { termo: 'Abstenção' } }}
          fechar={fechar}
          icone="help-outline"
          titulo="O que é uma abstenção?"
          frase="Votar sem ser a favor nem contra"
        />
        <Opcao
          href={{ pathname: '/glossario', params: { termo: 'Lei' } }}
          fechar={fechar}
          icone="article"
          titulo="Projeto de Lei ou Proposta de Lei?"
          frase="Quem apresenta cada tipo de iniciativa"
        />
      </Coluna>
      <Coluna rotulo="Sobre o VotoClaro">
        <Text style={[Typography.bodySm, styles.sobre, { color: cores.text }]}>
          O VotoClaro mostra como votou cada partido nas iniciativas da Assembleia da República. É apartidário: mostra
          factos, não opiniões, e nunca recomenda em quem votar.
        </Text>
        <Opcao href="/definicoes" fechar={fechar} icone="info-outline" titulo="Sobre os dados" frase="De onde vêm e o que mostram" />
      </Coluna>
    </Colunas>
  );
}

const styles = StyleSheet.create({
  zona: {
    zIndex: 20,
  },
  // No react-native-web cada View tem z-index 0 (é um contexto de empilhamento):
  // esta zona tem de ficar acima do fundo escurecido (18), senão o menu fica
  // por baixo dele e o rato nunca lhe chega.
  zonaRato: {
    zIndex: 19,
  },
  barra: {
    height: ALTURA,
    backgroundColor: ULTRA,
    zIndex: 21,
  },
  interior: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH_LARGO + Spacing.lg * 2,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  marca: {
    marginRight: Spacing.lg,
  },
  marcaInterior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoFundo: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  palavra: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: -0.3,
    color: TEXTO,
  },
  voto: {
    fontFamily: Fonts.black,
  },
  nav: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  celula: {
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  // Cada item tem um fundo ultramarino cheio, para o texto não ficar por
  // cima das linhas do azulejo.
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.chip,
    backgroundColor: 'rgba(18,10,143,0.9)',
  },
  itemHover: {
    backgroundColor: '#231A9E',
  },
  itemTexto: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: TEXTO_SUAVE,
  },
  itemTextoAtivo: {
    fontFamily: Fonts.bold,
    color: TEXTO,
  },
  setaAberta: {
    transform: [{ rotate: '180deg' }],
  },
  selo: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    zIndex: 30,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: Radii.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeHover: {
    backgroundColor: '#231A9E',
  },
  pesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    height: 40,
    width: 240,
  },
  pesquisaInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#232323',
    height: '100%',
  },
  fundo: {
    top: ALTURA,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(35,35,35,0.28)',
    zIndex: 18,
  },
  menu: {
    top: ALTURA,
    left: 0,
    right: 0,
    zIndex: 19,
  },
  colunas: {
    width: '100%',
    maxWidth: MAX_WIDTH_LARGO + Spacing.lg * 2,
    alignSelf: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: Radii.card,
    borderBottomRightRadius: Radii.card,
    overflow: 'hidden',
  },
  coluna: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    borderRightWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-start',
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  grelha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.lg,
  },
  metade: {
    width: '47%',
    flexGrow: 1,
  },
  opcaoLigacao: {
    display: 'flex',
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 11,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  opcaoGrande: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.card,
  },
  opcaoTextos: {
    flex: 1,
    gap: 2,
  },
  opcaoTitulo: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
  },
  ponto: {
    width: 9,
    height: 9,
    borderRadius: 9,
  },
  numero: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  nota: {
    marginTop: Spacing.md,
  },
  ultima: {
    borderWidth: 1,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: 4,
  },
  ultimaHemiciclo: {
    maxWidth: 200,
    marginBottom: Spacing.sm,
  },
  ultimaTitulo: {
    fontFamily: Fonts.black,
    fontSize: 18,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  verTodas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
  verTodasTexto: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  sobre: {
    marginBottom: Spacing.md,
    maxWidth: 420,
  },
});
