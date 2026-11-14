import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaixaAzulejo } from '@/components/Azulejo';
import { EcraVazio } from '@/components/EcraVazio';
import { anim, CabecalhoEcra, CampoPesquisa, Contentor, transicao, useCores, useDisposicao } from '@/components/ui';
import { GlossarioItem } from '@/components/GlossarioItem';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { normalizar } from '@/lib/deputados';
import { GLOSSARIO, type TermoGlossario } from '@/lib/glossarioData';

export default function GlossarioScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  // ?termo=… (vindo de uma votação, p. ex. "Proposta de Lei") abre o glossário já filtrado.
  const { termo: termoInicial } = useLocalSearchParams<{ termo?: string }>();
  const [pesquisa, setPesquisa] = useState(() => (typeof termoInicial === 'string' ? termoInicial.slice(0, 60) : ''));

  const termos = useMemo(() => {
    const termo = normalizar(pesquisa);
    const lista = termo
      ? GLOSSARIO.filter((item) => normalizar(item.termo).includes(termo) || normalizar(item.definicao).includes(termo))
      : GLOSSARIO;
    return [...lista].sort((a, b) => a.termo.localeCompare(b.termo, 'pt'));
  }, [pesquisa]);

  const { desktop } = useDisposicao();
  if (desktop) return <GlossarioComputador pesquisa={pesquisa} setPesquisa={setPesquisa} termos={termos} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Glossário' }} />
      <FaixaAzulejo altura={14} />
      <Contentor style={styles.header}>
        <CabecalhoEcra titulo="Glossário" subtitulo="Termos comuns do processo legislativo, explicados de forma simples." />
        <CampoPesquisa
          valor={pesquisa}
          onMudar={setPesquisa}
          placeholder="Procurar termo…"
          accessibilityLabel="Procurar termo no glossário"
          accessibilityHint="Filtra a lista por termo ou definição"
        />
      </Contentor>
      <FlatList
        data={termos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <Contentor>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          </Contentor>
        )}
        renderItem={({ item }) => (
          <Contentor>
            <GlossarioItem termo={item.termo} definicao={item.definicao} />
          </Contentor>
        )}
        ListEmptyComponent={
          <EcraVazio icone="search-off" titulo="Nenhum resultado" descricao="Tenta com outra palavra." />
        }
      />
    </SafeAreaView>
  );
}

// O percurso de uma lei, em cinco passos; cada um abre o termo no glossário.
const PASSOS: { termo: string; rotulo: string; frase: string }[] = [
  { termo: 'Projeto de Lei', rotulo: 'Projeto ou Proposta de Lei', frase: 'o texto entra no Parlamento' },
  { termo: 'Votação na Generalidade', rotulo: 'Votação na Generalidade', frase: 'a ideia geral avança?' },
  { termo: 'Votação na Especialidade', rotulo: 'Votação na Especialidade', frase: 'artigo a artigo, em comissão' },
  { termo: 'Votação Final Global', rotulo: 'Votação Final Global', frase: 'aprovada na totalidade?' },
  { termo: 'Promulgação', rotulo: 'Promulgação', frase: 'o Presidente da República assina' },
];

