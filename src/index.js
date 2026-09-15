export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Rotas dinâmicas de QR Code
    if (url.pathname.startsWith("/r/")) {
      const code = url.pathname.slice(3);

      // Evita códigos vazios
      if (!code) {
        return new Response("QR Code inválido", {
          status: 400
        });
      }

      // Procura o destino no Cloudflare KV
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

    // Todo o restante continua sendo servido pelos arquivos estáticos
    return env.ASSETS.fetch(request);
  }
};