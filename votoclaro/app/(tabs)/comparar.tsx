import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EcraVazio } from '@/components/EcraVazio';
import { LinhaOpcoes } from '@/components/LinhaOpcoes';
import { PartidoBar } from '@/components/PartidoBar';
import { Aviso, CabecalhoEcra, Cartao, Chip, Contentor, TituloSecao, useCores } from '@/components/ui';
import { VotoIndicator } from '@/components/VotoIndicator';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { useDeputados } from '@/hooks/useDeputados';
import { usePartidoStats } from '@/hooks/usePartidoStats';
import { concordancia, rankingFavor } from '@/lib/comparar';

const MAX_DIVERGENCIAS = 8;

export default function CompararScreen() {
  const cores = useCores();
  const router = useRouter();
  const stats = usePartidoStats();
  const deputados = useDeputados();

  // Partidos atuais, do maior para o menor grupo parlamentar.
  const partidos = useMemo(
    () =>
      Object.entries(deputados.data?.lugaresPorPartido ?? {})
        .sort((a, b) => b[1] - a[1])
        .map(([p]) => p),
    [deputados.data]
  );
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const partidoA = a ?? partidos[0];
  const partidoB = b ?? partidos[1];

  const resultado = useMemo(() => {
    const h = stats.data?.historicoPorPartido;
    if (!h || !partidoA || !partidoB || partidoA === partidoB) return null;
    return concordancia(h[partidoA] ?? [], h[partidoB] ?? []);
  }, [stats.data, partidoA, partidoB]);

  const ranking = useMemo(() => (stats.data ? rankingFavor(stats.data.stats, partidos) : []), [stats.data, partidos]);

  const carregando = stats.isLoading || deputados.isLoading;
  const erro = stats.isError || deputados.isError;

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Contentor>
          <CabecalhoEcra
            titulo="Comparar"
            subtitulo="Com que frequência dois partidos votam da mesma forma."
          />

          {carregando ? (
            <View style={styles.carregar}>
              <ActivityIndicator color={cores.tint} />
              <Text style={[Typography.caption, { color: cores.textMuted }]}>A juntar todas as votações da legislatura…</Text>
            </View>
          ) : erro ? (
            <EcraVazio
              icone="cloud-off"
              titulo="Não foi possível carregar"
              descricao="Verifica a tua ligação à internet e tenta de novo."
              accao={{ label: 'Tentar de novo', onPress: () => (stats.refetch(), deputados.refetch()) }}
            />
          ) : (
            <>
              <SeletorPartido rotulo="Partido A" partidos={partidos} selecionado={partidoA} outro={partidoB} onSelecionar={setA} />
              <SeletorPartido rotulo="Partido B" partidos={partidos} selecionado={partidoB} outro={partidoA} onSelecionar={setB} />

              {resultado && resultado.percentagem !== null ? (
                <>
                  <Cartao tinta style={styles.destaque}>
                    <View style={styles.duelo}>
                      <Sigla partido={partidoA} />
                      <Text style={[Typography.bodySm, { color: cores.textMuted }]}>e</Text>
                      <Sigla partido={partidoB} />
                    </View>
                    <Text
                      style={[Typography.displaySm, styles.frase, { color: cores.text }]}
                      accessibilityLabel={`Votaram da mesma forma em ${resultado.percentagem}% das votações`}
                    >
                      Votaram da mesma forma em <Text style={[styles.percentagem, { color: cores.tintInk }]}>{resultado.percentagem}%</Text> das votações.
                    </Text>
                    <View style={[styles.trilho, { backgroundColor: cores.border }]}>
                      <View style={[styles.preenchido, { width: `${resultado.percentagem}%`, backgroundColor: cores.tint }]} />
                    </View>
                    <Text style={[Typography.caption, styles.escala, { color: cores.textMuted }]}>
                      {resultado.iguais} de {resultado.comparaveis} votações em que os dois estiveram presentes.
                    </Text>
                  </Cartao>

                  <TituloSecao nota="Percentagem de votações com a mesma posição, por tema.">Por tema</TituloSecao>
                  <Cartao>
                    {resultado.porTema.map((t) => (
                      <View key={t.tema} style={styles.temaLinha} accessible accessibilityLabel={`${t.tema}: ${t.percentagem}% em ${t.comparaveis} votações`}>
                        <Text style={[Typography.label, styles.temaNome, { color: cores.text }]}>{t.tema}</Text>
                        <View style={[styles.temaTrilho, { backgroundColor: cores.border }]}>
                          <View style={[styles.temaBarra, { width: `${Math.max(t.percentagem, 1)}%`, backgroundColor: cores.tint }]} />
                        </View>
                        <Text style={[Typography.label, styles.temaValor, { color: cores.text }]}>{t.percentagem}%</Text>
                        <Text style={[Typography.caption, styles.temaN, { color: cores.textMuted }]} numberOfLines={1}>
                          {t.comparaveis}
                        </Text>
                      </View>
                    ))}
                  </Cartao>

                  {resultado.divergencias.length > 0 ? (
                    <>
                      <TituloSecao nota="As votações mais recentes em que tomaram posições diferentes.">Onde divergiram</TituloSecao>
                      <Cartao style={styles.semPadding}>
                        {resultado.divergencias.slice(0, MAX_DIVERGENCIAS).map((d, i) => (
                          <Pressable
                            key={d.votacaoId}
                            onPress={() => router.push({ pathname: '/votacao/[id]', params: { id: d.votacaoId, iniciativaId: String(d.iniciativaId) } })}
                            style={({ pressed }) => [
                              styles.divergencia,
                              i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth },
                              pressed && { opacity: 0.7 },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`${d.titulo}. ${partidoA}: ${d.posicaoA}. ${partidoB}: ${d.posicaoB}`}
                          >
                            <View style={styles.divergenciaInfo}>
                              <Text style={[Typography.bodySm, { color: cores.text }]} numberOfLines={2}>
                                {d.titulo}
                              </Text>
                              <Text style={[Typography.caption, { color: cores.textMuted }]}>
                                {d.tema} · {d.dataVoto}
                              </Text>
                            </View>
                            <View style={styles.posicoes}>
                              <PosicaoPartido partido={partidoA} posicao={d.posicaoA} />
                              <PosicaoPartido partido={partidoB} posicao={d.posicaoB} />
                            </View>
                          </Pressable>
                        ))}
                      </Cartao>
                    </>
                  ) : null}
                </>
              ) : null}

              <TituloSecao nota="Percentagem de votos a favor nas votações em que cada partido esteve presente.">
                Quem vota mais a favor
              </TituloSecao>
              <Cartao>
                {ranking.map((r) => (
                  <PartidoBar key={r.partido} partido={r.partido} percentagem={r.percFavor} legenda="a favor" />
                ))}
              </Cartao>

              <View style={styles.aviso}>
                <Aviso>
                  Comparação feita com todas as votações em plenário da XVII legislatura. Votar da mesma forma não quer
                  dizer concordar em tudo — quer dizer que, nestas votações, a posição foi igual.
                </Aviso>
              </View>
            </>
          )}
        </Contentor>
      </ScrollView>
    </SafeAreaView>
  );
}

