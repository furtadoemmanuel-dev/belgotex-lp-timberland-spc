# Relatório de QA — LP Timberland SPC

Executado em 11/10/2026, sobre o build de produção (`astro build` + `astro preview`), no Google Chrome 154.0.8037.99 (macOS).

## Lighthouse (números reais, servidor local)

| Perfil | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT | Peso total |
|---|---|---|---|---|---|---|---|---|
| Mobile | 98 | 100 | 100 | 100 | 2,3 s | 0 | 0 ms | 213 KiB |
| Desktop | 100 | 100 | 100 | 100 | 0,6 s | 0 | 0 ms | 190 KiB |

Mobile repetido 4 vezes: desempenho entre 98 e 99, LCP entre 2,2 e 2,3 s. Medido em servidor local; em hospedagem real o TTFB muda os números.
Relatórios completos: `qa/lighthouse-mobile.json` e `qa/lighthouse-desktop.json`.

## Playwright + axe-core — 39 de 39 aprovados

13 cenários × 3 perfis (390, 768 e 1280 px):

- Carrega sem erros no console, um único `h1`, sem rolagem lateral (também verificado em 360, 1024 e 1440 px).
- axe-core com WCAG 2.0/2.1/2.2 A e AA: **0 violações**.
- Teclado: link "Pular para o conteúdo" é o primeiro foco; CTAs alcançáveis.
- WhatsApp: número `554291391436`, código `LP-TIMBERLAND-SPC`, origem do clique, padrão e formato escolhidos.
- Seletor: XL mostra só Canyon e Classic e o aviso de pendência; HB mostra Harmony e Serenity com 71 × 14,2 cm.
- Formulário: erros por campo com `aria-invalid`, máscara de telefone, pré-preenchimento de padrão e formato, envio com sucesso, eventos `form_start`, `form_error`, `form_submit`.
- Formulário com falha de envio: mensagem clara, dados mantidos, WhatsApp oferecido.
- Galeria: filtro, `<dialog>` com setas e Esc, evento `gallery_open`.
- Consentimento: Consent Mode negado por padrão, nenhum script do GTM antes do aceite, UTMs não gravadas sem consentimento.
- SEO: title, description, canonical, Open Graph, JSON-LD `Product` sem `offers`, `robots.txt` com sitemap.

## Outros itens

- `astro check`: 0 erros · ESLint: 0 problemas · Prettier: OK.
- JS próprio: **6,2 KB gzip** (meta ≤ 80 KB). HTML: 36 KB gzip (CSS inline).
- Guarda de conteúdo: 0 termos proibidos; 1 pendência (`[[PENDENTE]]` do XL), que **bloqueia** o `npm run build:prod`.
- Capturas de página inteira: `qa/screens/full-360.png`, `full-768.png`, `full-1024.png`, `full-1440.png`.

## Problemas encontrados e corrigidos durante o QA

1. Seletor de formato estourava 3 px em 360 px com barra de rolagem clássica → colunas com `minmax(0, 1fr)`.
2. Mensagem de erro sumia no blur e deslocava o botão no meio do clique (o clique se perdia) → revalidação passou a acontecer enquanto a pessoa digita.
3. Animação de encaixe das réguas causava rolagem lateral momentânea → faixa recortada (`overflow: clip`).
4. LCP de 2,9 s por causa da fonte serifada de 132 KB → arquivo de 58 KB + preload (LCP 2,2–2,3 s).
5. Rodapé sobrepunha colunas em 360 px → colunas empilhadas abaixo de 600 px.

## O que não foi testado

- Navegadores Safari e Firefox, e aparelhos reais (só Chrome com emulação de largura).
- Leitor de tela real (VoiceOver/NVDA): só verificações automáticas e de estrutura.
- Envio real ao RD (o destino não foi definido; foi testado o provedor simulado).
- GTM real (sem `GTM_ID` configurado); só a ordem consentimento → carregamento.
- Simulador Roomvo no subdomínio (o link leva à página do produto).
