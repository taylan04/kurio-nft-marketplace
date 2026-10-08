# Plano sugerido para as próximas 48 horas

## Bloco 1 — fazer rodar e entender a base

1. `npm i`
2. `npm run dev`
3. Navegar por Home -> Detalhe -> Carrinho.
4. Fazer login com a credencial fictícia.
5. Completar Checkout -> pedido pendente -> confirmado.
6. Abrir `Mock tools` e disparar `nft.updated`.

## Bloco 2 — fidelidade visual

Prioridade: Home, Detalhe, Carrinho e Pagamento em 390 e 1440. Substituir placeholders pelos assets reais do Figma e ajustar medidas, tipografia e espaçamentos.

## Bloco 3 — requisitos eliminatórios

Confirmar que Router, Query, Axios, MSW, Socket.IO, Tailwind, shadcn, Playwright e Lighthouse estão realmente no projeto e em uso. Não remover nenhuma camada para “facilitar”.

## Bloco 4 — cenários de falha

Completar expiração de sessão, conflito de cadastro, cupom expirado, edição esgotada, timeout após criação, pagamento recusado e resposta fora de ordem.

## Bloco 5 — Playwright

Transformar cada item da seção 9 do enunciado em um teste. Priorize compra completa, login/sessão, carrinho, tempo real e restauração de URL.

## Bloco 6 — acabamento

Rodar typecheck/lint/build, verificar teclado/foco, gerar baselines visuais, rodar Lighthouse 3x por página/perfil, documentar resultado e fazer deploy.
