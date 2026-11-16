// Navegar a partir da barra do topo começa sempre a lista "do zero". Os
// separadores ficam montados, por isso os filtros que vivem no estado do ecrã
// (círculo, resultado, tipo, pesquisa) sobreviviam à navegação e o utilizador
// tinha de carregar em "Todos" dentro da página. A barra avisa o ecrã, que
// limpa tudo e aplica só o filtro pedido (ou nenhum, em "ver todas").
import { useEffect, useRef } from 'react';

export type Lista = 'votacoes' | 'deputados';
export type FiltroInicial = { tema?: string; partido?: string };

type Ouvinte = (lista: Lista, filtro: FiltroInicial) => void;
const ouvintes = new Set<Ouvinte>();

export function limparFiltros(lista: Lista, filtro: FiltroInicial = {}) {
  ouvintes.forEach((f) => f(lista, filtro));
}

export function useLimparFiltros(lista: Lista, limpar: (filtro: FiltroInicial) => void) {
  const ref = useRef(limpar);
  ref.current = limpar;
  useEffect(() => {
    const f: Ouvinte = (l, filtro) => {
      if (l === lista) ref.current(filtro);
    };
    ouvintes.add(f);
    return () => {
      ouvintes.delete(f);
    };
  }, [lista]);
}
