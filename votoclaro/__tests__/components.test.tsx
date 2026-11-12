import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { AfinidadeQuestaoCard } from '@/components/AfinidadeQuestaoCard';
import { ContagemVotos, ResultadoBadge } from '@/components/ContagemVotos';
import { DeputadoRow } from '@/components/DeputadoRow';
import { EcraVazio } from '@/components/EcraVazio';
import { EstatisticasVotacao } from '@/components/EstatisticasVotacao';
import { FiltroPosicao } from '@/components/FiltroPosicao';
import { FiltroTemas } from '@/components/FiltroTemas';
import { PartidoBar } from '@/components/PartidoBar';
import { Botao, Chip } from '@/components/ui';
import { VotacaoCard } from '@/components/VotacaoCard';
import { VotoIndicator } from '@/components/VotoIndicator';

describe('VotoIndicator', () => {
  it.each([
    ['favor', '✓', 'Voto a favor'],
    ['contra', '✗', 'Voto contra'],
    ['abstencao', '—', 'Abstenção'],
    ['ausente', '·', 'Ausente'],
  ] as const)('%s always has a symbol and an accessible label', (posicao, simbolo, label) => {
    render(<VotoIndicator posicao={posicao} />);
    expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByText(simbolo)).toBeTruthy();
  });

  it('shows the text label on request', () => {
    render(<VotoIndicator posicao="contra" showLabel />);
    expect(screen.getByText('Contra')).toBeTruthy();
  });
});

describe('ContagemVotos', () => {
  it('shows a pill per position and hides absent when zero', () => {
    render(<ContagemVotos favor={91} contra={79} abstencao={60} ausentes={0} />);
    expect(screen.getByLabelText('91 a favor')).toBeTruthy();
    expect(screen.getByLabelText('79 contra')).toBeTruthy();
    expect(screen.getByLabelText('60 abstenção')).toBeTruthy();
    expect(screen.queryByLabelText(/ausente/)).toBeNull();
  });

  it('shows absent when there are absences', () => {
    render(<ContagemVotos favor={1} contra={0} abstencao={0} ausentes={3} />);
    expect(screen.getByLabelText('3 ausente')).toBeTruthy();
  });
});

describe('ResultadoBadge', () => {
  it.each([
    ['aprovada', 'Aprovada'],
    ['chumbada', 'Chumbada'],
    ['pendente', 'Pendente'],
  ] as const)('%s', (resultado, texto) => {
    render(<ResultadoBadge resultado={resultado} />);
    expect(screen.getByText(texto)).toBeTruthy();
  });
});

describe('VotacaoCard', () => {
  const props = {
    titulo: 'Orçamento do Estado para 2027',
    referencia: 'Proposta de Lei n.º 110',
    tema: 'Economia',
    data: '28 Out 2026',
    resultado: 'aprovada' as const,
    favor: 91,
    contra: 79,
    abstencao: 60,
    ausentes: 0,
  };

  it('renders title, reference, theme, date and result', () => {
    render(<VotacaoCard {...props} onPress={() => {}} />);
    for (const t of ['Orçamento do Estado para 2027', 'Proposta de Lei n.º 110', 'ECONOMIA', '28 Out 2026', 'Aprovada']) {
      expect(screen.getByText(t)).toBeTruthy();
    }
  });

  it('is one accessible button that opens the vote', () => {
    const onPress = jest.fn();
    render(<VotacaoCard {...props} onPress={onPress} />);
    const botao = screen.getByRole('button', { name: /Orçamento do Estado para 2027, Proposta de Lei n\.º 110, Economia, 28 Out 2026, Aprovada/ });
    fireEvent.press(botao);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides counts when there are no votes recorded', () => {
    render(<VotacaoCard {...props} favor={0} contra={0} abstencao={0} onPress={() => {}} />);
    expect(screen.queryByLabelText(/a favor$/)).toBeNull();
  });
});

