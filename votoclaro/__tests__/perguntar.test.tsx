import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import PerguntarScreen from '@/app/(tabs)/perguntar';
import { RespostaRag } from '@/components/RespostaRag';
import { citacoes, ErroPergunta, formatarResposta, perguntar, validarPergunta, type RespostaRag as Resposta } from '@/lib/perguntar';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const RESPOSTA =
  'O BE votou **a favor** [Projeto de Lei n.º 672, votação final global] e o PCP votou contra [Projeto de Lei n.º 672, votação final global].';

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

describe('perguntar (API client)', () => {
  it('posts the trimmed question and returns the answer', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(200, { resposta: 'ok', ferramentas: [{ name: 'get_votes', arguments: {} }], segundos: 3, modelo: 'm' })
    );
    const r = await perguntar('  Como votou o PS?  ', { baseUrl: 'http://api/', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith('http://api//ask', expect.objectContaining({ method: 'POST', body: JSON.stringify({ pergunta: 'Como votou o PS?', historico: [] }) }));
    expect(r).toEqual({ resposta: 'ok', ferramentas: [{ name: 'get_votes', arguments: {} }], segundos: 3, modelo: 'm' });
  });

  it.each([
    [429, 'limite'],
    [422, 'invalida'],
    [502, 'indisponivel'],
    [500, 'indisponivel'],
  ])('maps HTTP %s to %s', async (status, tipo) => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(status, { detail: 'x' }));
    await expect(perguntar('pergunta válida', { baseUrl: 'http://api', fetchImpl })).rejects.toMatchObject({ tipo });
  });

  it('reports network failures and timeouts separately', async () => {
    await expect(perguntar('pergunta', { baseUrl: 'http://api', fetchImpl: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')) })).rejects.toMatchObject({ tipo: 'rede' });
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    await expect(perguntar('pergunta', { baseUrl: 'http://api', fetchImpl: jest.fn().mockRejectedValue(abort) })).rejects.toMatchObject({ tipo: 'tempo' });
  });

  it('aborts a request that takes too long', async () => {
    jest.useFakeTimers();
    const fetchImpl = jest.fn((_url, init: RequestInit) => new Promise<Response>((_, reject) => init.signal!.addEventListener('abort', () => reject(Object.assign(new Error('a'), { name: 'AbortError' })))));
    const p = perguntar('pergunta', { baseUrl: 'http://api', fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 1000 });
    jest.advanceTimersByTime(1001);
    await expect(p).rejects.toMatchObject({ tipo: 'tempo' });
    jest.useRealTimers();
  });

  it('rejects malformed bodies and never calls the API for invalid questions', async () => {
    await expect(perguntar('pergunta', { baseUrl: 'http://api', fetchImpl: jest.fn().mockResolvedValue(jsonResponse(200, { nada: 1 })) })).rejects.toMatchObject({ tipo: 'indisponivel' });
    const fetchImpl = jest.fn();
    await expect(perguntar('  a ', { baseUrl: 'http://api', fetchImpl })).rejects.toMatchObject({ tipo: 'invalida' });
    await expect(perguntar('x'.repeat(501), { baseUrl: 'http://api', fetchImpl })).rejects.toMatchObject({ tipo: 'invalida' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('is unavailable without a backend URL', async () => {
    await expect(perguntar('pergunta', { baseUrl: '' })).rejects.toMatchObject({ tipo: 'indisponivel' });
  });

  it('validates length after trimming', () => {
    expect(validarPergunta('  abc ')).toBe('abc');
    expect(validarPergunta('ab')).toBeNull();
    expect(validarPergunta('x'.repeat(500))).not.toBeNull();
  });
});

describe('formatting the answer', () => {
  it('splits bold text and citations, numbering repeated sources once', () => {
    expect(citacoes(RESPOSTA)).toEqual(['Projeto de Lei n.º 672, votação final global']);
    const [p] = formatarResposta(RESPOSTA);
    expect(p.pedacos).toEqual([
      { tipo: 'texto', texto: 'O BE votou ' },
      { tipo: 'texto', texto: 'a favor', negrito: true },
      { tipo: 'citacao', texto: 'Projeto de Lei n.º 672, votação final global' },
      { tipo: 'texto', texto: ' e o PCP votou contra' },
      { tipo: 'citacao', texto: 'Projeto de Lei n.º 672, votação final global' },
      { tipo: 'texto', texto: '.' },
    ]);
  });

  it('treats list lines as items and keeps other brackets as text', () => {
    const ps = formatarResposta('Iniciativas:\n\n- **Projeto de Lei n.º 373** [Projeto de Lei n.º 373, Artigo 2.º]\n- outra [nota]');
    expect(ps.map((p) => p.item)).toEqual([false, true, true]);
    expect(ps[2].pedacos).toEqual([{ tipo: 'texto', texto: 'outra [nota]' }]);
    expect(citacoes('Proposta de Resolução [Proposta de Resolução n.º 12, votação de 2026-01-01]')).toEqual(['Proposta de Resolução n.º 12, votação de 2026-01-01']);
  });

  it('renders model output as text, never as markup', () => {
    render(<RespostaRag texto={'<script>alert(1)</script> **ok** [Projeto de Lei n.º 1, Artigo 1.º]'} />);
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeTruthy();
    expect(screen.getByLabelText('fonte 1: Projeto de Lei n.º 1, Artigo 1.º')).toBeTruthy();
    expect(screen.getByText('FONTES')).toBeTruthy();
  });

  it('shows no sources section when the answer cites nothing', () => {
    render(<RespostaRag texto="Não encontrei essa informação nos dados." />);
    expect(screen.queryByText('FONTES')).toBeNull();
  });
});

describe('Perguntar screen', () => {
  const ok = (resposta = RESPOSTA): Resposta => ({ resposta, ferramentas: [], segundos: 1, modelo: 'm' });

  it('says "em breve" when no backend is configured', () => {
    render(<PerguntarScreen apiUrl="" />);
    expect(screen.getByText('Disponível em breve')).toBeTruthy();
    expect(screen.queryByLabelText('Pergunta')).toBeNull();
  });

  it('shows the AI disclaimer and suggestions, and a suggestion asks it', async () => {
    const fake = jest.fn().mockResolvedValue(ok());
    render(<PerguntarScreen apiUrl="http://api" perguntar={fake} />);
    expect(screen.getByText(/geradas por IA/)).toBeTruthy();
    expect(screen.getByText(/não escrevas dados pessoais/)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Perguntar: O que propõe o Projeto de Lei 672?' }));
    expect(fake).toHaveBeenCalledWith('O que propõe o Projeto de Lei 672?', { baseUrl: 'http://api', historico: [] });
    expect(await screen.findByText('FONTES')).toBeTruthy();
  });

  it('sends a typed question, shows loading, then the answer with sources', async () => {
    let resolver!: (r: Resposta) => void;
    const fake = jest.fn(() => new Promise<Resposta>((r) => (resolver = r)));
    render(<PerguntarScreen apiUrl="http://api" perguntar={fake} />);

    const enviar = screen.getByRole('button', { name: 'Enviar pergunta' });
    expect(enviar.props.accessibilityState.disabled).toBe(true);
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'Como votou o BE no 672?');
    expect(screen.getByRole('button', { name: 'Enviar pergunta' }).props.accessibilityState.disabled).toBe(false);
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(screen.getByText('Como votou o BE no 672?')).toBeTruthy();
    expect(screen.getByLabelText('A procurar a resposta')).toBeTruthy();
    expect(screen.getByLabelText('Pergunta').props.value).toBe('');
    expect(screen.getByRole('button', { name: 'Enviar pergunta' }).props.accessibilityState.disabled).toBe(true);

    await act(async () => resolver(ok()));
    expect(screen.queryByLabelText('A procurar a resposta')).toBeNull();
    expect(screen.getByText('a favor')).toBeTruthy();
    expect(screen.getByText('Projeto de Lei n.º 672, votação final global')).toBeTruthy();
  });

  it('shows a helpful error with a retry that asks again', async () => {
    const fake = jest
      .fn()
      .mockRejectedValueOnce(new ErroPergunta('limite', 'Muitas perguntas seguidas. Espera um minuto e tenta de novo.'))
      .mockResolvedValueOnce(ok('Agora sim.'));
    render(<PerguntarScreen apiUrl="http://api" perguntar={fake} />);
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'pergunta válida');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByText(/Espera um minuto/)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Agora sim.')).toBeTruthy();
    expect(fake).toHaveBeenCalledTimes(2);
  });

  it('does not leak unexpected error details to the user', async () => {
    const fake = jest.fn().mockRejectedValue(new Error('stack trace with secrets'));
    render(<PerguntarScreen apiUrl="http://api" perguntar={fake} />);
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'pergunta válida');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));
    expect(await screen.findByText(/indisponível de momento/)).toBeTruthy();
    expect(screen.queryByText(/secrets/)).toBeNull();
  });

  it('clears the conversation', async () => {
    render(<PerguntarScreen apiUrl="http://api" perguntar={jest.fn().mockResolvedValue(ok('Resposta.'))} />);
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'pergunta válida');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));
    await screen.findByText('Resposta.');
    fireEvent.press(screen.getByRole('button', { name: 'Nova conversa' }));
    await waitFor(() => expect(screen.queryByText('Resposta.')).toBeNull());
    expect(screen.getByText('EXPERIMENTA PERGUNTAR')).toBeTruthy();
  });
});

