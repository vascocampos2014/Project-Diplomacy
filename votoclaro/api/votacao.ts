// GET /votacao/:id para os robôs de pré-visualização (WhatsApp, iMessage,
// Telegram, redes sociais…), que não correm JavaScript e por isso só veriam o
// título genérico da app. O vercel.json só reencaminha para aqui pedidos com
// esses user-agents; as pessoas recebem a página estática de sempre.
// Devolve um HTML mínimo com o título, a descrição e a imagem da votação.
import { carregarVotacao } from './_og/votacao';

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const iniciativaId = url.searchParams.get('iniciativaId');
  const pagina = new URL(`/votacao/${encodeURIComponent(id ?? '')}`, url.origin);
  if (iniciativaId) pagina.searchParams.set('iniciativaId', iniciativaId);
  const imagem = new URL('/api/og', url.origin);
  imagem.searchParams.set('id', id ?? '');
  imagem.searchParams.set('iniciativaId', iniciativaId ?? '');

  let titulo = 'VotoClaro — Como vota o Parlamento';
  let descricao = 'Vê como cada partido votou nas leis da Assembleia da República. Dados públicos e oficiais, sem opiniões.';
  let encontrada = true;
  try {
    const v = await carregarVotacao(id, iniciativaId);
    const c = v.contagem;
    titulo = v.titulo;
    descricao = [
      `${v.resultado}${v.unanime ? ' por unanimidade' : ''}`,
      `${c.favor} a favor, ${c.contra} contra, ${c.abstencao} abstenções`,
      v.referencia,
      v.data,
    ]
      .filter(Boolean)
      .join(' · ');
  } catch {
    encontrada = false;
  }

  const t = escapar(titulo);
  const d = escapar(descricao);
  const html = `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8">
<title>${t} · VotoClaro</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${escapar(pagina.href)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="VotoClaro">
<meta property="og:locale" content="pt_PT">
<meta property="og:url" content="${escapar(pagina.href)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${escapar(imagem.href)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapar(`${titulo}. ${descricao}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${escapar(imagem.href)}">
</head><body><p><a href="${escapar(pagina.href)}">${t}</a></p><p>${d}</p></body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': encontrada ? 'public, max-age=3600, s-maxage=86400' : 'public, max-age=300',
    },
  });
}
