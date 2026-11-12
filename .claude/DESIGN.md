# DESIGN.md — VotoClaro

> Guia de design para a app de transparência parlamentar.
> Princípio central: dados políticos são áridos — o design tem de torná-los
> humanos, imediatos e impossíveis de ignorar.

---

## Identidade visual

### Conceito
A app vive entre dois mundos: a seriedade institucional do parlamento e a
energia directa das redes sociais onde os jovens passam o tempo.
O design resolve esta tensão com **tipografia editorial forte + dados visuais
limpos + uma cor de acento que não pede licença**.

A assinatura visual é o **indicador de voto**: um sistema de símbolos e cores
que permite perceber a posição de 230 deputados em menos de 3 segundos.

### Paleta

| Nome | Hex | Uso |
|---|---|---|
| Tinta | `#0D0D0D` | Texto principal, ícones |
| Papel | `#F7F6F2` | Background geral |
| Cívico | `#3D5AFE` | Acento principal, CTAs, links |
| Favor | `#16A34A` | Voto a favor |
| Contra | `#DC2626` | Voto contra |
| Abstenção | `#D97706` | Abstenção |
| Ausente | `#9CA3AF` | Ausente / sem dados |
| Superfície | `#FFFFFF` | Cards, modais |
| Bordo | `#E5E3DC` | Separadores, bordas |

**Modo escuro** — trocar Papel por `#111111`, Superfície por `#1C1C1C`,
Bordo por `#2A2A2A`. O resto mantém-se igual.

### Tipografia

```
Display / Títulos:   Inter (sans-serif, peso 700–900)
                     — limpo e directo, sem serifa
                     — usado em títulos grandes (≥ 24px)

Corpo / UI:          Inter (sans-serif, peso 400–600)
                     — legível a qualquer tamanho
                     — toda a interface, labels, dados

Dados / Números:     Inter (tabular nums, peso 600–700)
                     — percentagens, contagens de votos
                     — sempre com `font-variant-numeric: tabular-nums`
```

### Escala tipográfica

| Token | Família | Peso | Tamanho | Uso |
|---|---|---|---|---|
| `display-lg` | Inter | 900 | 34px, letter-spacing -0.5 | Títulos de ecrã |
| `display-sm` | Inter | 700 | 26px, letter-spacing -0.3 | Títulos de secção |
| `body-lg` | Inter | 400 | 17px | Texto corrido |
| `body-sm` | Inter | 400 | 15px | Descrições secundárias |
| `label` | Inter | 600 | 13px | Labels, eyebrows |
| `caption` | Inter | 400 | 12px | Metadados, datas |
| `data` | Inter | 700 | 20px | Números de destaque |

Os tamanhos `display-*` foram aumentados e ganharam letter-spacing negativo
para um efeito de manchete mais "bold" — números e títulos grandes devem
sentir-se mais densos e mais próprios da app.

### Espaçamento (base 4px)

```
4px   — separação mínima entre elementos inline
8px   — padding interno de chips e badges
12px  — gap entre ícone e label
16px  — padding horizontal de cards
20px  — separação entre elementos de lista
24px  — padding de secção
32px  — separação entre secções
48px  — espaço em branco intencional
```

### Raios de canto

```
6px   — badges, indicadores de voto
10px  — chips, inputs
18px  — cards, modais
20px  — bottom sheets, drawer
999px — pill: chips de tema/partido, badges de resultado, contagens
        de voto, botões (Seguir, CTAs), highlight da tab activa
```

---

## Componentes principais

### VotacaoCard
Card do feed principal. Mostra uma lei com o resultado agregado.

```
┃┌────────────────────────────────────────┐
┃│ [HABITAÇÃO]                  23 Mar 2024│  ← chip pill (tema) + data
┃│                                          │
┃│ Lei do Arrendamento Acessível            │  ← display-sm, 2 linhas max
┃│                                          │
┃│  ████████████████░░░░░░  68%             │  ← barra Favor/Contra/Abst.
┃│                                          │
┃│ [✓ 132] [✗ 58] [— 12] [· 28]  [🟢 Aprovada]│ ← pills de contagem + resultado
┃└────────────────────────────────────────┘
```

- Tap no card → abre detalhe com lista de deputados
- Barra lateral esquerda (5px, `border-radius` acompanha o card) colorida
  com a cor do resultado: verde (aprovada), vermelho (chumbada), âmbar
  (pendente) — primeiro sinal visual antes de ler texto
- A barra de progresso usa as cores Favor/Contra/Abstenção
- Chip de tema: pill com fundo `tint` a 12% de opacidade, texto `tint`,
  maiúsculas — **não** introduz uma paleta por tema, é sempre a cor Cívica
- Badge de resultado: pill preenchida com a `*Bg` semântica correspondente
  (`favorBg`/`contraBg`/`abstencaoBg`) e texto na cor semântica cheia
- Contagens por posição: cada posição (favor/contra/abstenção/ausente) é
  uma pill própria — fundo `*Bg`, símbolo + número na cor semântica cheia

### VotoIndicator
O elemento mais repetido na app. Deve ser instantaneamente legível.

