# Arquitetura — Kurio Frontend Challenge

## Objetivo desta base

Esta base foi montada a partir das telas desktop/mobile fornecidas e do README do desafio. Ela prioriza uma arquitetura fácil de entender, com as tecnologias obrigatórias participando do fluxo real da aplicação.

## Responsabilidades

- **TanStack Router**: rotas, acesso direto, 404, search params do catálogo e proteção simples de checkout/conta.
- **TanStack Query**: queries/mutations, cache, loading/erro, invalidação e atualização otimista do carrinho/favoritos.
- **Axios**: todo REST passa por `src/api/client.ts`.
- **MSW**: API simulada, persistência em `localStorage`, usuários, catálogo, carrinho, pedidos e cenários.
- **Socket.IO + @mswjs/socket.io-binding**: canal real de Socket.IO interceptado pelo MSW para `nft.updated` e `order.updated`.
- **Tailwind CSS**: layout responsivo e identidade visual inspirada no Figma.
- **shadcn/ui**: componentes copiados para `src/components/ui`, baseados em Radix e totalmente customizáveis.
- **Playwright**: smoke tests em desktop/mobile. Amplie para os 12 cenários do enunciado.
- **Lighthouse CI**: configuração inicial com as metas do desafio.

## Fluxo de dados

`Página/Componente -> Hook TanStack Query -> API module -> Axios -> MSW handler -> Mock DB`

A UI não conhece fixtures nem respostas falsas. Isso evita colocar lógica de mock dentro de componentes.

## Sessão

O token fictício fica em `localStorage` apenas para sustentar refresh do desafio. Senhas ficam somente no banco simulado do MSW e nunca são persistidas pelo código de UI. A API envia `401` para sessão inválida. Ao fazer logout, o `QueryClient` é limpo para não reaproveitar dados privados de outro usuário.

Credenciais de demonstração:

- `collector@kurio.test` / `12345678`
- `second@kurio.test` / `12345678`

## Carrinho de visitante e login

O Axios envia um `x-guest-id`. O carrinho do visitante usa esse ID. No login, os itens do visitante são mesclados no carrinho do usuário autenticado.

## ETH

Valores de ETH são transportados como strings. `decimal.js` é usado nos cálculos de subtotal, desconto, taxa e total para evitar erros de ponto flutuante.

## Idempotência

O checkout cria uma chave com `crypto.randomUUID()`. O mock de pedidos guarda a assinatura do payload. Repetir a mesma chave com o mesmo conteúdo recupera o pedido; reutilizá-la com conteúdo diferente retorna conflito `409`.

## Tempo real

O app é importado somente após `worker.start()` no `main.tsx`. Isso é intencional: o Socket.IO precisa capturar o `WebSocket` já interceptado pelo MSW.

Eventos:

- `nft.updated`: invalida catálogo/carrinho e atualiza detalhe somente se a versão recebida for mais nova.
- `order.updated`: é aceito somente para a sessão atual e não sobrescreve uma versão mais nova.

Ao reconectar, o hook invalida recursos ativos para reconciliar o estado com REST.

## Cache

- catálogo/detalhe: `staleTime` curto para permitir atualizações frequentes;
- carrinho: mais agressivo, por ser sensível a preço/quantidade;
- sessão: 30 segundos;
- mutações importantes usam `invalidateQueries` ou `setQueryData`.

A atualização de quantidade do carrinho e favoritos são otimistas e possuem rollback.

## Figma/responsividade

A mesma árvore de componentes é reaproveitada. Desktop e mobile mudam principalmente por classes responsivas. O Figma mostrou:

- header desktop e bottom navigation mobile;
- sidebar de filtros desktop e dialog/drawer mobile;
- autenticação modal no desktop e tela dedicada no mobile;
- grids/cards reaproveitados;
- layouts de carrinho/detalhe/checkout reorganizados no mobile.

## Pontos que ainda devem ser aprofundados antes da entrega final

1. Validar todos os formulários com mensagens específicas e associação `aria-describedby`.
2. Completar todos os cenários MSW do enunciado (timeout real, expiração temporizada, out-of-order configurável etc.).
3. Cobrir os 12 cenários Playwright e gerar baselines visuais.
4. Rodar Lighthouse, salvar HTML/JSON e registrar medianas.
5. Substituir os SVGs placeholder pelos assets originais do Figma, se disponíveis.
6. Refinar pixel-perfect comparando 390/768/1440.
