// Os edifícios que ilustram cada separador. As imagens vêm de
// assets/edificios/ (ver o README dessa pasta: tamanho, estilo e prompts).
// Enquanto `imagem` for null, o separador mostra só a faixa de azulejos.
//
// Para ligar uma imagem nova, troca o null por um require, por exemplo:
//   imagem: require('@/assets/edificios/sao-bento.png'),
import type { ImageSourcePropType } from 'react-native';

export type EdificioId = 'sao-bento' | 'torre-belem' | 'jeronimos' | 'casa-musica' | 'pena';

// `tinta`: a mesma gravura só com o traço (PNG com transparência, traço branco),
// para pintar de qualquer cor com tintColor. É a que vai no cabeçalho do
// computador (CabecalhoEdificio), em Ultramarine no claro e branco no escuro.
export const EDIFICIOS: Record<
  EdificioId,
  { nome: string; imagem: ImageSourcePropType | null; tinta?: ImageSourcePropType }
> = {
  'sao-bento': {
    nome: 'Palácio de São Bento, Lisboa',
    imagem: require('@/assets/edificios/sao-bento.png'),
    tinta: require('@/assets/edificios/tinta/sao-bento.png'),
  },
  'torre-belem': {
    nome: 'Torre de Belém, Lisboa',
    imagem: require('@/assets/edificios/torre-belem.png'),
    tinta: require('@/assets/edificios/tinta/torre-belem.png'),
  },
  jeronimos: {
    nome: 'Mosteiro dos Jerónimos, Lisboa',
    imagem: require('@/assets/edificios/jeronimos.png'),
    tinta: require('@/assets/edificios/tinta/jeronimos.png'),
  },
  'casa-musica': {
    nome: 'Casa da Música, Porto',
    imagem: require('@/assets/edificios/casa-musica.png'),
    tinta: require('@/assets/edificios/tinta/casa-musica.png'),
  },
  pena: { nome: 'Palácio da Pena, Sintra', imagem: null },
};
