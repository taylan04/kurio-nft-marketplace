# Contratos REST e eventos — ambiente simulado

A interface chama `/api` exclusivamente via Axios (`src/api/client.ts`), e o service worker MSW intercepta as chamadas. A autenticação utiliza `Authorization: Bearer <token fictício>` e o carrinho visitante utiliza `x-guest-id`. Preços ETH são **strings decimais**, nunca floats nos payloads; quantidades são inteiras.

## Recursos

| Método | Endpoint | Operação / resposta |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastro, `201` com `{token,user}` |
| `POST` | `/auth/login` | Login, `200` com `{token,user}` |
| `GET` | `/auth/session` | Sessão autenticada ou `401` |
| `POST` | `/auth/logout` | Revoga sessão, `204` |
| `GET` | `/nfts` | `q,category,network,minPrice,maxPrice,sort,page`; `{items,page,pageSize,total,totalPages}` |
| `GET` | `/nfts/:id` | NFT ou `404` |
| `GET` | `/favorites` | `{ids:string[]}` autenticado |
| `POST`/`DELETE` | `/favorites/:id` | Adiciona/remove favorito, `204` |
| `GET` | `/cart` | Itens, linhas e cotação atual |
| `POST` | `/cart/items` | `{nftId,edition,quantity}`, `201` |
| `PATCH` | `/cart/items/:id` | `{edition,quantity}`, carrinho revisado |
| `DELETE` | `/cart/items/:id` | Remove item, carrinho revisado |
| `GET` | `/quote` | Cotação atual sem alterar o cupom |
| `POST` | `/quote` | `{coupon?:string}` valida/aplica/remove cupom |
| `POST` | `/orders` | Pedido idempotente (header `Idempotency-Key`) |
| `GET` | `/orders/by-key/:key` | Recupera tentativa anterior do usuário atual |
| `GET` | `/orders/:id` | Estado e snapshot/recibo do pedido do usuário |
| `GET`/`PATCH` | `/profile` | Consulta/altera perfil autenticado |
| `POST` | `/profile/password` | `{currentPassword,newPassword}`, `204` |
| `GET` | `/wallets` | Carteiras do usuário |
| `POST` | `/wallets` | Cria carteira ou atualiza quando inclui `id` existente |

`Quote`: `{ subtotalEth, discountEth, networkFeeEth, totalEth, coupon?, revision, stale }`. No checkout, o cliente envia a cotação e os itens esperados. O servidor responde `409` se houver divergência de preço, estoque, quantidade ou cupom; o usuário deve rever o resumo.

`Order`: contém `id`, `userId`, `status` (`pending`, `confirmed`, `declined`), `version`, `idempotencyKey`, `collector`, `lines`, `quote`, `transactionHash` (simulado). A mesma chave + mesmo payload devolve o mesmo pedido; mesma chave + payload diferente devolve `409`. Somente pedidos confirmados encerram a compra e alteram o estoque; pedido recusado mantém o carrinho.

**Erros:** `400` entrada inválida/chave ausente, `401` sessão inválida ou expirada, `403` carteira de terceiro, `404` NFT/carteira/pedido inexistente, `409` e-mail cadastrado/conflito de cotação ou idempotência, `422` campos/cupom inválidos; `500` falha transitória controlada por cenário. O conteúdo padrão de erro é `{message}`, com `fields` ou `quote` quando relevante.

## Socket.IO / MSW

O cliente chama `io('wss://kurio.mock', { path:'/socket.io/', transports:['websocket'] })`. O servidor simulado usa `@mswjs/socket.io-binding` e o handler `ws.link('wss://kurio.mock')` (URL normalizada pelo MSW). **O transporte utiliza o cliente Socket.IO de verdade**, mas o backend é interceptado no browser e não permite conexões entre navegadores independentes.

| Evento | Envelope | Efeito |
| --- | --- | --- |
| `nft.updated` | `{resourceId, version, data: NFT}` | Preço e estoque para catálogo, detalhe e carrinho; descarta versões antigas |
| `order.updated` | `{resourceId, userId, version, data: Order}` | Estado de compra; exige a mesma sessão e versão crescente |

Ao reconectar, o cliente invalida consultas ativas para reconciliar com REST. Listeners são removidos ao encerrar sessão ou desmontar o hook.

## Limites conhecidos

MSW preserva o estado no `localStorage` do navegador, não em um banco compartilhado; pagamento, transação, blockchain e carteira são totalmente simulados. O cenário de timeout demonstra perda da resposta após persistência e reconsulta por chave, não uma transação blockchain real. O ambiente exige service workers habilitados.