describe('EstatisticasVotacao', () => {
  it('shows counts and percentages', () => {
    render(<EstatisticasVotacao favor={91} contra={79} abstencao={60} ausentes={0} />);
    expect(screen.getByLabelText('A favor: 91 votos, 39.6%')).toBeTruthy();
    expect(screen.getByLabelText('Ausente: 0 votos, 0.0%')).toBeTruthy();
  });

  it('does not divide by zero', () => {
    render(<EstatisticasVotacao favor={0} contra={0} abstencao={0} ausentes={0} />);
    expect(screen.getAllByText('0.0%')).toHaveLength(4);
  });
});

describe('DeputadoRow', () => {
  it('shows name, party, constituency and the vote', () => {
    render(<DeputadoRow nome="Aida Carvalho" partido="PS" circulo="Guarda" posicao="abstencao" />);
    expect(screen.getByLabelText('Aida Carvalho, PS, Guarda')).toBeTruthy();
    expect(screen.getByLabelText('Abstenção')).toBeTruthy();
  });

  it('is a button when it navigates', () => {
    const onPress = jest.fn();
    render(<DeputadoRow nome="Aida Carvalho" partido="PS" circulo="Guarda" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Aida Carvalho, PS, Guarda' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('falls back to initials without a photo', () => {
    render(<DeputadoRow nome="Aida Carvalho" partido="PS" circulo="Guarda" />);
    expect(screen.getByText('AC')).toBeTruthy();
  });
});

describe('PartidoBar', () => {
  it('labels the bar for screen readers', () => {
    render(<PartidoBar partido="PSD" percentagem={45} legenda="a favor" />);
    expect(screen.getByLabelText('PSD: 45% a favor')).toBeTruthy();
  });
});

describe('filters', () => {
  it('FiltroTemas selects and toggles off', () => {
    const onSelecionar = jest.fn();
    const { rerender } = render(<FiltroTemas temas={['Saúde', 'Habitação']} selecionado={null} onSelecionar={onSelecionar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Filtrar por Saúde' }));
    expect(onSelecionar).toHaveBeenLastCalledWith('Saúde');

    rerender(<FiltroTemas temas={['Saúde', 'Habitação']} selecionado="Saúde" onSelecionar={onSelecionar} />);
    expect(screen.getByRole('button', { name: 'Filtrar por Saúde' }).props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Filtrar por Saúde' }));
    expect(onSelecionar).toHaveBeenLastCalledWith(null);
  });

  it('FiltroPosicao filters by vote', () => {
    const onSelecionar = jest.fn();
    render(<FiltroPosicao selecionado={null} onSelecionar={onSelecionar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Mostrar votações: Contra' }));
    expect(onSelecionar).toHaveBeenCalledWith('contra');
  });
});

describe('AfinidadeQuestaoCard', () => {
  it('offers three answers as radio buttons and reports the choice', () => {
    const onResponder = jest.fn();
    render(<AfinidadeQuestaoCard tema="Habitação" afirmacao="Uma afirmação." respostaSelecionada="neutro" onResponder={onResponder} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Neutro' }).props.accessibilityState.checked).toBe(true);
    fireEvent.press(screen.getByRole('radio', { name: 'Discordo' }));
    expect(onResponder).toHaveBeenCalledWith('discordo');
  });
});

describe('primitives', () => {
  it('Botao respects disabled', () => {
    const onPress = jest.fn();
    render(<Botao label="Partilhar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button', { name: 'Partilhar' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('Chip without onPress is not a button', () => {
    render(<Chip label="ECONOMIA" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('ECONOMIA')).toBeTruthy();
  });

  it('EcraVazio offers its action', () => {
    const onPress = jest.fn();
    render(<EcraVazio icone="cloud-off" titulo="Não foi possível carregar" descricao="Tenta de novo." accao={{ label: 'Tentar de novo', onPress }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onPress).toHaveBeenCalled();
  });
});
