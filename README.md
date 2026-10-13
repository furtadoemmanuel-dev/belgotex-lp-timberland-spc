# belgotex-lp-timberland-spc

Landing page do piso vinílico **Timberland SPC** (Belgotex), feita pela Ample Sample.
Site estático em Astro, publicado em subdomínio (sugestão: `timberland.belgotex.com.br`).

## Status

- Etapa A (inventário, IA, wireframe) aprovada em 11/10/2026.
- **Etapa B (produção) entregue.** Falta resolver as pendências da Belgotex antes do build de produção (ver abaixo).

## Rodar localmente

```bash
npm install
cp .env.example .env      # ajuste os valores
npm run dev               # http://localhost:4321
```

## Build e verificação

```bash
npm run build             # astro check + build + guarda de conteúdo (pendências só avisam)
npm run build:prod        # igual, mas falha se houver [[PENDENTE]] na página
npm test                  # Playwright + axe (390, 768, 1280 px)
npm run lint
```

A pasta final é `dist/` (HTML, CSS e JS estáticos, imagens em AVIF/WebP).

## Link de aprovação (Cloudflare Pages)

Para o cliente revisar antes da publicação. Fica no ar sem depender desta máquina.

```bash
npm run deploy:approval
```

Faz o build com `NOINDEX=true` (meta robots `noindex` + cabeçalho `X-Robots-Tag` em `dist/_headers`) e envia `dist/`
ao projeto `belgotex-timberland` no Cloudflare Pages (`https://belgotex-timberland.pages.dev`). Na primeira vez o
Wrangler abre o navegador para o login e pergunta se cria o projeto. Rodar de novo atualiza o mesmo link; cada envio
também ganha um endereço próprio, listado no painel. O formulário segue em modo simulado enquanto `LEAD_ENDPOINT`
estiver vazio. **Não usar este build em produção.**

## Publicar no subdomínio

1. Hospedagem estática: Cloudflare Pages (recomendado, mesmo provedor do DNS da Belgotex), Vercel, Netlify ou Hostinger.
   Comando de build `npm run build:prod`, pasta de saída `dist`, Node 20+ e as variáveis do `.env.example` configuradas no painel.
2. No Cloudflare da Belgotex: registro **CNAME** `timberland` → endereço fornecido pela hospedagem.
3. Ajustar `SITE_URL` para o endereço final (canonical, Open Graph e sitemap usam esse valor).

## Configuração (`.env`)

| Variável | Para quê |
|---|---|
| `WHATSAPP_NUMBER` | Número do consultor (padrão: o mesmo do site, `554291391436`) |
| `CAMPAIGN_CODE` | Código na mensagem do WhatsApp e no lead (`LP-TIMBERLAND-SPC`) |
| `LEAD_ENDPOINT` | Destino do formulário. Vazio = modo simulado, nada é enviado (ver `docs/integration-rd.md`) |
| `SIMULATOR_URL` | "Ver no meu ambiente" (hoje, página do produto até a Roomvo liberar o subdomínio) |
| `PRIVACY_URL`, `COOKIES_URL` | Políticas da Belgotex |
| `GTM_ID` | Container do Google Tag Manager; carregado só depois do aceite de cookies |
| `NOINDEX` | `true` só na versão de aprovação (não indexar). Vazio em produção |
| `SITE_URL` | Endereço final da LP |

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/content/*.json` | Todo o conteúdo (padrões, formatos, ambientes, documentos, benefícios, FAQ, especificações, selos) |
| `src/components/` | Uma seção por componente, na ordem aprovada |
| `src/scripts/` | Ilhas de JS: seletor, galeria, formulário, WhatsApp, consentimento, `dataLayer` |
| `src/lib/` | Adaptador de leads, validação, WhatsApp, dados e imagens |
| `src/assets/` | Imagens de origem (o Astro gera AVIF/WebP no build) |
| `scripts/prepare-assets.py` | Regera os assets a partir de `../arquivos do fornecedor` e `../assets_belgotex` |
| `scripts/content-guard.mjs` | Bloqueia preço, revenda, limitações e pendências |
| `tests/` | Testes Playwright + axe |
| `qa/` | Capturas, relatórios do Lighthouse e scripts de captura |
| `docs/` | Inventário, IA, direção de design, tokens, integração RD, pendências e relatório de QA |
| `wireframe/` | Wireframe da Etapa A (referência) |

## Rastreamento (`dataLayer`)

`cta_click`, `whatsapp_click`, `form_start`, `form_step`, `form_error`, `form_submit`, `pattern_select`, `format_select`, `gallery_open`,
`document_download`, `layer_view {layer}` (camada fixada na anatomia da régua), `benefit_expand {benefit}` (card de benefício aberto), `badge_group_expand {group}` (grupo de selos aberto), `section_view`, `scroll_depth` (25/50/75/90), `consent_update`. Amostra pelo correio: `sample_open`, `sample_start`, `sample_step`, `sample_error`, `sample_submit`. **KPI = `form_submit` + `sample_submit` + `whatsapp_click`.**
