// O boletim completo de uma votação: uma linha por partido, uma coluna por
// posição, e o ✕ desenhado na caixa da posição que o partido tomou.
// Ver DESIGN.md › Boletim.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Cartao, MarcaX, useCores } from '@/components/ui';
import { ROTULO } from '@/components/VotoIndicator';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import type { Posicao } from '@/types';

const COLUNAS: Posicao[] = ['favor', 'contra', 'abstencao', 'ausente'];
const CURTO: Record<Posicao, string> = { favor: 'A favor', contra: 'Contra', abstencao: 'Abst.', ausente: 'Ausente' };

export function BoletimCompleto({
  posicaoPorPartido,
  lugares,
}: {
  posicaoPorPartido: Map<string, Posicao>;
  lugares: Record<string, number>;
}) {
  const cores = useCores();
  const partidos = [...posicaoPorPartido.keys()].sort((a, b) => (lugares[b] ?? 0) - (lugares[a] ?? 0) || a.localeCompare(b));

  return (
    <Cartao tinta style={styles.cartao}>
      <View style={[styles.linha, styles.cabecalho, { borderBottomColor: cores.rule }]}>
        <Text style={[Typography.eyebrow, styles.cabecalhoTexto, styles.colPartido, { color: cores.textMuted }]}>Partido</Text>
        {COLUNAS.map((c) => (
          <Text key={c} style={[Typography.eyebrow, styles.cabecalhoTexto, styles.col, { color: cores.textMuted }]} numberOfLines={1}>
            {CURTO[c]}
          </Text>
        ))}
      </View>
      {partidos.map((p, i) => {
        const posicao = posicaoPorPartido.get(p) ?? 'ausente';
        return (
          <View
            key={p}
            style={[styles.linha, i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth }]}
            accessible
            accessibilityLabel={`${p}, ${lugares[p] ?? 0} deputados: ${ROTULO[posicao]}`}
          >
            <View style={[styles.colPartido, styles.partido]}>
              <View style={[styles.ponto, { backgroundColor: getCorPartido(p) }]} />
              <Text style={[styles.sigla, { color: cores.text }]}>{p}</Text>
              {lugares[p] ? <Text style={[Typography.caption, { color: cores.textMuted }]}>{lugares[p]}</Text> : null}
            </View>
            {COLUNAS.map((c) => (
              <View key={c} style={styles.col}>
                <MarcaX marcado={posicao === c} tamanho={22} animar />
              </View>
            ))}
          </View>
        );
      })}
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    padding: 0,
    paddingHorizontal: Spacing.lg,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  cabecalho: {
    minHeight: 40,
    borderBottomWidth: 1.5,
  },
  cabecalhoTexto: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  colPartido: {
    flex: 1.6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  partido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ponto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  sigla: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
});
