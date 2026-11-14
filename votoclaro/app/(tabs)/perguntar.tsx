import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoEdificio, FaixaAzulejo } from '@/components/Azulejo';
import { EcraVazio } from '@/components/EcraVazio';
import { RespostaRag } from '@/components/RespostaRag';
import { useEspacoBarra } from '@/components/BarraSeparadores';
import { anim, Aviso, Botao, CabecalhoEcra, Cartao, Chip, Contentor, TituloSecao, transicao, useCores, useDisposicao } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts, Typography } from '@/constants/Typography';
import {
  ErroPergunta,
  MAX_PERGUNTA,
  MENSAGENS_ERRO,
  perguntar as perguntarApi,
  RAG_API_URL,
  SUGESTOES,
  validarPergunta,
  type RespostaRag as Resposta,
} from '@/lib/perguntar';

type Entrada =
  | { id: number; pergunta: string; estado: 'a-carregar' }
  | { id: number; pergunta: string; estado: 'ok'; resposta: Resposta }
  | { id: number; pergunta: string; estado: 'erro'; erro: string };

export default function PerguntarScreen({ apiUrl = RAG_API_URL, perguntar = perguntarApi }: { apiUrl?: string; perguntar?: typeof perguntarApi }) {
  const cores = useCores();
  const { desktop } = useDisposicao();
  const espacoBarra = useEspacoBarra();
  const [texto, setTexto] = useState('');
  // ?pergunta=… (vindo do detalhe de uma votação) preenche o campo.
  const { pergunta: perguntaInicial } = useLocalSearchParams<{ pergunta?: string }>();
  useEffect(() => {
    if (perguntaInicial) setTexto(perguntaInicial.slice(0, MAX_PERGUNTA));
  }, [perguntaInicial]);
  const [conversa, setConversa] = useState<Entrada[]>([]);
  const scroll = useRef<ScrollView>(null);
  const proximoId = useRef(1);
  const montado = useRef(true);
  useEffect(() => () => void (montado.current = false), []);

  const aCarregar = conversa.some((e) => e.estado === 'a-carregar');
  const valida = validarPergunta(texto) !== null;

  const enviar = useCallback(
    async (pergunta: string) => {
      const p = validarPergunta(pergunta);
      if (!p || aCarregar) return;
      const id = proximoId.current++;
      // Answered turns so far, so the assistant understands follow-ups.
      const historico = conversa.flatMap((e) => (e.estado === 'ok' ? [{ pergunta: e.pergunta, resposta: e.resposta.resposta }] : []));
      setConversa((c) => [...c, { id, pergunta: p, estado: 'a-carregar' }]);
      setTexto('');
      let nova: Entrada;
      try {
        nova = { id, pergunta: p, estado: 'ok', resposta: await perguntar(p, { baseUrl: apiUrl, historico }) };
      } catch (e) {
        nova = { id, pergunta: p, estado: 'erro', erro: e instanceof ErroPergunta ? e.message : MENSAGENS_ERRO.indisponivel };
      }
      if (montado.current) setConversa((c) => c.map((x) => (x.id === id ? nova : x)));
    },
    [aCarregar, apiUrl, conversa, perguntar]
  );

  if (!apiUrl) {
    return (
      <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
        <FaixaAzulejo altura={14} />
        <Contentor style={styles.conteudo}>
          <CabecalhoEcra titulo="Perguntar" subtitulo="Pergunta sobre leis e votações do Parlamento." />
          <EcraVazio
            icone="question-answer"
            titulo="Disponível em breve"
            descricao="O assistente que responde a perguntas sobre as votações ainda não está ligado nesta versão da app."
          />
        </Contentor>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.ecra, { backgroundColor: cores.background }]} edges={[]}>
      <KeyboardAvoidingView style={styles.ecra} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => conversa.length > 0 && scroll.current?.scrollToEnd({ animated: true })}
        >
          <CabecalhoEdificio edificio="jeronimos" estreito>
            <CabecalhoEcra
              titulo="Perguntar"
              subtitulo="Respostas com base nos textos das iniciativas e nas votações da XVII legislatura."
            />
          </CabecalhoEdificio>
          <Contentor style={styles.conteudo}>
            <Aviso>
              Respostas geradas por IA a partir de dados públicos. Podem ter erros: confirma nas fontes indicadas. O
              assistente não dá opiniões nem recomendações de voto. As perguntas são processadas por um serviço de IA
              externo (Groq): não escrevas dados pessoais.
            </Aviso>

            {conversa.length === 0 ? (
              <View style={styles.sugestoes}>
                <TituloSecao>Experimenta perguntar</TituloSecao>
                {desktop ? (
                  // Computador: as sugestões em cartões, duas por linha.
                  <View style={styles.grelhaSugestoes}>
                    {SUGESTOES.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => enviar(s)}
                        accessibilityRole="button"
                        accessibilityLabel={`Perguntar: ${s}`}
                        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                          styles.cartaoSugestao,
                          transicao,
                          { backgroundColor: cores.surface, borderColor: hovered ? cores.tint : cores.border },
                          pressed && styles.premido,
                        ]}
                      >
                        <MaterialIcons name="chat-bubble-outline" size={20} color={cores.tintInk} accessible={false} />
                        <Text style={[Typography.bodySm, styles.cartaoSugestaoTexto, { color: cores.text }]}>{s}</Text>
                        <MaterialIcons name="arrow-forward" size={18} color={cores.tintInk} accessible={false} style={styles.cartaoSeta} />
                      </Pressable>
                    ))}
                  </View>
                ) : (
                <Cartao style={styles.lista}>
                  {SUGESTOES.map((s, i) => (
                    <Pressable
                      key={s}
                      onPress={() => enviar(s)}
                      accessibilityRole="button"
                      accessibilityLabel={`Perguntar: ${s}`}
                      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                        styles.sugestao,
                        i > 0 && { borderTopColor: cores.border, borderTopWidth: StyleSheet.hairlineWidth },
                        hovered && { backgroundColor: cores.surfaceAlt },
                        pressed && styles.premido,
                      ]}
                    >
                      <Text style={[Typography.bodySm, styles.sugestaoTexto, { color: cores.text }]}>{s}</Text>
                      <MaterialIcons name="arrow-forward" size={18} color={cores.tintInk} accessible={false} />
                    </Pressable>
                  ))}
                </Cartao>
                )}
              </View>
            ) : (
              <View style={styles.conversa} accessibilityLiveRegion="polite">
                {conversa.map((e) => (
                  <View key={e.id} style={styles.troca} {...anim('item')}>
                    <View style={[styles.pergunta, { backgroundColor: cores.tint }]}>
                      <Text style={[Typography.bodySm, { color: cores.onTint }]}>{e.pergunta}</Text>
                    </View>
                    <Cartao style={styles.resposta}>
                      {e.estado === 'a-carregar' ? (
                        <View style={styles.aCarregar} accessibilityLabel="A procurar a resposta">
                          <ActivityIndicator color={cores.tint} />
                          <Text style={[Typography.bodySm, { color: cores.textMuted }]}>
                            A procurar nas iniciativas e votações…
                          </Text>
                        </View>
                      ) : e.estado === 'erro' ? (
                        <View style={styles.erro}>
                          <Text style={[Typography.bodySm, { color: cores.text }]}>{e.erro}</Text>
                          <Chip label="Tentar de novo" onPress={() => enviar(e.pergunta)} />
                        </View>
                      ) : (
                        <RespostaRag texto={e.resposta.resposta} fontes={e.resposta.fontes} />
                      )}
                    </Cartao>
                  </View>
                ))}
                {conversa.length > 0 && !aCarregar ? (
                  <Botao
                    label="Nova conversa"
                    variante="secundario"
                    icone="refresh"
                    onPress={() => setConversa([])}
                    style={styles.limpar}
                  />
                ) : null}
              </View>
            )}
          </Contentor>
        </ScrollView>

        <View style={[styles.barra, { backgroundColor: cores.background, borderTopColor: cores.border, paddingBottom: espacoBarra || Spacing.sm }]}>
          <Contentor style={styles.barraLinha}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreve a tua pergunta…"
              placeholderTextColor={cores.textMuted}
              maxLength={MAX_PERGUNTA}
              multiline
              accessibilityLabel="Pergunta"
              accessibilityHint="O assistente tem em conta as perguntas anteriores desta conversa"
              style={[styles.input, { color: cores.text, backgroundColor: cores.surface, borderColor: cores.border }]}
              onKeyPress={(ev) => {
                // Web: Enter envia, Shift+Enter muda de linha.
                const n = ev.nativeEvent as { key: string; shiftKey?: boolean };
                if (Platform.OS === 'web' && n.key === 'Enter' && !n.shiftKey) {
                  (ev as unknown as { preventDefault: () => void }).preventDefault();
                  enviar(texto);
                }
              }}
            />
            <Pressable
              onPress={() => enviar(texto)}
              disabled={!valida || aCarregar}
              accessibilityRole="button"
              accessibilityLabel="Enviar pergunta"
              accessibilityState={{ disabled: !valida || aCarregar }}
              style={({ pressed }) => [
                styles.enviar,
                { backgroundColor: cores.tint },
                (!valida || aCarregar) && styles.desativado,
                pressed && styles.premido,
              ]}
            >
              <MaterialIcons name="arrow-upward" size={22} color={cores.onTint} />
            </Pressable>
          </Contentor>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecra: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: Spacing.xl },
  conteudo: { paddingHorizontal: Spacing.lg },
  sugestoes: { marginTop: Spacing.sm },
  lista: { padding: 0 },
  sugestao: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 52 },
  sugestaoTexto: { flex: 1 },
  grelhaSugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  cartaoSugestao: { width: '48.5%', minHeight: 132, borderWidth: 1, borderRadius: Radii.card, padding: Spacing.lg, gap: Spacing.sm },
  cartaoSugestaoTexto: { flex: 1, fontFamily: Fonts.semibold },
  cartaoSeta: { alignSelf: 'flex-end' },
  conversa: { marginTop: Spacing.xl, gap: Spacing.xl },
  troca: { gap: Spacing.sm },
  pergunta: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.card,
    borderBottomRightRadius: Radii.badge,
  },
  resposta: { borderBottomLeftRadius: Radii.badge },
  aCarregar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  erro: { gap: Spacing.md, alignItems: 'flex-start' },
  limpar: { alignSelf: 'center' },
  barra: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm },
  barraLinha: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: Spacing.lg,
    paddingTop: 11,
    paddingBottom: 11,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  enviar: { width: 44, height: 44, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center' },
  desativado: { opacity: 0.4 },
  premido: { transform: [{ scale: 0.96 }] },
});
