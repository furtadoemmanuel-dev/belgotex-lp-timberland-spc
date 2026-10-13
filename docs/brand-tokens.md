# Tokens de marca — LP Timberland SPC

Definidos em `src/styles/global.css`. Status: **provisórios** até a Belgotex enviar os valores oficiais (o manual de 2017 só traz "TBC").

## Cores

Base: manual de 2019 (`assets_belgotex/manual_2019.pdf`) — preto do logo + Pantone Cool Gray 10C / 9C / 6C.

| Token | Valor | Uso | Origem |
|---|---|---|---|
| `--ink` | `#231F20` | Texto, botões, linhas fortes | Preto do logo vetorial (`logo.pdf`, `b_.pdf`) |
| `--cool-10` | `#63666A` | Referência da marca | Pantone Cool Gray 10C |
| `--cool-9` | `#75787B` | Referência da marca | Pantone Cool Gray 9C |
| `--cool-6` | `#A7A8AA` | Referência da marca | Pantone Cool Gray 6C |
| `--ink-2` | `#55585C` | Texto secundário | Cool Gray 10C escurecido para passar AA em texto pequeno |
| `--paper` | `#F5F5F4` | Fundo principal (branco frio) | Neutro da família Cool Gray |
| `--sand` | `#EBEBEA` | Seções alternadas | idem |
| `--stone` | `#D9DADB` | Réguas do divisor, escala | Tinta clara de Cool Gray 6C |
| `--line` | `#CFD0D1` | Divisores finos | idem |
| `--slate` | `#252B33` | Rodapé | Rodapé do belgotex.com.br |
| `--error` | `#8A1C12` | Erros do formulário | — |

Um único acento para ações: o preto da marca (`--ink`).

## Marca

- **B_** (`b_.pdf` → `src/assets/brand/brandmark.svg`) fixo no topo esquerdo, no cabeçalho, em todas as telas.
- **Logo Belgotex do Brasil** (`logo.pdf` → `src/assets/brand/logo.svg`) somente no rodapé, em branco.
- O manual de 2019 também traz variações por linha de produto (B__ carpete, B_ _ _ vinílico, B com zigue-zague grama). A LP usa o **B_** por decisão do Emmanuel (11/10/2026).

## Tipografia

Mesma tipografia da LP B_life (blife.belgotex.com.br).

| Papel | Família | Licença | Observação |
|---|---|---|---|
| Títulos (h1, h2, números) | DM Serif Display 400 (+ itálico) | OFL, hospedada localmente | Só existe no peso 400: `font-synthesis: none` evita negrito falso |
| Texto, botões, h3 | DM Sans (variável) | OFL, hospedada localmente | |
| Linha de apoio (`.eyebrow`) | DM Sans 600, 14 px, caixa alta, espaçamento 0,1em | | Igual ao B_life |

## Escala e grid

- Corpo 16–18 px, entrelinha 1,6, linhas de até 66 caracteres.
- H1 40–84 px · H2 32–56 px · H3 18–21 px (todos com `clamp`).
- Grid de 12 colunas a partir de 900 px, 4 colunas abaixo. Conteúdo de até 1200 px. Margens laterais de 16/32/40 px.
- Unidade gráfica: a régua (proporção 6,43:1) nos divisores, no seletor e na faixa animada do hero.
