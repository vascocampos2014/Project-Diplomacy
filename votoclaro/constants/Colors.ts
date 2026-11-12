// Paleta VotoClaro — ver .claude/DESIGN.md
const tint = '#2F4858'; // Tinta/Selo
const tintDark = '#7FA0AE';

export default {
  light: {
    text: '#1C1A16', // Tinta
    background: '#F7F4EC', // Papel
    surface: '#FFFFFF', // Superfície
    border: '#E2DDD0', // Bordo
    tint,
    tabIconDefault: '#8C8678',
    tabIconSelected: tint,
    favor: '#2E6B4F',
    contra: '#A23E2E',
    abstencao: '#B8862E',
    ausente: '#9C968A',
  },
  dark: {
    text: '#F3EFE6',
    background: '#16140F',
    surface: '#201D17',
    border: '#352F26',
    tint: tintDark,
    tabIconDefault: '#8C8678',
    tabIconSelected: tintDark,
    favor: '#5FA980',
    contra: '#D9836F',
    abstencao: '#D8AC54',
    ausente: '#8B857A',
  },
};
