# Kurio Marketplace — base Vite para o Frontend Challenge

Base criada em **Vite + React + TypeScript** a partir do README do desafio da Jungle Gaming e dos frames desktop/mobile fornecidos.

> Esta é uma base de trabalho, não uma entrega final pronta para enviar. Ela já organiza a arquitetura e implementa um fluxo funcional simples para você evoluir e conseguir explicar cada parte depois.

## O que já está preparado

- Vite + React + TypeScript
- TanStack Router com Home, NFT, carrinho, login, cadastro, checkout, pedido, perfil, carteiras e 404
- Search params do catálogo na URL
- TanStack Query para estado remoto
- Axios como único cliente REST
- MSW com banco simulado persistido no navegador
- 2 usuários fictícios e isolamento de dados privados
- carrinho de visitante + merge ao logar
- favoritos com atualização otimista
- quantidade do carrinho com atualização otimista + rollback
- cálculos ETH com `decimal.js` e strings
- criação de pedido com idempotência
- Socket.IO real no cliente + binding de Socket.IO no MSW
- eventos `nft.updated` e `order.updated` com versão
- shadcn/ui-style components locais em `src/components/ui`
- Tailwind e layout responsivo inspirado no Figma
- skeletons, empty/error states básicos
- Playwright configurado para Chromium desktop/mobile
- Lighthouse CI com as metas do enunciado
- mock tools para testar mudança de preço, rede lenta e pagamento recusado

## Primeiro uso

Recomendado: Node 20+.

```bash
npm i
npm run dev
```

O `npm i` executa automaticamente `msw init public --save`, gerando `public/mockServiceWorker.js`. Ele também cria o `package-lock.json`; versione esse lockfile antes da entrega.

Se o worker não for gerado por algum motivo:

```bash
npm run msw:init
```

Copie `.env.example` para `.env` se quiser alterar as flags.

## Credenciais fictícias

```text
collector@kurio.test
12345678
```

Segundo usuário para testar isolamento/troca de sessão:

```text
second@kurio.test
12345678
```

## Comandos

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
npm run test:e2e
npm run test:e2e:report
npm run lighthouse
```

Na primeira vez com Playwright, talvez seja necessário:

```bash
npx playwright install chromium
```

## Estrutura

```text
src/
├── api/                 # Axios + contratos REST
├── components/
│   ├── account/         # Perfil/carteiras
│   ├── auth/            # Login/cadastro/senha
│   ├── cart/            # Linha do carrinho, cupom, resumo
│   ├── checkout/        # Form, lista e seleção de carteira
│   ├── feedback/        # estados de erro
│   ├── layout/          # Header/Footer/MobileNavigation
│   ├── mock/            # painel de cenários
│   ├── nft/             # Cards/Grid/Galeria/Filtros/Hero
│   ├── order/           # recibo
│   └── ui/              # camada shadcn/ui customizada
├── hooks/               # TanStack Query + realtime
├── lib/                 # sessão, dinheiro, helpers
├── mocks/               # MSW, fixtures, DB e Socket.IO
├── pages/               # composição de rotas
├── types/               # contratos de domínio
├── router.tsx
└── main.tsx
```

Veja também:

- `ARCHITECTURE.md`
- `docs/FIGMA_COMPONENT_MAP.md`
- `docs/TODO_48H.md`

## Mock tools

Com `VITE_SHOW_MOCK_TOOLS=true`, aparece um botão no canto da aplicação. Ele permite:

- alterar em tempo real o preço do NFT #042;
- escolher que o próximo pagamento seja recusado;
- simular rede lenta;
- restaurar o cenário normal;
- resetar todo o banco simulado.

Essas ações servem para facilitar demonstração e testes. A aplicação continua recebendo os dados pelas mesmas camadas REST/Socket.IO.

## Assets

Os SVGs dentro de `public/` são **placeholders** criados apenas para a base funcionar offline. Troque-os pelos assets reais do Figma assim que você os tiver. Isso está documentado para não fingir fidelidade que ainda não existe.

## Deploy

Vercel/Netlify/Cloudflare Pages funcionam com o build Vite. Garanta fallback de SPA para que refresh em `/nft/042`, `/cart`, `/checkout` etc. volte para `index.html`.

## Antes de entregar

A seção `Pontos que ainda devem ser aprofundados` do `ARCHITECTURE.md` é importante. O teste pede mais cenários e testes do que esta base implementa. Use a base para economizar o trabalho repetitivo, mas revise e entenda cada fluxo antes de enviar.
