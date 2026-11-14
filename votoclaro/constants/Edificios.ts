// Os edifícios que ilustram cada separador. As imagens vêm de
// assets/edificios/ (ver o README dessa pasta: tamanho, estilo e prompts).
// Enquanto `imagem` for null, o separador mostra só a faixa de azulejos.
//
// Para ligar uma imagem nova, troca o null por um require, por exemplo:
//   imagem: require('@/assets/edificios/sao-bento.png'),
import type { ImageSourcePropType } from 'react-native';

export type EdificioId = 'sao-bento' | 'torre-belem' | 'jeronimos' | 'pena';

export const EDIFICIOS: Record<EdificioId, { nome: string; imagem: ImageSourcePropType | null }> = {
  'sao-bento': { nome: 'Palácio de São Bento, Lisboa', imagem: null },
  'torre-belem': { nome: 'Torre de Belém, Lisboa', imagem: null },
  jeronimos: { nome: 'Mosteiro dos Jerónimos, Lisboa', imagem: null },
  pena: { nome: 'Palácio da Pena, Sintra', imagem: null },
};
