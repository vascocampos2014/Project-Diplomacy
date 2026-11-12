import type { Deputado } from '@/types';

// "Guimarães" encontra-se a escrever "guimaraes": sem acentos nem maiúsculas.
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function filtrarDeputados(deputados: Deputado[], pesquisa: string, partido: string | null): Deputado[] {
  const termo = normalizar(pesquisa);
  return deputados.filter((d) => {
    if (partido && d.partido !== partido) return false;
    if (!termo) return true;
    return [d.nome, d.partido, d.circulo].some((campo) => normalizar(campo).includes(termo));
  });
}
