// Paleta VotoClaro — ver .claude/DESIGN.md
//
// Mundo: o azulejo. Papel branco sobre Bright Snow, o azul ultramarino do
// azulejo nas faixas, títulos e ações, e os resultados desenhados a tinta
// (preto, tracejado, vazio), nunca em verde/vermelho.
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
// favor/contra/abstencao/ausente são a TINTA dos resultados: a favor é tinta
// cheia, contra é tinta tracejada (o padrão é desenhado pelo componente),
// abstenção é papel com contorno e ausente é cinzento. O sentido nunca vem
// só da cor: há sempre textura e texto.

const light = {
  text: '#232323', // Carbon
  textMuted: '#585D64', // 6.3:1 sobre #F8F9FA
  background: '#F8F9FA', // Bright Snow
  surface: '#FFFFFF', // o papel do boletim
  surfaceAlt: '#EEF0F3',
  border: '#DADDE2', // linhas finas entre filas
  rule: '#232323', // linha a tinta
  tint: '#120A8F', // Ultramarine — a caneta
  tintInk: '#120A8F',
  tintBg: '#E8E7F4',
  onTint: '#FFFFFF', // 14.3:1 sobre #120A8F
  marcador: '#449DD1', // Blue Bell — só para "onde estás"
  tabIconDefault: '#585D64',
  tabIconSelected: '#120A8F',

  favor: '#232323', // tinta cheia
  contra: '#232323', // tinta tracejada
  abstencao: '#FFFFFF', // papel com contorno
  ausente: '#C9CDD3',
  contraMini: '#8A8F96', // contra em tamanho pequeno, onde o tracejado não se lê
  favorBg: '#EEF0F3',
  contraBg: '#EEF0F3',
  abstencaoBg: '#EEF0F3',
  ausenteBg: '#EEF0F3',
  favorInk: '#232323',
  contraInk: '#232323',
  abstencaoInk: '#232323',
  ausenteInk: '#585D64',
  azulejo: '#120A8F', // linhas do azulejo
  azulejoFundo: '#FFFFFF',
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

  favor: '#F1F2F4',
  contra: '#F1F2F4',
  abstencao: '#2C2C2D',
  ausente: '#55585D',
  contraMini: '#8D9299',
  favorBg: '#343537',
  contraBg: '#343537',
  abstencaoBg: '#343537',
  ausenteBg: '#343537',
  favorInk: '#F1F2F4',
  contraInk: '#F1F2F4',
  abstencaoInk: '#F1F2F4',
  ausenteInk: '#A9AEB5',
  azulejo: '#449DD1',
  azulejoFundo: '#2C2C2D',
};

export type Paleta = typeof light;

export default { light, dark };