function SeletorPartido({
  rotulo,
  partidos,
  selecionado,
  outro,
  onSelecionar,
}: {
  rotulo: string;
  partidos: string[];
  selecionado?: string;
  outro?: string;
  onSelecionar: (p: string) => void;
}) {
  const cores = useCores();
  return (
    <View style={styles.seletor}>
      <Text style={[Typography.label, { color: cores.textMuted }]}>{rotulo}</Text>
      <LinhaOpcoes>
        {partidos
          .filter((p) => p !== outro)
          .map((p) => (
            <Chip key={p} label={p} cor={getCorPartido(p)} selecionado={p === selecionado} onPress={() => onSelecionar(p)} accessibilityLabel={`${rotulo}: ${p}`} />
          ))}
      </LinhaOpcoes>
    </View>
  );
}

function Sigla({ partido }: { partido: string }) {
  const cores = useCores();
  return (
    <View style={[styles.sigla, { borderColor: cores.rule }]}>
      <View style={[styles.ponto, { backgroundColor: getCorPartido(partido) }]} />
      <Text style={[styles.siglaTexto, { color: cores.text }]}>{partido}</Text>
    </View>
  );
}

function PosicaoPartido({ partido, posicao }: { partido: string; posicao: Parameters<typeof VotoIndicator>[0]['posicao'] }) {
  const cores = useCores();
  return (
    <View style={styles.posicao}>
      <Text style={[Typography.caption, styles.posicaoSigla, { color: cores.textMuted }]}>{partido}</Text>
      <VotoIndicator posicao={posicao} size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  ecra: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  carregar: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.huge,
  },
  seletor: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  chips: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  destaque: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  duelo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sigla: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: Radii.chip,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  siglaTexto: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  percentagem: {
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  frase: {
    marginTop: Spacing.md,
  },
  escala: {
    marginTop: Spacing.sm,
  },
  centrado: {
    textAlign: 'center',
  },
  trilho: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  preenchido: {
    height: '100%',
  },
  temaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  temaNome: {
    width: 88,
  },
  temaTrilho: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  temaBarra: {
    height: '100%',
  },
  temaValor: {
    width: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  temaN: {
    width: 44,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  semPadding: {
    paddingVertical: 0,
  },
  divergencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  divergenciaInfo: {
    flex: 1,
    gap: 2,
  },
  posicoes: {
    gap: 4,
  },
  posicao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  posicaoSigla: {
    fontFamily: Fonts.semibold,
  },
  aviso: {
    marginTop: Spacing.xxl,
  },
});
