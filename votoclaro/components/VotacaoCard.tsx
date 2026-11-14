// Uma votação no feed — ver DESIGN.md › Feed.
// `destaque`: a votação mais recente, como manchete de jornal (título grande
// em azul, hemiciclo gravado a varrer, carimbo do resultado).
// Sem destaque: cartão com o tema, o título, quem votou como, e o hemiciclo
// pequeno à direita.
import type { Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RESULTADO } from '@/components/ContagemVotos';
import { Amostra, Hemiciclo, LegendaVotos } from '@/components/Hemiciclo';
import { anim, Cartao, Etiqueta, useCores } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
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
  destaque?: boolean;
}

const LINHAS: { chave: keyof PartidosPorPosicao; rotulo: string }[] = [
  { chave: 'favor', rotulo: 'A favor' },
  { chave: 'contra', rotulo: 'Contra' },
  { chave: 'abstencao', rotulo: 'Abstenção' },
];

export function VotacaoCard(props: VotacaoCardProps) {
  const { titulo, referencia, tema, data, resultado, favor, contra, abstencao, ausentes, partidos, onPress, href, destaque } = props;
  const cores = useCores();
  const total = favor + contra + abstencao + ausentes;
  const rotulo = `${titulo}, ${referencia ? `${referencia}, ` : ''}${tema}, ${data}, ${RESULTADO[resultado].label}`;

  if (destaque) {
    return (
      <Cartao
        onPress={onPress}
        href={href}
        style={styles.destaque}
        accessibilityLabel={rotulo}
        accessibilityHint="Abre a votação completa"
      >
        <Etiqueta>{tema}</Etiqueta>
        <View {...anim('titulo')}>
          <Text style={[Typography.manchete, styles.manchete, { color: cores.tintInk }]}>{titulo}</Text>
        </View>
        <Text style={[Typography.caption, { color: cores.textMuted }]}>
          {referencia ? `${referencia} · ` : ''}
          {data}
        </Text>
        {total > 0 ? (
          <View style={styles.hemiciclo}>
            <Hemiciclo favor={favor} contra={contra} abstencao={abstencao} ausentes={ausentes} resultado={resultado} animar />
            <LegendaVotos favor={favor} contra={contra} abstencao={abstencao} ausentes={ausentes} />
          </View>
        ) : null}
        {partidos ? <PartidosPorSentido partidos={partidos} /> : null}
        <Text style={[styles.ver, { color: cores.tintInk }]}>Ver a votação completa ›</Text>
      </Cartao>
    );
  }

  return (
    <Cartao onPress={onPress} href={href} accessibilityLabel={rotulo} accessibilityHint="Abre a votação completa">
      <View style={styles.linhaCartao}>
        <View style={styles.texto}>
          <Etiqueta>{tema}</Etiqueta>
          <Text style={[Typography.title, styles.titulo, { color: cores.text }]} numberOfLines={3}>
            {titulo}
          </Text>
          <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
            {RESULTADO[resultado].label}
            {total > 0 ? ` · ${favor}–${contra}` : ''} · {data}
          </Text>
          {referencia ? (
            <Text style={[Typography.caption, { color: cores.textMuted }]} numberOfLines={1}>
              {referencia}
            </Text>
          ) : null}
        </View>
        {total > 0 ? <Hemiciclo mini favor={favor} contra={contra} abstencao={abstencao} ausentes={ausentes} /> : null}
      </View>
      {partidos ? <PartidosPorSentido partidos={partidos} compacto /> : null}
    </Cartao>
  );
}

// Quem votou como: uma linha por sentido, com a amostra da textura.
export function PartidosPorSentido({
  partidos,
  compacto = false,
  semLinha = false,
}: {
  partidos: PartidosPorPosicao;
  compacto?: boolean;
  semLinha?: boolean;
}) {
  const cores = useCores();
  return (
    <View style={[styles.partidos, { borderTopColor: cores.border }, compacto && styles.partidosCompacto, semLinha && styles.semLinha]}>
      {LINHAS.map(({ chave, rotulo }) => {
        const lista = partidos[chave];
        if (compacto && lista.length === 0) return null;
        return (
          <View
            key={chave}
            style={styles.partidoLinha}
            accessible
            accessibilityLabel={`${rotulo}: ${lista.length ? lista.join(', ') : 'nenhum partido'}`}
          >
            <View style={styles.partidoRotulo}>
              <Amostra posicao={chave} />
              <Text style={[styles.rotulo, { color: cores.text }]}>{rotulo}</Text>
            </View>
            <Text style={[styles.siglas, { color: lista.length ? cores.text : cores.textMuted }]}>
              {lista.length ? lista.join(' · ') : 'Nenhum partido'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  destaque: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    gap: Spacing.sm,
  },
  manchete: {
    marginTop: Spacing.xs,
  },
  hemiciclo: {
    marginTop: Spacing.md,
  },
  ver: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  linhaCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  texto: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titulo: {
    marginTop: 4,
  },
  partidos: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  semLinha: {
    borderTopWidth: 0,
    marginTop: 0,
    paddingTop: 0,
  },
  partidosCompacto: {
    marginTop: Spacing.md,
  },
  partidoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  partidoRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 92,
    paddingTop: 1,
  },
  rotulo: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  siglas: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 13,
    lineHeight: 18,
  },
});
