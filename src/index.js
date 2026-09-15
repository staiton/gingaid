export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Rotas de QR Code dinâmico
    if (url.pathname.startsWith("/r/")) {
      // Aceita somente códigos no formato /r/0000
      if (!/^\/r\/\d{4}$/.test(url.pathname)) {
        return new Response("QR Code inválido", {
          status: 400
        });
      }

      // Extrai o código, por exemplo: /r/0001 → 0001
      const code = url.pathname.slice(3);

      // Busca o destino no Cloudflare KV
      const destination = await env.REDIRECTS.get(code);

      // Código não cadastrado
      if (!destination) {
        return new Response("QR Code não encontrado", {
          status: 404
        });
      }

      // Redirecionamento temporário
      return Response.redirect(destination, 302);
    }

    // Todas as outras páginas continuam sendo servidas
    // normalmente pelos arquivos estáticos do site.
    return env.ASSETS.fetch(request);
  }
};