// Computador: o percurso de uma lei no topo, a pesquisa e o índice A–Z, e os
// termos agrupados por letra em duas colunas.
function GlossarioComputador({
  pesquisa,
  setPesquisa,
  termos,
}: {
  pesquisa: string;
  setPesquisa: (t: string) => void;
  termos: TermoGlossario[];
}) {
  const cores = useCores();
  const [letra, setLetra] = useState<string | null>(null);
  const inicial = (t: string) => normalizar(t[0]).toUpperCase();
  const letras = useMemo(() => [...new Set(GLOSSARIO.map((t) => inicial(t.termo)))].sort(), []);
  const visiveis = termos.filter((t) => !letra || inicial(t.termo) === letra);
  const grupos = new Map<string, TermoGlossario[]>();
  for (const t of visiveis) grupos.set(inicial(t.termo), [...(grupos.get(inicial(t.termo)) ?? []), t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Glossário' }} />
      <ScrollView contentContainerStyle={styles.paginaComputador} keyboardShouldPersistTaps="handled">
        <Contentor largo style={styles.margensComputador}>
          <View {...anim('pagina')}>
            <CabecalhoEcra titulo="Glossário" subtitulo="Termos comuns do processo legislativo, explicados de forma simples." />
            <Text style={[styles.rotulo, { color: cores.textMuted }]}>Como nasce uma lei</Text>
            <View style={styles.passos}>
              {PASSOS.map((p, i) => (
                <Pressable
                  key={p.termo}
                  onPress={() => (setLetra(null), setPesquisa(p.termo))}
                  accessibilityRole="button"
                  accessibilityLabel={`Passo ${i + 1}: ${p.rotulo}, ${p.frase}. Mostra o termo`}
                  style={({ hovered }: { hovered?: boolean }) => [
                    styles.passo,
                    transicao,
                    { backgroundColor: cores.surface, borderColor: pesquisa === p.termo ? cores.tint : hovered ? cores.tint : cores.border },
                    pesquisa === p.termo && styles.passoAtivo,
                  ]}
                >
                  <View style={[styles.passoNumero, { backgroundColor: pesquisa === p.termo ? cores.tint : cores.surfaceAlt }]}>
                    <Text style={[styles.passoNumeroTexto, { color: pesquisa === p.termo ? cores.onTint : cores.text }]}>{i + 1}</Text>
                  </View>
                  <Text style={[Typography.bodySm, styles.passoTitulo, { color: cores.text }]}>{p.rotulo}</Text>
                  <Text style={[Typography.caption, { color: cores.textMuted }]}>{p.frase}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.barraPesquisa}>
              <View style={styles.pesquisaLarga}>
                <CampoPesquisa
                  valor={pesquisa}
                  onMudar={(t) => (setLetra(null), setPesquisa(t))}
                  placeholder="Procurar um termo…"
                  accessibilityLabel="Procurar termo no glossário"
                  accessibilityHint="Filtra a lista por termo ou definição"
                />
              </View>
              <View style={styles.abc} accessibilityRole="list" aria-label="Índice alfabético">
                {letras.map((l) => (
                  <Pressable
                    key={l}
                    onPress={() => (setPesquisa(''), setLetra(letra === l ? null : l))}
                    accessibilityRole="button"
                    accessibilityState={{ selected: letra === l }}
                    aria-pressed={letra === l}
                    accessibilityLabel={`Termos começados por ${l}`}
                    style={({ hovered }: { hovered?: boolean }) => [
                      styles.letra,
                      transicao,
                      { borderColor: cores.border, backgroundColor: letra === l ? cores.tint : hovered ? cores.tintBg : cores.surface },
                    ]}
                  >
                    <Text style={[styles.letraTexto, { color: letra === l ? cores.onTint : cores.tintInk }]}>{l}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {visiveis.length === 0 ? (
            <EcraVazio icone="search-off" titulo="Nenhum resultado" descricao="Tenta com outra palavra." />
          ) : (
            [...grupos.entries()].map(([l, lista]) => (
              <View key={l} style={[styles.grupoLetra, { borderTopColor: cores.border }]}>
                <Text style={[styles.letraGrande, { color: cores.tintInk }]} aria-hidden>
                  {l}
                </Text>
                <View style={styles.termosGrelha}>
                  {lista.map((t) => (
                    <View key={t.id} style={styles.termoCelula}>
                      <GlossarioItem termo={t.termo} definicao={t.definicao} />
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </Contentor>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  descricao: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.chip,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontFamily: 'PublicSans_400Regular',
    fontSize: Typography.bodyLg.fontSize,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  paginaComputador: {
    paddingBottom: Spacing.huge,
  },
  margensComputador: {
    paddingHorizontal: Spacing.lg,
  },
  rotulo: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  passos: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  passo: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.chip,
    padding: Spacing.md,
    gap: 2,
  },
  passoAtivo: {
    borderWidth: 2,
  },
  passoNumero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  passoNumeroTexto: {
    fontFamily: Fonts.black,
    fontSize: 12,
  },
  passoTitulo: {
    fontFamily: Fonts.bold,
  },
  barraPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
  },
  pesquisaLarga: {
    width: 340,
  },
  abc: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  letra: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraTexto: {
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  grupoLetra: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  letraGrande: {
    width: 64,
    fontFamily: Fonts.black,
    fontSize: 48,
    lineHeight: 56,
  },
  termosGrelha: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.xxxl,
  },
  termoCelula: {
    width: '47%',
  },
});
