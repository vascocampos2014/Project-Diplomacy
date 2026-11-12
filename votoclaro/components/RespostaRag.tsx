import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import { citacoes, formatarResposta } from '@/lib/perguntar';

// Resposta do assistente: texto com **negrito**, listas e citações numeradas
// [1] que remetem para a lista de fontes por baixo. Nada é interpretado como
// HTML; o texto do modelo é sempre mostrado como texto.
export function RespostaRag({ texto }: { texto: string }) {
  const cores = useCores();
  const paragrafos = useMemo(() => formatarResposta(texto), [texto]);
  const fontes = useMemo(() => citacoes(texto), [texto]);

  return (
    <View>
      {paragrafos.map((p, i) => (
        <View key={i} style={[styles.paragrafo, p.item && styles.item]}>
          {p.item ? <Text style={[Typography.bodyLg, { color: cores.textMuted }]}>•</Text> : null}
          <Text style={[Typography.bodyLg, styles.texto, { color: cores.text }]}>
            {p.pedacos.map((q, j) =>
              q.tipo === 'citacao' ? (
                <Text
                  key={j}
                  style={[styles.numero, { color: cores.tintInk }]}
                  accessibilityLabel={`fonte ${fontes.indexOf(q.texto) + 1}: ${q.texto}`}
                >
                  {' '}[{fontes.indexOf(q.texto) + 1}]
                </Text>
              ) : (
                <Text key={j} style={q.negrito ? styles.negrito : undefined}>
                  {q.texto}
                </Text>
              )
            )}
          </Text>
        </View>
      ))}

      {fontes.length > 0 ? (
        <View style={[styles.fontes, { borderTopColor: cores.border }]} accessibilityLabel="Fontes">
          <Text style={[Typography.eyebrow, { color: cores.textMuted }]}>FONTES</Text>
          {fontes.map((f, i) => (
            <View key={f} style={styles.fonte}>
              <View style={[styles.fonteNumero, { backgroundColor: cores.tintBg }]}>
                <Text style={[styles.fonteNumeroTexto, { color: cores.tintInk }]}>{i + 1}</Text>
              </View>
              <Text style={[Typography.bodySm, styles.texto, { color: cores.text }]}>{f}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
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
});
