# Kurio — NFT Marketplace

Projeto desenvolvido como parte de um desafio técnico de Frontend. A aplicação simula um marketplace de NFTs, permitindo explorar coleções, visualizar detalhes dos itens, adicionar favoritos, gerenciar um carrinho e realizar compras simuladas.

O projeto foi desenvolvido com React e TypeScript, utilizando ferramentas para gerenciamento de rotas, consumo de APIs, estado assíncrono, testes e comunicação em tempo real.

**Aplicação publicada:** https://kurio-nft-marketplace-theta.vercel.app/

> **Observação:** este projeto é uma demonstração. As APIs, carteiras, pagamentos e transações são simulados. Não existe integração com blockchain, carteiras reais ou gateways de pagamento.

## 1. Tecnologias utilizadas

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

**Navegação e gerenciamento de dados**
- TanStack Router
- TanStack Query
- Axios

**APIs e simulações**
- Mock Service Worker (MSW)
- Socket.IO Client
- REST APIs simuladas

**Testes e qualidade**
- Playwright
- Lighthouse CI
- TypeScript
- ESLint

## 2. Como executar o projeto

Para executar a aplicação localmente, é necessário ter instalado:

- Node.js 20 ou superior
- npm

Primeiro, instale as dependências:

```bash
npm ci
```

Depois, crie o arquivo `.env` a partir do `.env.example`.

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Por fim, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível no endereço informado pelo Vite, geralmente:

http://localhost:5173

### Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar o resultado do build localmente:

```bash
npm run preview
```

### Verificação de código

Para verificar os tipos do TypeScript:

```bash
npm run typecheck
```

Para executar o ESLint:

```bash
npm run lint
```

## 3. Variáveis de ambiente

O projeto utiliza variáveis de ambiente para configurar as APIs simuladas e as ferramentas de demonstração.

| Variável | Descrição |
|---|---|
| `VITE_ENABLE_MSW=true` | Ativa as APIs simuladas pelo MSW e a integração de Socket.IO |
| `VITE_SHOW_MOCK_TOOLS=true` | Exibe o painel de ferramentas para simular diferentes cenários |
| `VITE_API_BASE_URL=/api` | Define a URL base utilizada pelo Axios |
| `VITE_SOCKET_URL=wss://kurio.mock` | Define o endereço simulado utilizado pelo Socket.IO Client |

As integrações foram desenvolvidas para funcionar sem depender de um backend real.

## 4. Contas de demonstração

O projeto possui duas contas fictícias para testar autenticação e separação de dados entre usuários.

| Usuário | E-mail | Senha |
|---|---|---|
| Colecionador principal | `collector@kurio.test` | `12345678` |
| Segundo colecionador | `second@kurio.test` | `12345678` |

As senhas são verificadas por hash no banco simulado local. A sessão utiliza um token fictício e pode ser recuperada após atualizar a página.

Essas credenciais são exclusivas para demonstração e não devem ser utilizadas em aplicações reais.

## 5. Funcionalidades implementadas

### Catálogo de NFTs

A página inicial permite explorar os NFTs disponíveis, com funcionalidades de:

- Busca por NFTs
- Filtros combináveis
- Ordenação dos resultados
- Paginação
- Navegação para os detalhes de um NFT
- Adição e remoção de favoritos

Os filtros, a ordenação, a busca e a paginação são armazenados nos parâmetros da URL. Dessa forma, o estado da navegação pode ser recuperado após atualizar a página ou utilizar o histórico do navegador.

### Detalhes do NFT

Na página de detalhes, é possível visualizar as informações do NFT, selecionar a edição, alterar a quantidade desejada e adicionar o item ao carrinho.

A aplicação também verifica a disponibilidade e os limites de quantidade.

### Carrinho de compras

O carrinho permite:

- Adicionar e remover NFTs
- Alterar quantidades
- Aplicar e remover cupons
- Visualizar subtotal, descontos, taxas e valor total
- Manter os itens após atualizar a página

O carrinho também preserva os itens adicionados como visitante quando o usuário realiza o login.

**Cupons disponíveis para teste:**

- `KURIO10`: cupom válido.
- `EXPIRED`: simula um cupom expirado.
- Outros códigos: retornam erro de cupom inválido.

### Checkout e pedidos

O processo de compra é simulado, mas segue um fluxo de validação.

Durante o checkout, o usuário pode revisar seus dados, selecionar carteira e rede e conferir os valores antes de confirmar o pedido.

A aplicação também contempla:

- Validação dos dados do colecionador
- Revalidação da cotação antes da compra
- Simulação de pagamentos confirmados e recusados
- Recuperação de pedidos após falhas de conexão
- Prevenção de pedidos duplicados por meio de idempotência
- Preservação dos valores originais no recibo

As transações não utilizam criptomoedas reais.

### Autenticação e perfil

O usuário pode criar uma conta, realizar login, encerrar a sessão e atualizar os dados do perfil.

Também foram implementadas funcionalidades para alteração de senha e gerenciamento de carteiras.

Os dados privados são separados por usuário, evitando que informações de uma sessão anterior apareçam após o logout ou a troca de conta.

### Atualizações em tempo real

A aplicação utiliza Socket.IO Client junto ao ambiente de mocks para simular eventos em tempo real.

Os principais eventos são:

- `nft.updated`: informa alterações de preço ou disponibilidade de um NFT.
- `order.updated`: informa mudanças no estado de um pedido.

Esses eventos permitem atualizar as informações da interface e verificar alterações que acontecem durante uma compra.

## 6. Cenários simulados

Para facilitar a avaliação, o projeto possui cenários de teste configuráveis pelo MSW.

Com a variável `VITE_SHOW_MOCK_TOOLS=true`, o botão **Mock tools** permite simular situações como:

- Alteração do preço de um NFT
- Mudança na disponibilidade
- Pagamento recusado
- Sessão expirada
- Lentidão na rede
- Falhas de conexão
- Timeout após a criação de um pedido
- Restauração dos dados iniciais

Também é possível configurar os cenários utilizando o console do navegador:

```javascript
await fetch('/api/mock/scenario', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    payment: 'declined',
    latencyMs: 250,
  }),
})
```

Os principais parâmetros disponíveis são:

| Parâmetro | Função |
|---|---|
| `latencyMs` | Define a latência simulada em milissegundos |
| `payment` | Simula pagamento `confirmed` ou `declined` |
| `force500` | Simula erro HTTP 500 |
| `expireSession` | Simula expiração de sessão |
| `timeoutAfterOrderCreation` | Simula timeout após criar um pedido |

