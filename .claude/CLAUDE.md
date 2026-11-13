# VotoClaro — App de Transparência Parlamentar

> App móvel (iOS + Android) que incentiva a literacia cívica dos jovens,
> mostrando como cada deputado votou em cada lei da Assembleia da República.

---

## Visão geral

| Campo | Detalhe |
|---|---|
| País | Portugal — Assembleia da República |
| Plataforma | iOS + Android (React Native + Expo) |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Dados | API pública do parlamento.pt |
| Público-alvo | Jovens dos 16 aos 30 anos |

---

## Funcionalidades principais

### 1. Feed de votações
- Lista de iniciativas legislativas recentes
- Cada card mostra: título da lei, data, resultado global (aprovada / chumbada)
- Ao abrir: votação detalhada por deputado (✓ favor / ✗ contra / — abstenção / ausente)
- Filtros: por tema, por data, por partido, por resultado

### 2. Perfil de deputado
- Foto, nome, partido, círculo eleitoral, mandatos
- Estatísticas: % votos a favor, % contra, % abstenção, taxa de presença
- Historial completo de votações com pesquisa
- Botão de seguir (recebe notificações das votações desse deputado)

### 3. Comparador
- Comparar dois deputados ou dois partidos numa lei específica
- Gráfico de barras com posição de cada partido por tema (saúde, habitação, ambiente, etc.)
- Matriz de coerência: quantas vezes um partido votou diferente do que prometeu no programa

### 4. Notificações
- Alerta quando há nova votação
- Alerta quando um deputado que segues vota
- Resumo semanal: "Esta semana o parlamento votou X leis"

### 5. Teste de afinidade partidária (gamificação) — REMOVIDO da app em 2026-11-13
> O separador Quiz foi retirado. Não reconstruir sem pedido explícito.

- O utilizador responde a um conjunto de afirmações por tema (saúde, habitação, ambiente, etc.) e a app compara as respostas com o historial real de votos de cada partido nesses temas, devolvendo uma % de afinidade por partido
- Resultado apresentado sempre como "com base nos dados públicos de votação, estes partidos votaram de forma semelhante às tuas respostas" — nunca como recomendação de voto
- Sem perguntas de opinião sobre líderes/partidos, só sobre políticas concretas já votadas
- Segue as regras da secção "Neutralidade política"
- Sistema de níveis e pontos (Cidadão Bronze → Prata → Ouro → Embaixador)
- Partilha de resultados nas redes sociais

### 6. Funcionalidades adicionais (roadmap)
- **Calendário parlamentar**: agenda das próximas votações agendadas, para seguir antes do voto acontecer
- **Modo "explica-me"**: resumo em linguagem simples e neutra do que cada lei faz, gerado a partir do texto oficial
- **Linha do tempo vs promessas**: comparar o historial de voto de um partido com as promessas do respetivo programa eleitoral (alimenta a matriz de coerência do Comparador)
- **Mapa por círculo eleitoral**: ver como votaram os deputados eleitos pelo círculo do utilizador

---

## Arquitetura técnica

```
┌─────────────────────────────────────┐
│         Fontes de dados             │
│  API parlamento.pt  +  dados abertos│
└───────────────┬─────────────────────┘
                │ cron job diário
┌───────────────▼─────────────────────┐
│             Backend                 │
│  Supabase (PostgreSQL)              │
│  ├── sync de votações               │
│  ├── base de dados                  │
│  └── push notifications (FCM/APNs) │
└───────────────┬─────────────────────┘
                │ REST API / Realtime
┌───────────────▼─────────────────────┐
│          App móvel                  │
│  React Native + Expo                │
│  ├── Feed de votações               │
│  ├── Perfil de deputado             │
│  ├── Comparador                     │
│  ├── Notificações                   │
│  └── Teste de afinidade partidária  │
└─────────────────────────────────────┘
```

---

## Stack recomendada

### Frontend (app móvel)
```
React Native       — framework principal (iOS + Android)
Expo               — build, OTA updates, push notifications
Expo Router        — navegação baseada em ficheiros
NativeWind         — Tailwind CSS para React Native
React Query        — cache e sync de dados remotos
Zustand            — estado global leve
```

### Backend
```
Supabase           — base de dados, auth, storage, realtime
  ├── PostgreSQL   — dados estruturados
  ├── Row Level Security — permissões por utilizador
  └── Edge Functions — lógica serverless (sync da API)

Firebase Cloud Messaging — notificações push Android
Apple Push Notification Service (APNs) — notificações iOS
```

### Dados
```
API Assembleia da República
  URL: https://app.parlamento.pt/webutils/docs
  Formato: REST/JSON
  Auth: sem autenticação (pública)
  
Endpoints relevantes:
  GET /iniciativas          — lista de iniciativas legislativas
  GET /votacoes             — votações por iniciativa
  GET /deputados            — lista de deputados
  GET /deputados/{id}/votos — historial de votos de um deputado
```

---

## Esquema da base de dados

