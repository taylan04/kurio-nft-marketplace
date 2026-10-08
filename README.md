# Kurio — NFT Marketplace

Projeto do desafio de Frontend em **React, TypeScript, TanStack Router, TanStack Query, Axios, Tailwind, shadcn/ui, MSW e Socket.IO**, com testes Playwright e configuração Lighthouse CI.

> É uma demonstração: a API, os pagamentos, as carteiras e as transações são **simulados**. Não usa blockchain, chaves reais nem gateway de pagamento.

## Começando

Requisitos: Node.js 20+ e npm.

```bash
npm ci
cp .env.example .env            # no Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Abra o endereço exibido pelo Vite, geralmente `http://localhost:5173`.

### Build e qualidade

```bash
npm run build
npm run preview
npm run typecheck
npm run lint
npx playwright install chromium
npm run test:e2e
```

Para executar apenas testes desktop, reduzindo o consumo de memória:

```bash
npx playwright test --project=chromium-desktop --workers=2
```

Testes mobile (perfil Pixel 7):

```bash
npx playwright test --project=chromium-mobile --workers=2
```

O Playwright inicia o Vite automaticamente, guarda screenshots/traces em `test-results` quando falha e gera relatório HTML com `npx playwright show-report`.

Para métricas Lighthouse, gere antes o build e rode `npm run lighthouse`. A configuração `lighthouserc.json` mede três vezes a página inicial e `/nft/042` e grava relatórios em `.lighthouseci`. **Pontuações não são garantidas**: execute no ambiente final, registre mediana das categorias, LCP/CLS/TBT, browser e máquina, e compare mobile e desktop antes da entrega.

## Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável | Uso |
| --- | --- |
| `VITE_ENABLE_MSW=true` | Ativa REST mock + canal Socket.IO no service worker |
| `VITE_SHOW_MOCK_TOOLS=true` | Exibe painel de cenários para avaliação |
| `VITE_API_BASE_URL=/api` | Base URL consumida via Axios |
| `VITE_SOCKET_URL=wss://kurio.mock` | Endpoint simulado usado pelo `socket.io-client` |

O mesmo MSW pode funcionar no build publicado. Não exponha credenciais reais: os usuários abaixo são apenas fixtures.

## Contas de demonstração

| Usuário | E-mail | Senha |
| --- | --- | --- |
| Colecionador principal | `collector@kurio.test` | `12345678` |
| Segundo colecionador | `second@kurio.test` | `12345678` |

As senhas são verificadas por hash no banco simulado local; o app nunca deveria ser usado para guardar dados reais. A sessão usa um token fictício, persistido para sobreviver ao refresh.

## Fluxos para conferir

1. No catálogo, busque, combine filtros, altere a ordenação, navegue entre páginas e use Voltar. Os parâmetros ficam na URL.
2. Abra um NFT, escolha a edição, ajuste a quantidade e compre. É possível continuar como visitante no carrinho.
3. Faça login ao iniciar checkout: os itens do visitante seguem para o usuário.
4. No carrinho, use o cupom `KURIO10`; `EXPIRED` simula cupom expirado e códigos desconhecidos são inválidos.
5. No checkout, revise dados do colecionador, carteira, rede e cotação; o pedido passa por pendente até confirmado/recusado. O recibo conserva os valores originais.
6. No perfil, teste a atualização dos dados e senha. Em Carteiras, edite ou cadastre uma carteira secundária.
7. Faça logout, entre com o segundo usuário e confirme que perfil, favoritos, carteiras e pedidos do primeiro não aparecem.

## Cenários simulados e reset

Com `VITE_SHOW_MOCK_TOOLS=true`, use o botão **Mock tools** no canto da página. Ele permite alterar o preço do NFT #042, recusar pagamento, expirar sessão, ativar rede lenta, induzir timeout após criação do pedido e restaurar o cenário original.

Também é possível usar `fetch` no console do navegador (na mesma origem):

```js
await fetch('/api/mock/scenario', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ payment: 'declined', latencyMs: 250 }),
})
```

Campos disponíveis: `latencyMs` (milissegundos), `payment` (`confirmed`/`declined`), `force500`, `expireSession` e `timeoutAfterOrderCreation` (único uso).

Outros endpoints de controle:

| Método e rota | Finalidade |
| --- | --- |
| `POST /api/mock/nft-update` | Muda preço/disponibilidade (ex.: `{ "nftId":"042", "priceEth":"1.79" }`) e envia `nft.updated` |
| `POST /api/mock/replay-old-nft` | Reenvia versão antiga via Socket.IO, sem modificar banco |
| `POST /api/mock/scenario` | Ajusta cenário; as propriedades não informadas são mantidas |
| `POST /api/mock/reset` | Restaura banco, cenários e sessão inicial |

**Timeout depois de criar o pedido:** com `timeoutAfterOrderCreation: true`, o POST é persistido, mas sua resposta demora 9 segundos (acima do timeout Axios de 8 segundos). O usuário pode recarregar a página de checkout para recuperar o mesmo pedido pela chave de idempotência. O cenário volta sozinho para `false` depois do primeiro uso.

**Estado entre testes:** Playwright usa contextos de navegador isolados; `localStorage` é limpo antes dos testes. Para voltar manualmente ao padrão, use o reset do painel, que também restaura o catálogo e a sessão.

## Arquitetura e contratos

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): fluxo dos dados, sessões, cache, decisões e limitações.
- [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md): recursos REST, códigos de erro e eventos Socket.IO.
- [`docs/FIGMA_COMPONENT_MAP.md`](./docs/FIGMA_COMPONENT_MAP.md): correspondência de componentes e frames.

Organização: `src/api` faz chamadas Axios; `src/hooks` usa Query e sockets; `src/mocks` mantém fixtures, handlers MSW e DB; `src/pages`/`src/components` são a interface; `e2e` contém testes Playwright.

## Publicação

O projeto é um SPA Vite. A configuração `vercel.json` redireciona rotas para o `index.html`, permitindo acesso direto e refresh. Antes de fazer push, rode build, testes desktop/mobile e confira no próprio endereço Vercel que o MSW e o socket funcionam.

As funcionalidades auxiliares fora do escopo permanecem informativas ou desabilitadas, sem indicar falsamente que uma ação foi concluída.
