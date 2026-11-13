import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao, useCores } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { citacoes, formatarResposta, urlOficial, type Fonte } from '@/lib/perguntar';

// Resposta do assistente: texto com **negrito**, listas e citações numeradas
// [1] que remetem para a lista de fontes por baixo. Nada é interpretado como
// HTML; o texto do modelo é sempre mostrado como texto.
//
// Quando o backend resolveu a citação (fontes), o número e a fonte são
// tocáveis: uma votação abre o ecrã dessa votação; um artigo ou secção abre
// o excerto citado, com ligação ao documento oficial.
export function RespostaRag({ texto, fontes: resolvidas = [] }: { texto: string; fontes?: Fonte[] }) {
  const cores = useCores();
  const router = useRouter();
  const [aberta, setAberta] = useState<Fonte | null>(null);
  const paragrafos = useMemo(() => formatarResposta(texto), [texto]);
  const fontes = useMemo(() => citacoes(texto), [texto]);
  const porCitacao = useMemo(() => new Map(resolvidas.map((f) => [f.citacao, f])), [resolvidas]);

  const abrir = (f: Fonte) => {
    if (f.votacaoId && !f.secao) {
      router.push({ pathname: '/votacao/[id]', params: { id: String(f.votacaoId), iniciativaId: String(f.iniciativaId) } });
    } else {
      setAberta(f);
    }
  };

  return (
    <View>
      {paragrafos.map((p, i) => (
        <View key={i} style={[styles.paragrafo, p.item && styles.item]}>
          {p.item ? <Text style={[Typography.bodyLg, { color: cores.textMuted }]}>•</Text> : null}
          <Text style={[Typography.bodyLg, styles.texto, { color: cores.text }]}>
            {p.pedacos.map((q, j) => {
              if (q.tipo !== 'citacao') {
                return (
                  <Text key={j} style={q.negrito ? styles.negrito : undefined}>
                    {q.texto}
                  </Text>
                );
              }
              const n = fontes.indexOf(q.texto) + 1;
              const f = porCitacao.get(q.texto);
              return (
                <Text
                  key={j}
                  style={[styles.numero, { color: cores.tintInk }, f && styles.ligacao]}
                  onPress={f ? () => abrir(f) : undefined}
                  accessibilityRole={f ? 'link' : undefined}
                  accessibilityLabel={`fonte ${n}: ${q.texto}`}
                >
                  {' '}[{n}]
                </Text>
              );
            })}
          </Text>
        </View>
      ))}

      {fontes.length > 0 ? (
        <View style={[styles.fontes, { borderTopColor: cores.border }]} accessibilityLabel="Fontes">
          <Text style={[Typography.label, { color: cores.text }]} accessibilityRole="header">
            Fontes
          </Text>
          {fontes.map((c, i) => {
            const f = porCitacao.get(c);
            const conteudo = (
              <>
                <View style={[styles.fonteNumero, { backgroundColor: cores.tintBg }]}>
                  <Text style={[styles.fonteNumeroTexto, { color: cores.tintInk }]}>{i + 1}</Text>
                </View>
                <Text style={[Typography.bodySm, styles.texto, { color: f ? cores.tintInk : cores.text }, f && styles.ligacao]}>
                  {c}
                </Text>
                {f ? (
                  <MaterialIcons
                    name={f.votacaoId && !f.secao ? 'how-to-vote' : 'chevron-right'}
                    size={18}
                    color={cores.textMuted}
                    accessible={false}
                  />
                ) : null}
              </>
            );
            return f ? (
              <Pressable
                key={c}
                onPress={() => abrir(f)}
                accessibilityRole="link"
                accessibilityLabel={`Abrir fonte ${i + 1}: ${c}`}
                style={({ pressed }) => [styles.fonte, pressed && styles.premido]}
              >
                {conteudo}
              </Pressable>
            ) : (
              <View key={c} style={styles.fonte}>
                {conteudo}
              </View>
            );
          })}
        </View>
      ) : null}

      <FonteDetalhe
        fonte={aberta}
        onFechar={() => setAberta(null)}
        onVerVotacao={(f) => {
          setAberta(null);
          router.push({ pathname: '/votacao/[id]', params: { id: String(f.votacaoId), iniciativaId: String(f.iniciativaId) } });
        }}
      />
    </View>
  );
}

