// Amostra de tinta de um sentido de voto: cheia (a favor), tracejada (contra),
// papel com contorno (abstenção), cinzenta (ausente). O mesmo código do hemiciclo.
// Ficheiro à parte para não criar um ciclo Hemiciclo ↔ VotoIndicator.
import React, { useId } from 'react';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { useCores } from '@/components/ui';
import type { Posicao } from '@/types';

export function Amostra({ posicao, tamanho = 12 }: { posicao: Posicao; tamanho?: number }) {
  const cores = useCores();
  const id = `am${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const tinta = cores.favor;
  const fill =
    posicao === 'favor' ? tinta : posicao === 'contra' ? `url(#${id})` : posicao === 'abstencao' ? cores.abstencao : cores.ausente;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden>
      {posicao === 'contra' ? (
        <Defs>
          <Pattern id={id} width={3} height={3} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <Rect width={3} height={3} fill={cores.abstencao} />
            <Line x1={0} y1={0} x2={0} y2={3} stroke={tinta} strokeWidth={1.1} />
          </Pattern>
        </Defs>
      ) : null}
      <Rect x={1} y={1} width={10} height={10} rx={2} fill={fill} stroke={posicao === 'ausente' ? cores.ausente : tinta} strokeWidth={1} />
    </Svg>
  );
}
