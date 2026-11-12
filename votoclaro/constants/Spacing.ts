// Espaçamento e raios VotoClaro — ver .claude/DESIGN.md (base 4px)
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

export const Radii = {
  badge: 6, // badges, indicadores de voto
  chip: 10, // inputs
  card: 18, // cards, modais
  sheet: 20, // bottom sheets
  pill: 999, // chips de tema/partido, botões, contagens, tab activa
};

// Largura máxima do conteúdo no web/tablet: o layout é pensado para telemóvel
// e linhas de 1500px tornam-se ilegíveis num ecrã de computador.
export const MAX_WIDTH = 720;
