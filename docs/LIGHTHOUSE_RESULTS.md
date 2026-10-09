# Kurio NFT Marketplace — Resultados Lighthouse

## 1. Resumo

Para avaliar a performance e a qualidade do projeto, utilizei o Lighthouse CI nas versões desktop e mobile, analisando a página inicial e a página de detalhes de um NFT.

Os testes foram realizados localmente, utilizando o build de produção do Vite e as APIs simuladas com MSW. Fiz três medições para cada página em cada dispositivo, totalizando 12 execuções.

Para apresentar os resultados, utilizei a mediana das três medições, conforme solicitado no desafio.

### Resultados gerais

| Dispositivo | Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---:|---:|---:|---:|
| Mobile | Início | **86** | 98 | 96 | 92 |
| Mobile | Detalhe do NFT | **88** | 100 | 96 | 92 |
| Desktop | Início | **95** | 100 | 96 | 92 |
| Desktop | Detalhe do NFT | **92** | 97 | 96 | 92 |

As metas definidas no desafio são:

- Performance: mínimo de 90 pontos.
- Acessibilidade: mínimo de 95 pontos.
- Boas práticas: mínimo de 95 pontos.
- SEO: mínimo de 90 pontos.

No desktop, todas as categorias atingiram as metas estabelecidas.

No mobile, os resultados de acessibilidade, boas práticas e SEO também ficaram dentro do esperado. A única categoria abaixo da meta foi performance, com 86 pontos na página inicial e 88 na página de detalhes.

Apesar de não atingir os 90 pontos exigidos, os resultados ficaram próximos da meta e mostram oportunidades de otimização.

### Métricas de carregamento

Além das pontuações gerais, também analisei três métricas importantes:

- **LCP (Largest Contentful Paint):** mede quanto tempo o principal conteúdo visível da página leva para aparecer.
- **CLS (Cumulative Layout Shift):** mede a estabilidade visual durante o carregamento.
- **TBT (Total Blocking Time):** mede o tempo em que o navegador fica ocupado executando tarefas que podem prejudicar a interação.

| Dispositivo | Página | LCP | CLS | TBT |
|---|---|---:|---:|---:|
| Mobile | Início | 3,27 s | 0,0005 | 252 ms |
| Mobile | Detalhe do NFT | 3,20 s | 0,0003 | 219 ms |
| Desktop | Início | 1,37 s | 0,0021 | 47 ms |
| Desktop | Detalhe do NFT | 1,23 s | 0,0003 | 171 ms |

Os valores de CLS ficaram baixos em todos os testes, indicando boa estabilidade visual durante o carregamento.

Já os resultados de LCP e TBT no mobile mostram que ainda existem oportunidades de melhorar a velocidade de carregamento e a execução do JavaScript.

## 2. Medições individuais

Abaixo estão os resultados das 12 auditorias realizadas.

| Dispositivo | Página | Teste | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---:|---:|---:|---:|---:|
| Mobile | Início | 1 | 90 | 98 | 96 | 92 |
| Mobile | Início | 2 | 86 | 98 | 96 | 92 |
| Mobile | Início | 3 | 71 | 98 | 96 | 92 |
| Mobile | Detalhe | 1 | 93 | 100 | 96 | 92 |
| Mobile | Detalhe | 2 | 88 | 100 | 96 | 92 |
| Mobile | Detalhe | 3 | 71 | 100 | 96 | 92 |
| Desktop | Início | 1 | 95 | 100 | 96 | 92 |
| Desktop | Início | 2 | 95 | 100 | 96 | 92 |
| Desktop | Início | 3 | 75 | 100 | 96 | 92 |
| Desktop | Detalhe | 1 | 90 | 97 | 96 | 92 |
| Desktop | Detalhe | 2 | 92 | 97 | 96 | 92 |
| Desktop | Detalhe | 3 | 93 | 97 | 96 | 92 |

### Métricas individuais

| Dispositivo | Página | Teste | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|
| Mobile | Início | 1 | 3,19 s | 0,0005 | 142 ms |
| Mobile | Início | 2 | 3,27 s | 0,0000 | 252 ms |
| Mobile | Início | 3 | 3,49 s | 0,0005 | 724 ms |
| Mobile | Detalhe | 1 | 2,96 s | 0,0003 | 133 ms |
| Mobile | Detalhe | 2 | 3,20 s | 0,0003 | 219 ms |
| Mobile | Detalhe | 3 | 3,69 s | 0,0003 | 656 ms |
| Desktop | Início | 1 | 1,34 s | 0,0021 | 43 ms |
| Desktop | Início | 2 | 1,37 s | 0,0021 | 47 ms |
| Desktop | Início | 3 | 2,24 s | 0,0019 | 208 ms |
| Desktop | Detalhe | 1 | 1,23 s | 0,0003 | 196 ms |
| Desktop | Detalhe | 2 | 1,24 s | 0,0003 | 171 ms |
| Desktop | Detalhe | 3 | 1,23 s | 0,0004 | 151 ms |