function abrirUrl(u: string | null) {
  const seguro = urlOficial(u);
  if (seguro) Linking.openURL(seguro).catch(() => undefined);
}

// Painel com a parte citada: referência, secção e o texto dessa secção.
function FonteDetalhe({
  fonte,
  onFechar,
  onVerVotacao,
}: {
  fonte: Fonte | null;
  onFechar: () => void;
  onVerVotacao: (f: Fonte) => void;
}) {
  const cores = useCores();
  return (
    <Modal visible={!!fonte} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar fonte">
        {fonte ? (
          <Pressable
            style={[styles.painel, { backgroundColor: cores.surface, borderColor: cores.rule }]}
            onPress={() => undefined}
            accessibilityViewIsModal
          >
            <View style={styles.painelTopo}>
              <View style={styles.texto}>
                {fonte.titulo ? (
                  <Text style={[Typography.title, { color: cores.text }]} accessibilityRole="header">
                    {fonte.titulo}
                  </Text>
                ) : null}
                <Text style={[Typography.caption, { color: cores.textMuted }]}>
                  {fonte.referencia}
                  {fonte.secao ? ` · ${fonte.secao}` : ''}
                </Text>
              </View>
              <Pressable onPress={onFechar} accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12}>
                <MaterialIcons name="close" size={22} color={cores.textMuted} />
              </Pressable>
            </View>

            {fonte.excerto ? (
              <ScrollView
                style={[styles.excerto, { backgroundColor: cores.surfaceAlt, borderLeftColor: cores.tint }]}
                contentContainerStyle={styles.excertoConteudo}
              >
                {fonte.secao ? (
                  <Text style={[Typography.bodySm, styles.negrito, { color: cores.text }]}>{fonte.secao}</Text>
                ) : null}
                <Text style={[Typography.bodySm, { color: cores.text }]} selectable>
                  {fonte.excerto}
                </Text>
              </ScrollView>
            ) : (
              <Text style={[Typography.bodySm, { color: cores.textMuted }]}>
                {fonte.secao
                  ? `Não temos o texto de ${fonte.secao} guardado. Consulta o documento oficial.`
                  : 'Consulta a iniciativa no site do Parlamento.'}
              </Text>
            )}

            <View style={styles.acoes}>
              {fonte.votacaoId ? (
                <Botao label="Ver votação" icone="how-to-vote" onPress={() => onVerVotacao(fonte)} />
              ) : null}
              {fonte.urlDocumento ? (
                <Botao
                  label="Abrir documento oficial"
                  icone="description"
                  variante={fonte.votacaoId ? 'secundario' : 'primario'}
                  onPress={() => abrirUrl(fonte.urlDocumento)}
                  accessibilityHint="Abre o texto da iniciativa no site do Parlamento"
                />
              ) : null}
              {fonte.urlIniciativa ? (
                <Botao
                  label="Página da iniciativa"
                  icone="open-in-new"
                  variante="secundario"
                  onPress={() => abrirUrl(fonte.urlIniciativa)}
                  accessibilityHint="Abre a página da iniciativa no site do Parlamento"
                />
              ) : null}
            </View>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  paragrafo: {
    marginBottom: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  texto: {
    flex: 1,
  },
  negrito: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  numero: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    fontSize: 13,
  },
  ligacao: {
    textDecorationLine: 'underline',
  },
  fontes: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  fonte: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  premido: {
    opacity: 0.6,
  },
  fonteNumero: {
    minWidth: 22,
    height: 22,
    borderRadius: Radii.badge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fonteNumeroTexto: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  painel: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.sheet,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  painelTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  excerto: {
    borderLeftWidth: 3,
    borderRadius: Radii.chip,
    flexShrink: 1,
  },
  excertoConteudo: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  acoes: {
    gap: Spacing.sm,
  },
});
