# MRP & Compras — Grupo TBX

Planejamento de importação: estoque projetado dia a dia, ruptura, ordens de compra, embarques e sugestões de compra por fornecedor. Site em HTML único (Tailwind + Chart.js + SheetJS + Firebase), publicado no GitHub Pages.

## Como usar
1. Abra o site e vá em **Importar / Exportar**. Envie a planilha do MRP atual (.xlsb) para migrar itens, estrutura, previsão, estoque, ordens e embarques.
2. Atualize o estoque com o export do ERP (colunas **SKU** e **Total disponível**).
3. Ajuste os parâmetros em **Configurações** (segurança, cobertura, lead times, câmbio).

## Câmbio
- Previsões usam o câmbio em tempo real: comercial (AwesomeAPI, venda) ou PTAX do Banco Central (fechamento), atualizado a cada 30 minutos, com margem de segurança opcional. Também dá para informar manualmente.
- Ordens com câmbio fechado: informe o **câmbio pago** na linha da ordem (ou em várias linhas de uma vez). O valor dessas ordens usa o câmbio pago; as demais usam o de previsão.

## Armazenamento
Com `FIREBASE_CONFIG = null` (início do código), os dados ficam no navegador. Para compartilhar entre usuários, preencha o config de um projeto Firebase com login Google e Firestore. O acesso é restrito a contas @grupotbx.com.br.

## Assistente IA
O `worker.js` é um Cloudflare Worker que guarda a chave da API do Claude e responde ao site. Configure `ANTHROPIC_API_KEY` (secret) e `ALLOWED_ORIGINS`, e informe a URL do Worker em Configurações.
