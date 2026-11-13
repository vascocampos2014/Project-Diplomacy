import React from 'react';

import { LinhaOpcoes } from '@/components/LinhaOpcoes';
import { Chip } from '@/components/ui';

interface FiltroTemasProps {
  temas: string[];
  selecionado: string | null;
  onSelecionar: (tema: string | null) => void;
}

export function FiltroTemas({ temas, selecionado, onSelecionar }: FiltroTemasProps) {
  return (
    <LinhaOpcoes>
      <Chip label="Todos" selecionado={selecionado === null} onPress={() => onSelecionar(null)} />
      {temas.map((tema) => (
        <Chip
          key={tema}
          label={tema}
          selecionado={selecionado === tema}
          onPress={() => onSelecionar(selecionado === tema ? null : tema)}
          accessibilityLabel={`Filtrar por ${tema}`}
        />
      ))}
    </LinhaOpcoes>
  );
}
