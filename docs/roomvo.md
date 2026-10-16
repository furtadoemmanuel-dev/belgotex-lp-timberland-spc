# Simulador "Ver no meu ambiente" (Roomvo): pontos de integração

No site da Belgotex o simulador é o plug-in da Roomvo, carregado pelo script
`https://cdn.roomvo.com/static/scripts/b2b/belgotexcombr.js`. A licença é por domínio: a Roomvo precisa liberar o
subdomínio da LP. Até lá, todos os botões levam à página do produto no site (`SIMULATOR_URL`), onde o plug-in já
funciona.

## Marcações na página

| Onde | Elemento |
|---|---|
| Seção "Veja o Timberland no seu ambiente" (`#simulador`, `src/components/Simulator.astro`) | botão principal |
| Seletor de padrões (`#padroes`) | botão "Ver no meu ambiente" ao lado da cotação |
| Hero | atalho "Ver no meu ambiente" que rola até `#simulador` |

Os botões do plug-in têm:

- `data-roomvo-trigger`: marca o gatilho.
- `data-roomvo-product="timberland-spc"`: o produto.
- `data-roomvo-pattern`: o padrão escolhido no seletor (001 a 005, hb001, hb002), atualizado em
  `src/scripts/selector.ts`.

No HTML, os comentários `ROOMVO` apontam cada ponto, e `ROOMVO SCRIPT` em `src/layouts/Base.astro` é onde entra o
script do plug-in. O script segue a mesma regra do GTM: carregar só depois do aceite de cookies, se a Roomvo usar
cookies de rastreamento.

## O que pedir à Roomvo / Belgotex

1. Liberar o subdomínio final da LP na conta `belgotexcombr`.
2. Os identificadores (SKU) que o plug-in usa para cada padrão Timberland, para o botão abrir já na cor certa.