describe('conversation context', () => {
  it('sends only the last answered turns, trimmed', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { resposta: 'ok', ferramentas: [], segundos: 1, modelo: 'm' }));
    const turnos = [1, 2, 3, 4].map((i) => ({ pergunta: `p${i}`, resposta: `r${i}`.padEnd(3000, 'x') }));
    await perguntar('e como se tivesse 10 anos?', { baseUrl: 'http://api', fetchImpl, historico: [...turnos, { pergunta: 'sem resposta', resposta: ' ' }] });
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.historico.map((t: { pergunta: string }) => t.pergunta)).toEqual(['p2', 'p3', 'p4']);
    expect(body.historico.every((t: { resposta: string }) => t.resposta.length === 1500)).toBe(true);
  });

  it('a follow-up question carries the earlier answer; a new conversation does not', async () => {
    const fake = jest
      .fn()
      .mockResolvedValueOnce({ resposta: 'O OE define receitas e despesas.', ferramentas: [], segundos: 1, modelo: 'm' })
      .mockResolvedValue({ resposta: 'Versão simples.', ferramentas: [], segundos: 1, modelo: 'm' });
    render(<PerguntarScreen apiUrl="http://api" perguntar={fake} />);
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'o que é o orkamento de estado');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));
    await screen.findByText('O OE define receitas e despesas.');

    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'explica como se tivesse 10 anos');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));
    await screen.findByText('Versão simples.');
    expect(fake.mock.calls[1][1].historico).toEqual([{ pergunta: 'o que é o orkamento de estado', resposta: 'O OE define receitas e despesas.' }]);

    fireEvent.press(screen.getByRole('button', { name: 'Nova conversa' }));
    fireEvent.changeText(screen.getByLabelText('Pergunta'), 'outra pergunta');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar pergunta' }));
    await waitFor(() => expect(fake).toHaveBeenCalledTimes(3));
    expect(fake.mock.calls[2][1].historico).toEqual([]);
  });
});