Durante os testes, percebi algumas diferenças de performance entre as execuções, principalmente no mobile.

Por exemplo, a página inicial no desktop apresentou 95, 95 e 75 pontos. Como o desafio solicita a mediana, considerei 95 pontos como resultado final dessa página.

Esse comportamento também mostra que as pontuações podem variar dependendo das condições de execução.

## 3. Ambiente e metodologia

As auditorias foram realizadas no dia 08/10/2026, utilizando as seguintes ferramentas e configurações:

**Ferramentas utilizadas**

- Lighthouse 12.6.1
- Lighthouse CI
- HeadlessChrome 154
- Windows
- Vite, utilizando o build de produção
- MSW para simulação das APIs

**Ambiente local**

A aplicação foi executada em `http://127.0.0.1:4173`, utilizando o comando `vite preview`.

As páginas analisadas foram:

- `/` — página inicial
- `/nft/042` — detalhes do NFT

**Configuração mobile**

- Resolução: 412 × 823
- DPR: 1,75
- CPU: simulação de lentidão de 4×
- Latência de rede (RTT): 150 ms
- Velocidade de rede: 1638,4 Kbps

**Configuração desktop**

- Resolução: 1350 × 940
- DPR: 1
- CPU: simulação de 1×
- Latência de rede (RTT): 40 ms
- Velocidade de rede: 10240 Kbps

As medições foram realizadas com as condições de rede e processamento simuladas pelo Lighthouse.

Os resultados foram coletados no ambiente local e não representam uma medição direta da aplicação publicada na Vercel.

## 4. Análise dos resultados

De maneira geral, os resultados foram positivos, principalmente nas categorias de acessibilidade, boas práticas e SEO.

No desktop, consegui atingir todas as metas estabelecidas pelo desafio, incluindo performance nas duas páginas analisadas.

No mobile, a performance ficou um pouco abaixo dos 90 pontos esperados. Analisando os relatórios, identifiquei alguns pontos que podem estar contribuindo para esses resultados.

### Carregamento das imagens

As imagens dos NFTs têm bastante destaque no layout e fazem parte dos principais conteúdos exibidos nas páginas.

Uma possível melhoria seria priorizar o carregamento das imagens que aparecem primeiro na tela, principalmente aquelas que influenciam o LCP.

Isso pode ajudar a reduzir o tempo necessário para apresentar o conteúdo principal ao usuário.

### Execução do JavaScript

Outra oportunidade de melhoria está relacionada à quantidade de JavaScript carregada e executada inicialmente.

Uma análise mais detalhada permitiria identificar códigos que poderiam ser carregados apenas quando necessários, reduzindo o trabalho do navegador durante a abertura das páginas.

### Estabilidade visual

Um dos resultados positivos foi o CLS, que apresentou valores muito baixos em todas as medições.

Isso indica que os elementos da interface permanecem estáveis durante o carregamento, evitando mudanças inesperadas de posição na tela.

## 5. Pontos que podem ser melhorados

Com base nos resultados, identifiquei algumas melhorias que poderiam ser trabalhadas em futuras atualizações:

1. Priorizar o carregamento das imagens mais importantes para reduzir o LCP.
2. Avaliar oportunidades de reduzir o JavaScript carregado inicialmente.
3. Revisar os apontamentos do Lighthouse relacionados ao `robots.txt` e ao favicon.
4. Realizar novas medições após as otimizações para comparar os resultados.

Essas melhorias estão relacionadas principalmente à performance mobile, já que as demais categorias atingiram as metas.

Também seria interessante complementar as medições locais com auditorias diretamente no ambiente publicado.

## 6. Relatórios e evidências

As auditorias geraram arquivos JSON e HTML pelo Lighthouse CI, contendo os resultados completos de cada execução.

Os relatórios HTML e JSON originais das 12 auditorias estão versionados neste repositório. As medições estão separadas por dispositivo:

- [Relatórios mobile](./lighthouse/mobile/) — três medições da página inicial e três da página de detalhes, com HTML e JSON.
- [Relatórios desktop](./lighthouse/desktop/) — três medições da página inicial e três da página de detalhes, com HTML e JSON.

Os relatórios originais permitem consultar as métricas, os diagnósticos e as oportunidades de otimização identificadas pelo Lighthouse. O índice navegável está disponível em [docs/lighthouse/index.html](./lighthouse/index.html).

Este documento reúne os principais resultados das 12 medições e apresenta minha análise sobre o desempenho atual da aplicação.

## 7. Considerações finais

A utilização do Lighthouse CI me ajudou a entender melhor como avaliar a qualidade e o desempenho de uma aplicação frontend, considerando não apenas a aparência visual, mas também o carregamento, a acessibilidade e a experiência de uso.

Consegui atingir todas as metas do desktop e a maior parte das metas do mobile. Embora a performance mobile ainda tenha espaço para melhorias, os testes permitiram identificar pontos específicos que podem ser otimizados.

Essa análise também foi importante para entender como pequenas decisões de implementação, principalmente relacionadas a imagens e JavaScript, podem influenciar a experiência do usuário.
