// O boletim de uma votação no feed — ver DESIGN.md › Boletim.
// Título primeiro, depois a referência; carimbo e contagem; a barra dos 230
// lugares; e três linhas de boletim (a favor / contra / abstenção) com a
// caixa marcada a ✕ e os partidos que votaram assim.
import type { Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarraProgresso } from '@/components/BarraProgresso';
import { ContagemVotos, ResultadoBadge } from '@/components/ContagemVotos';
import { Cartao, MarcaX, useCores } from '@/components/ui';
import { getCorPartido } from '@/constants/CORES_PARTIDOS';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import type { PartidosPorPosicao } from '@/lib/feed';
import type { Resultado } from '@/types';

interface VotacaoCardProps {
  titulo: string;
  referencia?: string;
  tema: string;
  data: string;
  resultado: Resultado;
  favor: number;
  contra: number;
  abstencao: number;
  ausentes: number;
  partidos?: PartidosPorPosicao;
  onPress?: () => void;
  href?: Href;
}

const RESULTADO_A11Y: Record<Resultado, string> = { aprovada: 'Aprovada', chumbada: 'Chumbada', pendente: 'Pendente' };

const LINHAS: { chave: keyof PartidosPorPosicao; rotulo: string }[] = [
  { chave: 'favor', rotulo: 'A favor' },
  { chave: 'contra', rotulo: 'Contra' },
  { chave: 'abstencao', rotulo: 'Abstenção' },
];

export function VotacaoCard({
  titulo,
  referencia,
  tema,
  data,
  resultado,
  favor,
  contra,
  abstencao,
  ausentes,
  partidos,
  onPress,
  href,
}: VotacaoCardProps) {
  const cores = useCores();
  const total = favor + contra + abstencao + ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <Cartao
      onPress={onPress}
      href={href}
      tinta
      style={styles.cartao}
      accessibilityLabel={`${titulo}, ${referencia ? `${referencia}, ` : ''}${tema}, ${data}, ${RESULTADO_A11Y[resultado]}`}
      accessibilityHint="Abre o boletim completo da votação"
    >
      <View style={styles.cabeca}>
        <Text style={[Typography.title, { color: cores.text }]} numberOfLines={3}>
          {titulo}
        </Text>
        <View style={styles.meta}>
          {referencia ? (
            <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
              {referencia}
            </Text>
          ) : null}
          <Text style={[Typography.caption, { color: cores.textMuted }]}>{tema}</Text>
          <Text style={[Typography.caption, { color: cores.textMuted }]}>{data}</Text>
        </View>

        <View style={styles.resultado}>
          <ResultadoBadge resultado={resultado} />
          {total > 0 ? <ContagemVotos favor={favor} contra={contra} abstencao={abstencao} ausentes={ausentes} /> : null}
        </View>
        {total > 0 ? (
          <View style={styles.barra}>
            <BarraProgresso favor={pct(favor)} contra={pct(contra)} abstencao={pct(abstencao)} />
          </View>
        ) : null}
      </View>

      {partidos ? (
        <View style={[styles.boletim, { borderTopColor: cores.border }]}>
          {LINHAS.map(({ chave, rotulo }, i) => {
            const lista = partidos[chave];
            return (
              <View
                key={chave}
                style={[styles.linha, i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth }]}
                accessible
                accessibilityLabel={`${rotulo}: ${lista.length ? lista.join(', ') : 'nenhum partido'}`}
              >
                <MarcaX marcado={lista.length > 0} tamanho={18} animar />
                <Text style={[Typography.label, styles.rotulo, { color: lista.length ? cores.text : cores.textMuted }]}>{rotulo}</Text>
                <View style={styles.partidos}>
                  {lista.length ? (
                    lista.map((p) => (
                      <View key={p} style={styles.partido}>
                        <View style={[styles.ponto, { backgroundColor: getCorPartido(p) }]} />
                        <Text style={[Typography.caption, styles.sigla, { color: cores.text }]}>{p}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[Typography.caption, { color: cores.textMuted }]}>Nenhum partido</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    padding: 0,
  },
  cabeca: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
  },
  resultado: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.md,
    rowGap: Spacing.sm,
  },
  barra: {
    marginTop: Spacing.xs,
  },
  boletim: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: 10,
  },
  rotulo: {
    width: 76,
    lineHeight: 18,
  },
  partidos: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
    rowGap: 4,
  },
  partido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sigla: {
    fontWeight: '600',
  },
});