```
  ✓        ✗        —        ·
Verde    Vermelho  Âmbar   Cinza
Favor    Contra   Absten.  Ausente

Tamanhos: sm (16px) | md (24px) | lg (32px)
```

Nunca usar apenas cor — sempre acompanhar com símbolo (acessibilidade).

### EstatisticasVotacao
Resumo de uma votação em 4 células, usado no detalhe de uma iniciativa.

```
┌────────┐┌────────┐┌────────┐┌────────┐
│ FAVOR  ││ CONTRA ││ ABSTEN.││ AUSENTE│
│  132   ││   58   ││   12   ││   28   │
│ 57.4%  ││ 25.2%  ││  5.2%  ││ 12.2%  │
└────────┘└────────┘└────────┘└────────┘
```

- Cada célula é uma "pill" tingida com a cor `*Bg` da sua posição
  (`favorBg`/`contraBg`/`abstencaoBg`/`ausenteBg`), sem divisores —
  4 blocos de cor lado a lado em vez de uma caixa com fronteiras internas
- Número e label na cor semântica cheia da posição; percentagem em cinzento
  neutro

### DeputadoRow
Linha numa lista de votação detalhada.

```
┌────────────────────────────────────────┐
│  [foto] Ana Silva          PS    [✓]   │
│         Círculo de Lisboa              │
└────────────────────────────────────────┘
```

- Foto circular 36px com fallback de iniciais
- Partido em `label` com cor oficial do partido
- VotoIndicator alinhado à direita

### PartidoBar
Barra horizontal de votação de um partido inteiro.

```
PS   ████████████████░░░░░   78% favor
PSD  ░░░░░░████████░░░░░░░   45% favor
```

- Largura proporcional à % de votos a favor
- Cor da barra = cor oficial do partido
- Ordenar sempre do mais favorável ao menos

### QuizCard
Pergunta com 4 opções. Feedback imediato após resposta.

```
┌─────────────────────────────────────────┐
│  Questão 2 de 5                  ●●○○○  │
│                                          │
│  Quem votou CONTRA a lei do clima?       │
│                                          │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │  PS             │ │  PSD            │ │
│  └─────────────────┘ └─────────────────┘ │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │  Chega          │ │  IL             │ │
│  └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
```

Após resposta: opção certa fica verde, errada fica vermelha, resto fica
acinzentado. Pequena explicação aparece abaixo.

---

## Navegação

Bottom tab bar com 4 tabs:

```
  ⊞ Feed    ☰ Deputados    ⊕ Comparar    ◉ Tu
```

- `Feed` — votações recentes
- `Deputados` — lista + pesquisa
- `Comparar` — ferramenta de comparação
- `Tu` — perfil, pontos, quizzes, notificações

A tab activa ganha um highlight em pill (fundo `tint` a 12% de opacidade)
por detrás do ícone — as restantes ficam só com o ícone.

**Header de navegação** (ecrãs empilhados, ex. detalhe de votação/deputado):
fundo = cor de fundo do tema (Papel / escuro), título em Inter 700 17px na
cor de texto do tema, seta/botão de voltar na cor `tint`, sem sombra. O
header herda sempre o tema activo — nunca fica branco/sistema por defeito.

---

## Motion & animações

**Princípio:** movimento serve os dados, não decora.

| Momento | Animação | Duração |
|---|---|---|
| Abrir card | slide-up + fade, 220ms | ease-out |
| Revelar voto | fill da barra da esquerda | 400ms, ease-in-out |
| Resposta quiz | flash verde/vermelho | 180ms |
| Ganhar pontos | número sobe com bounce | 600ms |
| Transição de ecrã | slide horizontal nativo | padrão iOS/Android |

Sempre respeitar `prefers-reduced-motion` — desativar tudo excepto
transições de ecrã.

---

## Tom de voz da interface

- **Frase curta, verbo activo.** "Ver votação" não "Clique aqui para ver".
- **Dados sem opinião.** "132 a favor, 58 contra" — nunca "impressionante maioria".
- **Erro útil.** "Não foi possível carregar. Tenta de novo." com botão retry.
- **Ecrã vazio = convite.** "Ainda não segues nenhum deputado. Começa por procurar o teu círculo eleitoral."
- **Conquistas sem exagero.** "Nível 2 desbloqueado" em vez de "INCRÍVEL!!! 🎉🎉🎉"

---

## Cores dos partidos

| Partido | Hex principal |
|---|---|
| PS | `#F0385C` |
| PSD | `#F97316` |
| Chega | `#003399` |
| IL | `#60A5FA` |
| BE | `#BE123C` |
| CDU | `#DC2626` |
| PAN | `#16A34A` |
| Livre | `#7C3AED` |

Usar sempre com fundo neutro — nunca colocar texto sobre a cor do partido.

---

## Acessibilidade

- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande
- Todos os VotoIndicators têm label acessível (`accessibilityLabel`)
- Bottom tab com `accessibilityRole="tab"`
- Suporte a Dynamic Type (iOS) e font scaling (Android)
- Não depender apenas de cor — sempre símbolo + cor em conjunto
- Focus trap em modais e bottom sheets

---

*Manter este ficheiro actualizado a cada iteração de design.*
