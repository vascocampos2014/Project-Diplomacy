// Espaçamento, raios e movimento VotoClaro — ver .claude/DESIGN.md (base 4px)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// O boletim é papel cortado: cantos quase retos. Só os pontos de partido são
// redondos (pill).
export const Radii = {
  badge: 2, // carimbo de resultado, caixas do ✕
  chip: 3, // botões, campos, filtros
  card: 3, // boletins (cartões)
  sheet: 6, // painéis sobrepostos
  pill: 999, // só para pontos/círculos
};

// Largura máxima do conteúdo no web/tablet.
export const MAX_WIDTH = 760;

// A partir desta largura a navegação passa para o topo (texto) e a barra de
// separadores de baixo desaparece.
export const LARGURA_DESKTOP = 900;

// Uma só duração e curva para todas as mudanças de estado; o ✕ tem o seu
// próprio tempo de traço. Escala transitions.dev: o ✕ é um "traço de
// confirmação" (500ms no total: dois traços de 210ms com uma pausa de 80ms).
export const Motion = {
  duracao: 200,
  traco: 210, // cada um dos dois traços do ✕
  pausa: 80, // entre o primeiro e o segundo traço
};
