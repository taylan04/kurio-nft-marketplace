# Mapeamento do Figma e organização dos componentes

## 1. Visão geral

Durante o desenvolvimento do Kurio NFT Marketplace, utilizei os layouts disponibilizados no Figma como referência para construir as páginas e organizar os componentes da aplicação.

Procurei manter a identidade visual do projeto, respeitando cores, tipografia, espaçamentos, imagens e a organização dos elementos nas versões desktop e mobile.

Também busquei separar os elementos reutilizáveis em componentes React, facilitando a manutenção do código e evitando repetir a mesma estrutura em diferentes páginas.

As principais telas utilizadas como referência foram:

- Página inicial
- Detalhes do NFT
- Carrinho de compras
- Pagamento
- Confirmação do pedido
- Login e cadastro
- Perfil do colecionador
- Gerenciamento de carteiras

## 2. Organização dos componentes

Abaixo estão os principais componentes considerados na organização da interface e suas responsabilidades.

| Elemento da interface | Componente | Responsabilidade |
|---|---|---|
| Cabeçalho desktop | `Header` | Navegação principal, acesso à conta e carrinho |
| Navegação mobile | `MobileNavigation` | Navegação entre as principais telas no celular |
| Rodapé | `Footer` | Informações e links do rodapé |
| Banner principal | `HeroBanner` | Apresentação visual da página inicial |
| Busca | `SearchBar` | Campo de pesquisa de NFTs |
| Filtros | `MarketplaceFilters` | Filtros do catálogo no desktop e mobile |
| Card de NFT | `NFTCard` | Exibição das informações resumidas de cada NFT |
| Catálogo | `NFTGrid` | Organização responsiva dos cards e estados de carregamento |
| Galeria | `NFTGallery` | Imagem principal e miniaturas do NFT |
| Quantidade | `QuantitySelector` | Controle da quantidade selecionada |
| Item do carrinho | `CartItem` | Informações e ações de cada produto do carrinho |
| Cupom | `CouponForm` | Aplicação, remoção e validação de cupons |
| Resumo de valores | `OrderSummary` | Subtotal, descontos, taxas e total |
| Login | `LoginForm` | Formulário de autenticação |
| Cadastro | `RegisterForm` | Formulário de criação de conta |
| Campo de senha | `PasswordInput` | Entrada de senha com opção de mostrar ou ocultar |
| Tela de autenticação | `AuthScreen` | Organização visual dos fluxos de login e cadastro |
| Menu da conta | `AccountSidebar` | Navegação entre perfil e carteiras |
| Layout da conta | `AccountLayout` | Estrutura compartilhada das páginas da conta |
| Perfil | `ProfileForm` | Edição dos dados do colecionador |
| Carteiras | `WalletForm` | Cadastro e edição de carteiras |
| Dados do pagamento | `CollectorForm` | Informações do colecionador durante o checkout |
| Itens do checkout | `CheckoutItems` | Revisão dos NFTs selecionados para compra |
| Carteira e rede | `WalletSelector` | Seleção da carteira e da rede simuladas |
| Recibo | `OrderReceipt` | Exibição das informações do pedido |
| Ferramentas de teste | `MockScenarioPanel` | Controle dos cenários simulados para demonstração |

Essa divisão permite reutilizar componentes em diferentes telas, mantendo o comportamento e a aparência mais consistentes.

## 3. Decisões de componentização

Durante a organização do projeto, procurei criar componentes separados principalmente quando havia reutilização ou alguma responsabilidade específica.

Por exemplo, os cards de NFTs aparecem várias vezes no catálogo, então faz sentido manter sua estrutura em um único componente.

O mesmo acontece com controles de quantidade, formulários e elementos de navegação.

Por outro lado, elementos mais simples, como títulos utilizados apenas uma vez, pequenos detalhes decorativos e textos específicos de uma página, podem permanecer no próprio componente da tela.

