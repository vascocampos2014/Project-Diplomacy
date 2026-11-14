// GET /api/og?id=…&iniciativaId=… → a imagem PNG de pré-visualização da votação
// (og:image). Sem votação válida devolve a imagem genérica da app.
import { ALTURA, arvoreGenerica, arvoreVotacao, fontes, LARGURA } from './_og/imagem';
import { carregarVotacao } from './_og/votacao';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let arvore;
  let encontrada = true;
  try {
    arvore = arvoreVotacao(await carregarVotacao(url.searchParams.get('id'), url.searchParams.get('iniciativaId')));
  } catch {
    arvore = arvoreGenerica();
    encontrada = false;
  }
  // @vercel/og só existe como módulo ES; o import dinâmico funciona com CommonJS também.
  const { ImageResponse } = await import('@vercel/og');
  const imagem = new ImageResponse(arvore as unknown as React.ReactElement, {
    width: LARGURA,
    height: ALTURA,
    fonts: await fontes(),
  });
  // O ImageResponse traz um Cache-Control "immutable" de um ano; aqui substitui-se.
  // Uma votação não muda depois de votada; um erro pode ser passageiro.
  return new Response(imagem.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': encontrada
        ? 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
        : 'public, max-age=300, s-maxage=300',
    },
  });
}
