# MRP & Compras — Grupo TBX

Planejamento de importação: estoque projetado dia a dia, ruptura, ordens de compra, embarques e sugestões de compra por fornecedor. Site em HTML único (Tailwind + Chart.js + SheetJS + Firebase), publicado no GitHub Pages.

## Como usar
1. Abra o site e vá em **Importar / Exportar**. Envie a planilha do MRP atual (.xlsb) para migrar itens, estrutura, previsão, estoque, ordens e embarques.
2. Atualize o estoque com o export do ERP (colunas **SKU** e **Total disponível**).
3. Ajuste os parâmetros em **Configurações** (segurança, cobertura, lead times, câmbio).

## Vendas x Previsão
- Importe o relatório de vendas efetivas (CSV/Excel com Data do pedido, SKU, Qtd, Status expedição, Canal) em Importar / Exportar. Cancelados são ignorados e propostas comerciais ficam separadas; só totais por SKU/dia são guardados.
- As vendas dos produtos acabados são explodidas pela estrutura até os componentes comprados e comparadas com a previsão (janela de 30 a 180 dias, tolerância configurável).
- Pontos de atenção: ruptura antecipada, risco de comprar demais, vendas fora da estrutura, cobertura excessiva, mudança de tendência, vendas B2B pontuais e previsão sem venda.
- SKUs vendidos em pacote (ex.: PBG0007-5) recebem sugestão de vínculo com o componente, usando o mesmo fator do código _MKT.

## Câmbio
- Previsões usam o câmbio em tempo real: comercial (AwesomeAPI, venda) ou PTAX do Banco Central (fechamento), atualizado a cada 30 minutos, com margem de segurança opcional. Também dá para informar manualmente.
- Ordens com câmbio fechado: informe o **câmbio pago** na linha da ordem (ou em várias linhas de uma vez). O valor dessas ordens usa o câmbio pago; as demais usam o de previsão.

## Armazenamento
Com `FIREBASE_CONFIG = null` (início do código), os dados ficam no navegador. Para compartilhar entre usuários, preencha o config de um projeto Firebase com login Google e Firestore. O acesso é restrito a contas @grupotbx.com.br.

## Assistente IA
O `worker.js` é um Cloudflare Worker que guarda a chave da API do Claude e responde ao site. Configure `ANTHROPIC_API_KEY` (secret) e `ALLOWED_ORIGINS`, e informe a URL do Worker em Configurações.