Dessa forma, evitei dividir excessivamente a interface em arquivos pequenos sem necessidade, mantendo o código mais fácil de entender e modificar.

## 4. Utilização do shadcn/ui

Para construir os elementos interativos, utilizei componentes da biblioteca shadcn/ui, adaptando sua aparência à identidade visual definida no Figma.

Entre os elementos utilizados na interface estão:

- Button
- Input
- Dialog
- Select
- RadioGroup
- Tabs
- Separator
- Slider
- Skeleton
- Label
- Textarea

Os estilos foram personalizados utilizando Tailwind CSS.

Minha intenção foi aproveitar a estrutura e os comportamentos oferecidos por esses componentes, sem deixar a aplicação com a aparência padrão da biblioteca.

Também considerei aspectos de acessibilidade, como navegação por teclado, identificação dos campos e indicação visual de foco.

## 5. Fidelidade visual ao Figma

Um dos principais objetivos do desenvolvimento foi manter a interface próxima aos layouts fornecidos.

Para isso, trabalhei principalmente com os seguintes elementos:

**Tipografia**

Utilizei a fonte Roboto Mono com o pacote `@fontsource/roboto-mono`, permitindo carregar os arquivos de fonte localmente.

**Cores e estilos**

A paleta de cores e os estilos foram organizados com Tailwind CSS, utilizando o Figma como referência.

**Ícones**

Alguns ícones e elementos gráficos foram implementados em `src/components/icons.tsx`, incluindo elementos utilizados na navegação, autenticação e interface.

**Imagens dos NFTs**

As imagens dos NFTs foram armazenadas na pasta `public/`, utilizando o formato WebP.

As imagens mantêm a aparência dos elementos apresentados no Figma. O formato WebP também contribui para reduzir o tamanho dos arquivos em comparação com formatos menos otimizados.

**Responsividade**

As páginas foram adaptadas para diferentes tamanhos de tela, considerando as versões desktop e mobile apresentadas no desafio.

Também foram utilizados recursos como layouts flexíveis, grids responsivos e componentes específicos para determinados tamanhos de tela.

## 6. Adaptações realizadas

Durante a implementação, algumas adaptações foram necessárias para que os elementos visuais também atendessem aos comportamentos exigidos pelo desafio.

### Carrinho no mobile

Foi incluída uma ação de remoção de itens, permitindo excluir NFTs diretamente do carrinho.

Essa funcionalidade é importante para completar o fluxo de compra, mesmo quando o layout original não apresenta todos os estados de interação.

### Pagamento

O fluxo de pagamento recebeu controles para seleção de carteira, rede e revisão das informações antes de confirmar a compra.

Como as carteiras são simuladas, as interações foram adaptadas para representar os estados de conexão e pagamento sem utilizar serviços reais.

### Galeria de NFTs

A galeria e os elementos de carrossel foram organizados para permitir a navegação entre as imagens disponíveis, mantendo o primeiro item selecionado inicialmente.

### Telas sem layout mobile específico

Algumas telas, como perfil, carteiras e confirmação do pedido, precisaram de adaptações responsivas para funcionar em dispositivos móveis.

Nesses casos, mantive a identidade visual utilizada nas demais páginas.

### Estados de carregamento e erro

Além das telas principais, foram considerados estados como carregamento, ausência de resultados, erros de requisição e mensagens de confirmação.

Esses estados seguem a mesma proposta visual da aplicação.

## 7. Considerações finais

A organização dos componentes foi pensada para equilibrar fidelidade visual, reutilização de código e facilidade de manutenção.

Durante o desenvolvimento, procurei não apenas reproduzir as telas do Figma, mas também garantir que os elementos pudessem funcionar dentro dos fluxos exigidos pelo desafio.

Esse processo me ajudou a trabalhar melhor com componentização em React, responsividade e integração entre interface e funcionalidades.

O resultado é uma aplicação que procura manter a identidade visual do projeto enquanto oferece navegação e interações consistentes entre desktop e mobile.
