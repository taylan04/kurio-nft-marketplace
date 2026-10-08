# Mapa de componentes do Figma

Análise feita a partir dos frames enviados de Cadastro, Login, Início, Detalhe, Carrinho, Pagamento, Perfil, Carteiras e Confirmação, em desktop/mobile.

| Região visual | Componente | Motivo |
| --- | --- | --- |
| Topo desktop | `Header` | repete em Home, detalhe, carrinho, checkout e conta |
| Navegação inferior mobile | `MobileNavigation` | repete nas telas mobile principais |
| Rodapé desktop | `Footer` | bloco idêntico/reutilizável |
| Hero | `HeroBanner` | bloco visual grande, isolado e reaproveitável |
| Busca mobile | `SearchBar` | comportamento próprio e estado de busca |
| Sidebar/drawer de filtros | `MarketplaceFilters` | mesmos filtros em duas composições |
| Card de NFT | `NFTCard` | item mais repetido de todo o projeto |
| Grid | `NFTGrid` | centraliza responsividade, loading e empty state |
| Galeria do detalhe | `NFTGallery` | miniaturas + imagem principal |
| `- 1 +` | `QuantitySelector` | aparece em detalhe e carrinho |
| Linha do carrinho | `CartItem` | repete para cada NFT e muda no mobile |
| Cupom | `CouponForm` | input + mutation + erro |
| Totais | `OrderSummary` | carrinho e pagamento usam a mesma estrutura |
| Login | `LoginForm` | pode existir em página mobile ou Dialog desktop |
| Cadastro | `RegisterForm` | mesma lógica de página/Dialog |
| Password eye | `PasswordInput` | repete em login/cadastro/perfil |
| Login/Cadastro | `AuthScreen` | tela cheia no mobile; modal (Dialog Radix) sobre a Home no desktop |
| Menu da conta | `AccountSidebar` | idêntico em Perfil e Carteiras |
| Layout de conta | `AccountLayout` | sidebar + conteúdo |
| Form do perfil | `ProfileForm` | responsabilidade própria e mutations |
| Form de carteira | `WalletForm` | responsabilidade própria e validações |
| Form de checkout | `CollectorForm` | grande grupo de campos do pagamento |
| Lista do checkout | `CheckoutItems` | snapshot visual dos NFTs a comprar |
| Carteira/rede | `WalletSelector` | RadioGroup acessível |
| Recibo | `OrderReceipt` | renderiza snapshot imutável do pedido |
| Ferramentas de cenário | `MockScenarioPanel` | somente desenvolvimento/demonstração |

## O que NÃO precisa ser componente separado

Textos simples, títulos únicos, pequenas linhas decorativas e pares `label/value` usados uma única vez podem permanecer dentro da página. Evite criar arquivos como `OrangeLine.tsx`, `SmallTitle.tsx` ou `PriceText.tsx` sem ganho real de reutilização/comportamento.

## Onde o shadcn/ui entra

Os arquivos de `src/components/ui` representam a camada shadcn: `Button`, `Input`, `Dialog`, `Select`, `RadioGroup`, `Tabs`, `Separator`, `Slider`, `Skeleton`, `Label` e `Textarea`. A identidade visual do Figma é aplicada por Tailwind nesses componentes; não é para o site ficar com aparência padrão de biblioteca.

## Ajustes de fidelidade visual (rodada Figma)

- Fonte Roboto Mono local via `@fontsource/roboto-mono`; paleta medida nos frames em `tailwind.config.ts`.
- Ícones próprios em `src/components/icons.tsx` (carrinho, olho, Google/Facebook, redes sociais, envelope THANK YOU).
- Imagens dos NFTs em `public/*.webp` recortadas dos frames exportados (substituir pelos assets originais do Figma quando possível).
- Novos: `NFTDetailsDesktop`, `NFTCarousel`, `SocialLogin`, `components/form/fields.tsx`, `hooks/useMediaQuery.ts`.
- Desvios conscientes do Figma: lixeira pequena no card do carrinho mobile (remoção é obrigatória); opção "WalletConnect" no pagamento desktop (o frame mostra o selo de carteiras por engano); carrossel e miniatura começam no primeiro item.
