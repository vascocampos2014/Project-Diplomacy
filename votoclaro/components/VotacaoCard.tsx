// Card do feed — ver DESIGN.md › VotacaoCard
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarraProgresso } from '@/components/BarraProgresso';
import { ContagemVotos, ResultadoBadge } from '@/components/ContagemVotos';
import { Cartao, Chip, useCores } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
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
  onPress: () => void;
}

const RESULTADO_A11Y: Record<Resultado, string> = { aprovada: 'Aprovada', chumbada: 'Chumbada', pendente: 'Pendente' };

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
  onPress,
}: VotacaoCardProps) {
  const cores = useCores();
  const total = favor + contra + abstencao + ausentes;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const acento = resultado === 'aprovada' ? cores.favor : resultado === 'chumbada' ? cores.contra : cores.abstencao;

  return (
    <Cartao
      onPress={onPress}
      style={styles.cartao}
      accessibilityLabel={`${titulo}, ${referencia ? `${referencia}, ` : ''}${tema}, ${data}, ${RESULTADO_A11Y[resultado]}`}
      accessibilityHint="Abre o detalhe da votação"
    >
      <View style={[styles.acento, { backgroundColor: acento }]} />
      <View style={styles.corpo}>
        <View style={styles.topo}>
          <Chip label={tema.toUpperCase()} selecionado />
          <Text style={[Typography.caption, { color: cores.textMuted }]}>{data}</Text>
        </View>

        <Text style={[Typography.title, styles.titulo, { color: cores.text }]} numberOfLines={3}>
          {titulo}
        </Text>
        {referencia ? (
          <Text style={[Typography.caption, styles.referencia, { color: cores.textMuted }]} numberOfLines={1}>
            {referencia}
          </Text>
        ) : null}

        {total > 0 ? (
          <View style={styles.barra}>
            <BarraProgresso favor={pct(favor)} contra={pct(contra)} abstencao={pct(abstencao)} animated={false} />
          </View>
        ) : null}

        <View style={styles.rodape}>
          {total > 0 ? <ContagemVotos favor={favor} contra={contra} abstencao={abstencao} ausentes={ausentes} /> : <View />}
          <ResultadoBadge resultado={resultado} />
        </View>
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  acento: {
    width: 5,
  },
  corpo: {
    flex: 1,
    padding: Spacing.lg,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titulo: {
    marginTop: Spacing.md,
  },
  referencia: {
    marginTop: Spacing.xs,
  },
  barra: {
    marginTop: Spacing.lg,
  },
  rodape: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});
