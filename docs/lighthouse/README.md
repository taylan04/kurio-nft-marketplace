# Relatórios Lighthouse — Kurio NFT Marketplace

Esta pasta reúne as evidências originais das 12 auditorias Lighthouse realizadas no projeto: seis mobile e seis desktop.

## Organização

- `index.html`: índice navegável com as medianas e os links dos relatórios.
- `mobile/`: seis relatórios HTML e seis arquivos JSON originais.
- `desktop/`: seis relatórios HTML e seis arquivos JSON originais.

## Ambiente de execução

As auditorias foram realizadas localmente, utilizando o build de produção do Vite, com as APIs simuladas pelo MSW.

Foram executadas três medições para cada página e perfil:

- Página inicial (`/`).
- Detalhes do NFT (`/nft/042`).

Os arquivos HTML e JSON foram preservados das execuções do Lighthouse CI.

## Resultados e metodologia

As pontuações, medianas, métricas LCP, CLS e TBT, condições de execução e oportunidades de melhoria estão documentadas em:

[Resultados Lighthouse](../LIGHTHOUSE_RESULTS.md)

As medições representam o ambiente local utilizado nos testes, não uma auditoria direta da aplicação publicada na Vercel.