// Cloudflare Worker — ponte entre o site MRP & Compras e a API do Claude.
// A chave da API fica guardada aqui (variável secreta ANTHROPIC_API_KEY), nunca no site.
//
// Variáveis do Worker (Settings → Variables):
//   ANTHROPIC_API_KEY  (secret)  chave criada em console.anthropic.com
//   ALLOWED_ORIGINS    (texto)   ex.: https://wellintonluz-ops.github.io
//   MODEL              (texto)   opcional, padrão claude-sonnet-5-5

const SYSTEM = `Você é o analista de suprimentos da Grupo TBX (e-commerce e importação, Garuva-SC).
Recebe um resumo do MRP de itens importados da China (estoque, demanda diária, ordens em aberto, ruptura projetada e sugestão de compra calculadas pelo sistema).
Regras:
- Os números vêm do MRP; não invente dados que não estejam no resumo. Se faltar informação, diga o que falta.
- Responda em português do Brasil, direto ao ponto, com prioridades claras (o que fazer hoje, esta semana, este mês).
- Agrupe recomendações por fornecedor quando fizer sentido (fechar container, pedido mínimo).
- Aponte riscos: itens que rompem antes da chegada das ordens, ordens com chegada vencida, compras que parecem exageradas.
- A decisão final de compra é do comprador; você recomenda e justifica.
- Use listas e, quando ajudar, tabelas curtas em markdown.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': okOrigin ? origin || '*' : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
    if (!okOrigin) return json({ error: 'Origem não autorizada' }, 403);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
    const pergunta = String(body.pergunta || '').slice(0, 4000);
    const contexto = String(body.contexto || '').slice(0, 60000);
    if (!pergunta) return json({ error: 'Pergunta vazia' }, 400);

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: env.MODEL || 'claude-sonnet-5-5',
        max_tokens: 2500,
        system: SYSTEM,
        messages: [{ role: 'user', content: `${pergunta}\n\n<dados_mrp>\n${contexto}\n</dados_mrp>` }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return json({ error: data?.error?.message || 'Erro na API' }, 502);
    const resposta = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    return json({ resposta, uso: data.usage });
  },
};
