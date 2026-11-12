# SKILLS.md — VotoClaro Frontend

> Instruções para o Claude (ou qualquer dev) ao trabalhar nos componentes
> React Native desta app. Cada skill define o contrato de um componente.

---

## Como usar este ficheiro

Quando pedires ao Claude para construir ou editar um componente, começa sempre
por citar o skill relevante. Exemplo:

> "Usando o skill VotoIndicator, cria a versão `lg` para o ecrã de detalhe."

---

## Skill: VotoIndicator

**O componente mais crítico da app.** Representa a posição de um deputado
numa votação. Deve ser instantâneo de ler e acessível.

### Contrato

```typescript
type Posicao = 'favor' | 'contra' | 'abstencao' | 'ausente'

interface VotoIndicatorProps {
  posicao: Posicao
  size?: 'sm' | 'md' | 'lg'   // default: 'md'
  showLabel?: boolean           // default: false
}
```

### Mapeamento visual

| Posição | Símbolo | Cor de fundo | Cor símbolo |
|---|---|---|---|
| `favor` | ✓ | `#DCFCE7` | `#16A34A` |
| `contra` | ✗ | `#FEE2E2` | `#DC2626` |
| `abstencao` | — | `#FEF3C7` | `#D97706` |
| `ausente` | · | `#F3F4F6` | `#9CA3AF` |

### Tamanhos

| Size | Contentor | Símbolo | Border-radius |
|---|---|---|---|
| `sm` | 20×20 | 11px | 4px |
| `md` | 28×28 | 15px | 6px |
| `lg` | 40×40 | 20px | 8px |

### Regras obrigatórias
- Nunca usar apenas cor — o símbolo é sempre obrigatório
- `accessibilityLabel` obrigatório: "Voto a favor" / "Voto contra" / etc.
- Em listas longas (>20 items) usar `sm`; em destaque usar `lg`
- Não animar o próprio indicador — a animação fica no contentor pai

### Exemplo de uso
```tsx
<VotoIndicator posicao="favor" size="md" />
<VotoIndicator posicao="contra" size="lg" showLabel />
```

---

## Skill: VotacaoCard

Card do feed principal. Resume uma lei numa área tocável.

### Contrato

```typescript
interface VotacaoCardProps {
  titulo: string               // máx 80 chars — truncar com …
  tema: string                 // ex: "Habitação", "Saúde"
  data: string                 // formato: "23 Mar 2024"
  resultado: 'aprovada' | 'chumbada' | 'pendente'
  favor: number
  contra: number
  abstencao: number
  ausentes: number
  onPress: () => void
}
```

### Layout interno

```
padding: 16px horizontal, 14px vertical

[tema — caption, uppercase]          [data — caption, grey]

[titulo — display-sm, max 2 linhas]

[barra de progresso — 6px height, border-radius 3px]
  verde = favor%, vermelho = contra%, âmbar = abstenção%

[✓ N  ✗ N  — N  · N]               [✓ Aprovada | ✗ Chumbada]
  body-sm, tabular-nums                label, cor do resultado
```

### Regras
- Card inteiro é tocável (`TouchableOpacity`, `activeOpacity=0.7`)
- Sombra subtil: `elevation: 1` (Android), `shadow` muito leve (iOS)
- Background: `#FFFFFF`, border-radius: `12px`
- Em modo escuro: background `#1C1C1C`
- Barra de progresso sem animação no render — animar apenas no primeiro mount

---

## Skill: DeputadoRow

Linha de deputado numa lista. Usada no detalhe de votação e na lista geral.

### Contrato

```typescript
interface DeputadoRowProps {
  nome: string
  partido: string
  circulo: string
  fotoUrl?: string
  posicao?: Posicao            // se undefined: não mostrar indicador
  onPress?: () => void
}
```

### Layout

```
[Avatar 36px] [Nome — body-lg, bold]          [VotoIndicator md]
              [Partido chip] [Círculo — caption]
```

### Avatar
- Imagem circular 36px com `borderRadius: 18`
- Fallback: iniciais (primeiras 2 letras do nome) em fundo `#E5E3DC`
- Usar `FastImage` ou `Image` com cache

### Partido chip
- Pill pequeno com cor de fundo do partido (15% opacidade)
- Texto na cor do partido (100% opacidade)
- Border-radius: 4px, padding: 2px 6px
- Font: `label` (Inter 600, 11px)

### Separador
- `StyleSheet.hairlineWidth` entre rows, cor `#E5E3DC`
- Nunca usar `<View height={1}>` — causa render inconsistente

---

## Skill: PartidoComparacao

Visualização de comparação entre partidos numa lei ou tema.

### Contrato

```typescript
interface PartidoComparacaoProps {
  partidos: Array<{
    nome: string
    cor: string
    favor: number      // 0–100 (percentagem)
    contra: number
    abstencao: number
  }>
  titulo?: string
}
```

### Layout

```
[titulo — display-sm]

PS   [████████████████░░░░]  78%
PSD  [░░░░████████░░░░░░░░]  45%
IL   [████████████████████]  94%
     └─ verde = favor, vermelho = contra, cinza = abstenção
```

