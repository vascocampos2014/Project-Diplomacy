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

// Cantos macios: cartões a 14px, botões e campos a 10px, filtros em pílula.
export const Radii = {
  badge: 5, // carimbo de resultado
  chip: 10, // botões, campos
  card: 14, // cartões
  sheet: 18, // painéis sobrepostos
  pill: 999, // filtros, etiquetas de tema, pontos
};

// Largura máxima do conteúdo no web/tablet: uma coluna de leitura (760) e,
// no computador, a página larga de "primeira página" (1200).
export const MAX_WIDTH = 760;
export const MAX_WIDTH_LARGO = 1200;
// A partir daqui a grelha de cartões passa de 2 para 3 colunas.
export const LARGURA_LARGA = 1280;

// A partir desta largura a navegação passa para o topo (texto) e a barra de
// separadores de baixo desaparece.
export const LARGURA_DESKTOP = 900;

// Escala de movimento transitions.dev (os mesmos valores estão em CSS no
// +html.tsx, como --duration-* e --ease-*). Escolhe pelo USO, não pelo número.
export const Motion = {
  stagger: 40, // atraso por item numa lista
  quick: 150, // fechar, trocar texto
  fast: 250, // mudar de página, abrir
  slow: 400, // revelar conteúdo carregado
  verySlow: 500, // momento de ênfase (títulos, carimbo)
  hemiciclo: 700, // o varrimento do hemiciclo, o momento principal
  duracao: 150, // mudanças de estado (cor, borda) em hover e toque
};

export const Easing = {
  smoothOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
};
