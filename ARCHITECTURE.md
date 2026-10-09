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
- **Playwright**: testes E2E e de regressao visual em Chromium desktop e mobile, com 46 testes aprovados e oito baselines versionadas.
- **Lighthouse CI**: auditorias realizadas em desktop e mobile, com tres medicoes por pagina e perfil e relatorios HTML/JSON versionados.

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

O app é importado somente após `worker.start()` no `main.tsx`. Isso é intencional: o Socket.IO precisa capturar o `WebSocket` já interceptado pelo MSW. O endpoint real do cliente é `wss://kurio.mock/socket.io/`, mas o handler usa `ws.link('wss://kurio.mock')`, pois o MSW remove o prefixo `/socket.io/` durante o reconhecimento do WebSocket. Usar o prefixo também no handler impediria a conexão.

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

## Limitações e pontos para evolução

1. Ampliar a cobertura automatizada dos cenários avançados do enunciado, especialmente combinações de falhas de rede, sessão e eventos em tempo real.
2. Refinar a associação das mensagens de validação aos campos dos formulários onde necessário.
3. Continuar a comparação visual com o Figma nos tamanhos de 390, 768 e 1440 pixels.
4. Substituir eventuais assets provisórios pelos originais, caso estejam disponíveis.
5. Otimizar a performance mobile, cuja mediana no Lighthouse ficou em 86 pontos na página inicial e 88 nos detalhes do NFT, abaixo da meta de 90.

A regressão visual está implementada em `e2e/visual.spec.ts`, com oito capturas de referência versionadas. As auditorias Lighthouse e seus resultados estão documentados em `docs/LIGHTHOUSE_RESULTS.md`.

## Atualização de tempo real — ciclo de vida e duplicatas

- Cada instância do hook mantém uma conexão Socket.IO com listeners locais. Logout, troca de usuário e desmontagem desconectam a conexão anterior.
- `nft.updated` exige `resourceId`, `version` e `data.version` coerentes. Eventos repetidos ou anteriores ao cache são descartados; catálogo, detalhe e linha do carrinho são atualizados, seguidos de reconciliação dos valores com REST.
- `order.updated` exige `userId` compatível com a sessão, além de identidade e versão corretas. Status terminais não retrocedem para pendente.
- Em toda conexão/reconexão, as consultas ativas de catálogo, detalhe, carrinho e pedido (quando autenticado) são revalidadas via Axios/MSW.
- A UI anuncia atualizações relevantes para leitores de tela em `role=status` sem mudar o layout do Figma.
- Para reproduzir evento antigo: POST `/api/mock/nft-update` com `{"nftId":"042","priceEth":"1.79"}` e depois POST `/api/mock/replay-old-nft` com `{"nftId":"042"}`. O segundo comando reenvia uma versão antiga apenas pelo canal Socket.IO, sem alterar o banco.

## Cenários de rede e recuperação de pedidos

`src/mocks/scenarios.ts` reúne parâmetros de demonstração; `timeoutAfterOrderCreation` é consumido apenas uma vez. Neste cenário, o pedido é persistido no MSW antes da resposta HTTP ser atrasada por 9 segundos (Axios cancela a espera aos 8 segundos). O checkout grava em `localStorage` a chave de idempotência e dados da tentativa. Recarregar o checkout reconsulta `/orders/by-key/:key`, sem emitir novo POST de compra. O cenário também pode ser ativado via painel Mock tools.

Novos testes `e2e/session-cart.spec.ts` e `e2e/order-recovery.spec.ts` cobrem sessão/isolamento, carrinho do visitante e recuperação após timeout. Esses testes foram executados em desktop e mobile como parte da suite final, que terminou com 46 testes aprovados.

**Validação final:** o build de produção foi aprovado; o ESLint apresentou zero erros e quatro avisos; o Playwright concluiu 46 de 46 testes; e foram realizadas 12 auditorias Lighthouse, com relatórios versionados. A performance mobile permaneceu abaixo da meta solicitada.