### Endpoints de controle

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/mock/nft-update` | Modifica preço ou disponibilidade e emite `nft.updated` |
| POST | `/api/mock/replay-old-nft` | Reenvia um evento antigo de NFT |
| POST | `/api/mock/scenario` | Configura um cenário simulado |
| POST | `/api/mock/reset` | Restaura os dados e cenários iniciais |

### Recuperação após timeout

Um dos cenários implementados simula uma situação em que o pedido é criado, mas a resposta da API demora mais do que o tempo permitido pelo Axios.

Nesse caso, a simulação mantém o pedido registrado, enquanto a requisição ultrapassa o timeout de 8 segundos.

Ao atualizar a página de checkout, a aplicação pode recuperar o pedido utilizando sua chave de idempotência, evitando a criação de uma segunda compra.

Esse cenário pode ser ativado com `timeoutAfterOrderCreation: true` e é consumido uma vez.

## 7. Testes automatizados

Utilizei Playwright para testar os principais fluxos da aplicação, incluindo autenticação, catálogo, carrinho, pagamento, atualizações em tempo real e cenários de recuperação de erros.

### Instalação do navegador

```bash
npx playwright install chromium
```

### Executar todos os testes

```bash
npx playwright test --workers=1
```

### Executar somente desktop

```bash
npx playwright test --project=chromium-desktop --workers=1
```

### Executar somente mobile

```bash
npx playwright test --project=chromium-mobile --workers=1
```

### Resultados

Na validação final, executei toda a suíte em Chromium, com 46 testes aprovados:

| Ambiente | Resultado |
|---|---|
| Desktop | 23 de 23 testes aprovados |
| Mobile | 23 de 23 testes aprovados |
| **Total** | **46 de 46 testes aprovados** |

### Regressão visual

Também implementei testes de regressão visual para as páginas de início, detalhes do NFT, carrinho e checkout, tanto no desktop quanto no mobile.

Os testes estão em `e2e/visual.spec.ts`. As oito imagens de referência estão versionadas na pasta `e2e/visual.spec.ts-snapshots/`.

Para comparar as páginas com as imagens de referência:

```bash
npx playwright test e2e/visual.spec.ts --workers=1
```

Para gerar novamente as imagens, quando uma alteração visual for intencional:

```bash
npx playwright test e2e/visual.spec.ts --update-snapshots --workers=1
```

As imagens foram geradas com Chromium no Windows. A comparação pode apresentar diferenças em outros sistemas operacionais.

Os oito testes de regressão visual passaram tanto na geração das referências quanto na execução posterior de comparação.

### Relatórios e falhas

O Playwright gera um relatório HTML e, em caso de falhas, mantém evidências como capturas de tela e traces.

Para abrir o relatório:

```bash
npx playwright show-report
```

Os cenários automatizados cobrem os principais fluxos da aplicação, mas não representam cobertura integral de todos os casos avançados descritos no enunciado.

## 8. Auditorias Lighthouse

Também utilizei Lighthouse CI para avaliar performance, acessibilidade, boas práticas e SEO.

As auditorias foram realizadas na página inicial e na página de detalhes do NFT, considerando desktop e mobile.

Foram feitas três medições por página e dispositivo, totalizando **12 auditorias**.

### Resultados

| Ambiente | Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---:|---:|---:|---:|
| Mobile | Início | 86 | 98 | 96 | 92 |
| Mobile | Detalhe do NFT | 88 | 100 | 96 | 92 |
| Desktop | Início | 95 | 100 | 96 | 92 |
| Desktop | Detalhe do NFT | 92 | 97 | 96 | 92 |

Todas as metas desktop foram atingidas.

No mobile, acessibilidade, boas práticas e SEO atingiram as metas. A performance ficou um pouco abaixo do mínimo solicitado, com 86 pontos na página inicial e 88 na página de detalhes.

Identifiquei oportunidades de melhoria relacionadas principalmente ao carregamento das imagens e à execução do JavaScript.

Os resultados apresentados são medianas das medições realizadas no ambiente local.

### Executar as auditorias

Primeiro, gere o build:

```bash
npm run build
```

Para executar as medições mobile:

```bash
npm run lighthouse
```

Para executar as medições desktop, utilizando a configuração específica:

```bash
npx lhci autorun --config=./lighthouserc.desktop.json
```

### Relatório completo

As configurações, os resultados individuais, as métricas LCP, CLS e TBT e a análise dos resultados estão disponíveis em:

**[Relatório de resultados Lighthouse](./docs/LIGHTHOUSE_RESULTS.md)**

## 9. Arquitetura e documentação

O código foi organizado separando a comunicação com APIs, as regras de gerenciamento de dados, os componentes visuais e os cenários simulados.

### Estrutura principal

| Pasta | Responsabilidade |
|---|---|
| `src/api` | Configuração e chamadas HTTP com Axios |
| `src/hooks` | Hooks, consultas e sincronização de dados |
| `src/mocks` | MSW, fixtures, handlers e banco simulado |
| `src/pages` | Páginas da aplicação |
| `src/components` | Componentes reutilizáveis da interface |
| `e2e` | Testes automatizados com Playwright |
| `docs` | Documentação complementar |

### Documentação adicional

- [Arquitetura do projeto](./ARCHITECTURE.md) — decisões técnicas, gerenciamento de sessão, cache e limitações.
- [Contratos da API](./docs/API_CONTRACTS.md) — recursos REST, respostas de erro e eventos Socket.IO.
- [Mapeamento do Figma](./docs/FIGMA_COMPONENT_MAP.md) — relação entre os componentes implementados e os layouts.
- [Resultados Lighthouse](./docs/LIGHTHOUSE_RESULTS.md) — auditorias de performance e qualidade.

## 10. Publicação

A aplicação foi publicada na Vercel, utilizando o build de produção do Vite.

Como o projeto utiliza TanStack Router, o arquivo `vercel.json` configura o redirecionamento necessário para que as rotas funcionem ao acessar diretamente uma URL ou atualizar a página.

As APIs e os eventos em tempo real continuam simulados no ambiente publicado.

**Link da aplicação:**

https://kurio-nft-marketplace-theta.vercel.app/

## 11. Considerações finais

Durante o desenvolvimento deste desafio, procurei manter a fidelidade visual ao Figma, mas também dar atenção ao funcionamento das páginas, ao gerenciamento dos dados e ao tratamento de erros.

A utilização do MSW permitiu testar diferentes situações sem depender de um backend real, enquanto o Playwright ajudou a verificar os fluxos da aplicação de forma automatizada.

Também utilizei o Lighthouse para identificar pontos positivos e oportunidades de melhoria, principalmente relacionados à performance mobile.

O projeto me permitiu trabalhar com diferentes ferramentas do ecossistema React e aplicar conceitos importantes de desenvolvimento frontend, como gerenciamento de estado assíncrono, integração com APIs, testes e responsividade.

- [Relato pessoal sobre o desenvolvimento e uso de IA](./docs/Relato_Pessoal_Uso_de_IA_Kurio.pdf) — Minha experiência, aprendizados e utilização de ferramentas de inteligência artificial durante o desafio.