### Regras
- Ordenar por % de votos a favor (descendente)
- Barra total = 100% da largura disponível menos label (60px) e número (40px)
- Nunca mostrar partido com 0 deputados votantes
- Animar entrada das barras: `width` de 0 para valor final, 400ms, staggered 60ms

---

## Skill: QuizCard

Card de pergunta de quiz com feedback imediato.

### Contrato

```typescript
interface QuizCardProps {
  pergunta: string
  opcoes: string[]             // sempre 4 opções
  respostaCorreta: number      // índice 0–3
  explicacao: string           // mostrada após responder
  onResposta: (correto: boolean) => void
}
```

### Estados

```
idle        → opções neutras (border #E5E3DC, bg #F7F6F2)
selecionada → opção tocada fica com border azul (feedback de toque)
correta     → opção certa = verde, errada = vermelho, resto = acinzentado
              + explicação aparece com fade-in abaixo
```

### Animações
- Seleção: `scale(0.97)` no press, 100ms
- Resultado correto: opção certa faz `scale(1.02)` + flash verde, 200ms
- Explicação: `opacity 0→1`, 300ms, delay 200ms

### Regras
- Após responder, desabilitar todos os botões (`pointerEvents: 'none'`)
- A explicação deve ter máx 2 linhas — truncar no CLAUDE.md se necessário
- Não mostrar qual era a resposta certa antes de o utilizador responder

---

## Skill: BarraProgresso

Barra horizontal multi-segmento para representar distribuição de votos.

### Contrato

```typescript
interface BarraProgressoProps {
  favor: number        // 0–100
  contra: number       // 0–100
  abstencao: number    // 0–100
  // favor + contra + abstencao + ausentes = 100
  height?: number      // default: 6
  animated?: boolean   // default: true
}
```

### Implementação
- Usar `View` com `flexDirection: 'row'`
- Cada segmento é um `View` com `flex` proporcional ao valor
- Cores: verde `#16A34A`, vermelho `#DC2626`, âmbar `#D97706`, cinza `#E5E3DC`
- Animação: `Animated.timing` em cada segmento, staggered 50ms entre segmentos
- `borderRadius: height / 2` no contentor (pill shape)
- Segmentos com 0% não renderizar (evitar linha de 1px)

---

## Skill: EcrãVazio

Estado vazio de listas e feeds. Nunca deixar um ecrã em branco.

### Contrato

```typescript
interface EcrãVazioProps {
  icone: string           // nome do ícone (ex: 'ballot', 'person')
  titulo: string
  descricao: string
  accao?: {
    label: string
    onPress: () => void
  }
}
```

### Layout

```
           [ícone 48px, cor #9CA3AF]

        [titulo — display-sm, centrado]

    [descricao — body-sm, centrado, max 2 linhas]

         [botão de acção — se existir]
```

### Tom de voz dos textos (exemplos)
- Feed vazio: "Ainda não há votações" / "Volta mais tarde para ver as últimas votações do parlamento."
- Sem deputados seguidos: "Não segues nenhum deputado" / "Procura o teu círculo eleitoral para começar."
- Sem resultados de pesquisa: "Nenhum resultado" / "Tenta com outro nome ou partido."

---

## Skill: NotificacaoBadge

Badge de contagem em ícones de navegação e botões de seguir.

### Contrato

```typescript
interface NotificacaoBadgeProps {
  count: number     // se 0, não renderizar
  max?: number      // default: 99 — acima mostra "99+"
}
```

### Regras
- Posição: `absolute`, `top: -4`, `right: -6`
- Fundo: `#1A56DB` (Cívico)
- Texto: branco, Inter 600, 10px
- Tamanho mínimo: 16×16px (circular)
- Acima de 2 dígitos: 20px de largura
- Nunca mostrar "0" — usar `count > 0` como guard

---

## Convenções gerais

### Imports
```typescript
// Ordem: React → RN → libs externas → componentes locais → tipos
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { VotoIndicator } from '@/components/VotoIndicator'
import type { Posicao } from '@/types'
```

### Nomes de ficheiros
```
PascalCase para componentes:   VotacaoCard.tsx
camelCase para hooks:          useVotacoes.ts
camelCase para utils:          formatarData.ts
SCREAMING_SNAKE para consts:   CORES_PARTIDOS.ts
```

### Props obrigatórias vs opcionais
- Props obrigatórias sem `?`
- Props opcionais com `?` e sempre com valor default documentado
- Nunca `any` — usar `unknown` se necessário e fazer type guard

### Acessibilidade (obrigatório em todos os componentes)
```typescript
// Sempre incluir em elementos interactivos:
accessibilityRole="button"          // ou "tab", "link", etc.
accessibilityLabel="Descrição clara" // o que o elemento faz
accessibilityHint="Abre o detalhe"  // consequência da acção (se não óbvio)

// Em elementos decorativos:
accessible={false}
importantForAccessibility="no"
```

### Performance
- Listas longas sempre com `FlatList` ou `FlashList` — nunca `ScrollView` + map
- Imagens sempre com dimensões fixas + `resizeMode`
- Callbacks sempre com `useCallback` se passados como props
- Dados derivados com `useMemo` se computação > O(n)

---

*Actualizar este ficheiro sempre que um novo componente for criado.*