```sql
-- Deputados
CREATE TABLE deputados (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  partido     TEXT NOT NULL,
  circulo     TEXT NOT NULL,
  foto_url    TEXT,
  mandatos    INT DEFAULT 1,
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Iniciativas legislativas
CREATE TABLE iniciativas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  descricao   TEXT,
  tema        TEXT,               -- habitação, saúde, ambiente, etc.
  data_voto   DATE,
  resultado   TEXT,               -- aprovada | chumbada | pendente
  favor       INT DEFAULT 0,
  contra      INT DEFAULT 0,
  abstencao   INT DEFAULT 0,
  ausentes    INT DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Votações individuais
CREATE TABLE votacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputado_id   UUID REFERENCES deputados(id),
  iniciativa_id UUID REFERENCES iniciativas(id),
  posicao       TEXT NOT NULL,    -- favor | contra | abstencao | ausente
  criado_em     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deputado_id, iniciativa_id)
);

-- Utilizadores (auth via Supabase)
CREATE TABLE perfis (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  username        TEXT UNIQUE,
  nivel_civico    INT DEFAULT 1,
  pontos          INT DEFAULT 0,
  criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Deputados seguidos por utilizador
CREATE TABLE seguindo (
  utilizador_id UUID REFERENCES perfis(id),
  deputado_id   UUID REFERENCES deputados(id),
  PRIMARY KEY(utilizador_id, deputado_id)
);

-- Resultados de quizzes
CREATE TABLE quiz_resultados (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id UUID REFERENCES perfis(id),
  pontos        INT,
  nivel         TEXT,
  completado_em TIMESTAMPTZ DEFAULT now()
);
```

---

## Estrutura de pastas do projeto

```
votoclaro/
├── app/                        # Ecrãs (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx           # Feed de votações
│   │   ├── deputados.tsx       # Lista de deputados
│   │   ├── comparar.tsx        # Comparador
│   │   └── quiz.tsx            # Teste de afinidade partidária
│   ├── votacao/[id].tsx        # Detalhe de uma votação
│   ├── deputado/[id].tsx       # Perfil de deputado
│   └── _layout.tsx             # Layout raiz + auth
│
├── components/
│   ├── VotacaoCard.tsx         # Card de uma lei no feed
│   ├── DeputadoAvatar.tsx      # Foto + nome + partido
│   ├── VotoIndicator.tsx       # Símbolo ✓ / ✗ / — / ausente
│   ├── BarraPartido.tsx        # Barra colorida por partido
│   └── AfinidadeQuestaoCard.tsx # Card de afirmação do teste de afinidade
│
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── parlamento-api.ts       # Wrapper da API do parlamento
│   ├── sync.ts                 # Lógica de sincronização
│   └── notifications.ts        # Push notifications
│
├── hooks/
│   ├── useVotacoes.ts          # React Query para votações
│   ├── useDeputado.ts          # React Query para deputado
│   └── useQuiz.ts              # Lógica de quiz
│
├── store/
│   └── userStore.ts            # Estado do utilizador (Zustand)
│
├── supabase/
│   ├── migrations/             # Migrações SQL
│   └── functions/
│       └── sync-parlamento/    # Edge Function de sync diário
│
├── assets/
│   └── partidos/               # Logos dos partidos
│
├── app.json                    # Config Expo
├── package.json
└── CLAUDE.md                   # Este ficheiro
```

---

## Como começar

### Pré-requisitos
```bash
node >= 18
npm >= 9
expo-cli instalado: npm install -g expo
conta Supabase: supabase.com (gratuita)
```

### Instalação
```bash
# 1. Criar projeto Expo
npx create-expo-app votoclaro --template tabs
cd votoclaro

# 2. Instalar dependências
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install zustand
npm install nativewind
npm install expo-notifications
npm install expo-router

# 3. Configurar variáveis de ambiente
cp .env.example .env
# preencher SUPABASE_URL e SUPABASE_ANON_KEY

# 4. Aplicar migrações da base de dados
npx supabase db push

# 5. Arrancar
npx expo start
```

### Variáveis de ambiente (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_PARLAMENTO_API=https://app.parlamento.pt/webutils
```

---

## Sync da API do parlamento

A Edge Function corre diariamente (cron) e sincroniza novos dados:

```typescript
// supabase/functions/sync-parlamento/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PARLAMENTO_API = 'https://app.parlamento.pt/webutils'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Buscar votações recentes
  const res = await fetch(`${PARLAMENTO_API}/votacoes?dataInicio=...`)
  const votacoes = await res.json()

  // 2. Inserir/atualizar na base de dados
  for (const v of votacoes) {
    await supabase.from('votacoes').upsert({
      deputado_id: v.deputadoId,
      iniciativa_id: v.iniciativaId,
      posicao: v.posicao
    }, { onConflict: 'deputado_id,iniciativa_id' })
  }

  // 3. Enviar notificações push aos subscritores
  // ...

  return new Response('OK')
})
```

---

## Sistema de níveis (gamificação)

| Nível | Nome | Pontos necessários |
|---|---|---|
| 1 | Cidadão Curioso | 0 |
| 2 | Eleitor Informado | 100 |
| 3 | Ativista Digital | 300 |
| 4 | Guardião da Democracia | 600 |
| 5 | Embaixador Cívico | 1000 |

**Como ganhar pontos:**
- Completar o teste de afinidade partidária: +20 pts
- Seguir um deputado: +10 pts
- Abrir app 7 dias seguidos: +25 pts
- Partilhar resultado: +5 pts

---

## Neutralidade política

Esta app é apartidária. Regras de design:

- Cada partido tem uma cor oficial (PS → rosa, PSD → laranja, etc.)
- Os dados mostram factos, não opiniões (votações são factos públicos)
- Sem linguagem valorativa nos textos automáticos
- Sem publicidade política
- Sem algoritmo que favorece um partido
- O teste de afinidade partidária baseia-se apenas em dados de votação reais e é apresentado como informação factual, nunca como recomendação de voto

---

## Próximos passos sugeridos

- [x] ~~Construir o tab de Quiz (teste de afinidade partidária)~~ — removido em 2026-11-13
- [ ] Criar conta Supabase e aplicar o esquema SQL
- [ ] Explorar a API do parlamento e mapear os endpoints reais
- [ ] Construir o componente `VotacaoCard` com dados mock
- [ ] Implementar a Edge Function de sync
- [ ] Adicionar autenticação com Supabase Auth
- [ ] Submeter para TestFlight (iOS) e Play Store interno (Android)

---

*Gerado com Claude — Anthropic*
