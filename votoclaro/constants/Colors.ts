// Paleta VotoClaro — ver .claude/DESIGN.md
//
// Mundo: o boletim de voto. Papel branco sobre Bright Snow, linhas a tinta
// Carbon, e o azul ultramarino como a caneta que marca o ✕.
//
// Papéis (definidos pelo utilizador, da esquerda para a direita):
//   Bright Snow #F8F9FA  primária: fundo
//   Carbon      #232323  secundária: texto, linhas, base do modo escuro
//   Ultramarine #120A8F  acento: a caneta (marcas ✕, ligações, ações)
//   Blue Bell   #449DD1  acento: "onde estás" (separador ativo, foco, seleção)
//
// Contraste medido: #449DD1 sobre #F8F9FA dá só 2.85:1, por isso nunca é cor
// de texto no modo claro. #120A8F sobre #232323 dá 1.1:1, por isso no modo
// escuro a caneta passa a ser Blue Bell (5.2:1).
//
// favor/contra/abstencao/ausente são cores de dados (barras, contagens).
// Para TEXTO usa as variantes *Ink, que passam AA sobre o fundo e os *Bg.

const light = {
  text: '#232323', // Carbon
  textMuted: '#585D64', // 6.3:1 sobre #F8F9FA
  background: '#F8F9FA', // Bright Snow
  surface: '#FFFFFF', // o papel do boletim
  surfaceAlt: '#EEF0F3',
  border: '#DADDE2', // linhas finas entre filas
  rule: '#232323', // linha a tinta do boletim
  tint: '#120A8F', // Ultramarine — a caneta
  tintInk: '#120A8F',
  tintBg: '#E8E7F4',
  onTint: '#FFFFFF', // 14.3:1 sobre #120A8F
  marcador: '#449DD1', // Blue Bell — só para "onde estás"
  tabIconDefault: '#585D64',
  tabIconSelected: '#120A8F',

  favor: '#15803D',
  contra: '#B91C1C',
  abstencao: '#B45309',
  ausente: '#9CA3AF',
  favorBg: '#E3F3E8',
  contraBg: '#FBE7E7',
  abstencaoBg: '#FBEEDD',
  ausenteBg: '#EEF0F3',
  favorInk: '#15803D',
  contraInk: '#B91C1C',
  abstencaoInk: '#B45309',
  ausenteInk: '#4B5563',
};

const dark: typeof light = {
  text: '#F1F2F4',
  textMuted: '#A9AEB5',
  background: '#232323', // Carbon
  surface: '#2C2C2D',
  surfaceAlt: '#343537',
  border: '#424448',
  rule: '#8D9299',
  tint: '#449DD1', // Blue Bell passa a ser a caneta (5.2:1 sobre #232323)
  tintInk: '#7FBFE6',
  tintBg: '#1F3A4D',
  onTint: '#141414',
  marcador: '#449DD1',
  tabIconDefault: '#A9AEB5',
  tabIconSelected: '#7FBFE6',

  favor: '#22C55E',
  contra: '#EF4444',
  abstencao: '#F59E0B',
  ausente: '#6B7280',
  favorBg: '#18331F',
  contraBg: '#3D1C1C',
  abstencaoBg: '#3B2C12',
  ausenteBg: '#343537',
  favorInk: '#4ADE80',
  contraInk: '#F87171',
  abstencaoInk: '#FBBF24',
  ausenteInk: '#A9AEB5',
};

export type Paleta = typeof light;

export default { light, dark };
