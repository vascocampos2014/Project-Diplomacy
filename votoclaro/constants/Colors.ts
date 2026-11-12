// Paleta VotoClaro — ver .claude/DESIGN.md
//
// Cores semânticas (favor/contra/abstencao/ausente) servem para barras e
// preenchimentos. Para TEXTO sobre os fundos *Bg usa as variantes *Ink: as
// cores do DESIGN.md sobre o seu próprio fundo ficam abaixo de 4.5:1 (WCAG AA),
// p. ex. #16A34A sobre #DCFCE7 = 3.0:1; #15803D = 4.6:1.

const light = {
  text: '#0D0D0D', // Tinta
  textMuted: '#5F6670',
  background: '#F7F6F2', // Papel
  surface: '#FFFFFF', // Superfície
  surfaceAlt: '#EFEDE6',
  border: '#E5E3DC', // Bordo
  tint: '#3D5AFE', // Cívico — preenchimentos, botões (texto branco 5.1:1)
  tintInk: '#2A44D9', // Cívico para texto sobre tintBg
  tintBg: '#E8ECFF',
  onTint: '#FFFFFF',
  tabIconDefault: '#5F6670',
  tabIconSelected: '#3D5AFE',

  favor: '#16A34A',
  contra: '#DC2626',
  abstencao: '#D97706',
  ausente: '#9CA3AF',
  favorBg: '#DCFCE7',
  contraBg: '#FEE2E2',
  abstencaoBg: '#FEF3C7',
  ausenteBg: '#F3F4F6',
  favorInk: '#15803D',
  contraInk: '#B91C1C',
  abstencaoInk: '#B45309',
  ausenteInk: '#4B5563',
};

const dark: typeof light = {
  text: '#F5F5F4',
  textMuted: '#A3A3A3',
  background: '#111111',
  surface: '#1C1C1C',
  surfaceAlt: '#242424',
  border: '#2A2A2A',
  tint: '#8C9EFF',
  tintInk: '#A9B6FF',
  tintBg: '#1E2550',
  onTint: '#111111',
  tabIconDefault: '#A3A3A3',
  tabIconSelected: '#8C9EFF',

  favor: '#22C55E',
  contra: '#EF4444',
  abstencao: '#F59E0B',
  ausente: '#6B7280',
  favorBg: '#14301F',
  contraBg: '#3A1717',
  abstencaoBg: '#3A2A0E',
  ausenteBg: '#262626',
  favorInk: '#4ADE80',
  contraInk: '#F87171',
  abstencaoInk: '#FBBF24',
  ausenteInk: '#A3A3A3',
};

export type Paleta = typeof light;

export default { light, dark };
