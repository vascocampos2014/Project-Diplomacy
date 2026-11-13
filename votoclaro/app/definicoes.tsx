import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/components/ThemeToggle';
import { CabecalhoEcra, Cartao, Contentor, TituloSecao, useCores } from '@/components/ui';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

export default function DefinicoesScreen() {
  const cores = useCores();
  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Definições' }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Contentor>
          <CabecalhoEcra titulo="Definições" />
          <TituloSecao>Aparência</TituloSecao>
          <ThemeToggle />

          <TituloSecao>Sobre o VotoClaro</TituloSecao>
          <Cartao style={styles.sobre}>
            <Text style={[Typography.bodySm, { color: cores.text }]}>
              O VotoClaro mostra como votou cada partido nas iniciativas da Assembleia da República. É apartidário: mostra
              factos, não opiniões, e nunca recomenda em quem votar.
            </Text>
            <Text style={[Typography.bodySm, { color: cores.text }]}>
              Os dados vêm dos dados abertos oficiais do Parlamento, através da API pública openAR. O registo oficial indica
              a posição de cada grupo parlamentar, não o voto individual de cada deputado.
            </Text>
            <Text style={[Typography.caption, { color: cores.textMuted }]}>
              Os temas (Habitação, Saúde, …) são atribuídos automaticamente a partir do título e podem não ser exatos.
            </Text>
          </Cartao>
        </Contentor>
      </ScrollView>
    </SafeAreaView>
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
  sobre: {
    gap: Spacing.md,
  },
});
