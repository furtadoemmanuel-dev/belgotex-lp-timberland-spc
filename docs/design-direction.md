# Direção de design — LP Timberland SPC

Combina o `PROMPT_ClaudeCode_LP_Timberland_SPC.md` (prompt) com o `LP_BELGOTEX_INSTRUCOES.md` (instruções, 10/10/2026).
Regra das instruções: em caso de conflito, vale a instrução direta do Emmanuel na conversa.

## 1. Seção 2 das instruções: o que já foi respondido

| Pendência | Resposta | Origem |
|---|---|---|
| Objetivo | Especificação em projetos. Conversão por cotação (formulário) + consultor (WhatsApp); amostra dentro do formulário | prompt §1 (briefing Belgotex) |
| Onde publicar | Subdomínio da Belgotex (sugestão `timberland.belgotex.com.br`) | Emmanuel, nesta conversa |
| Stack | **Astro** com saída estática | Emmanuel, 11/10/2026 |
| Produto em destaque | Timberland SPC: 7 padrões, 3 formatos | Emmanuel + prompt |
| Copy aprovada | Não existe; os textos são rascunhos para aprovação | prompt §2 |
| Imagens liberadas | Material enviado pelo cliente (`arquivos do fornecedor/Timberland`) + fotos do site, como provisórias | Emmanuel |
| Destino do formulário | RD (Conversas × Station Marketing em aberto). Nada é enviado a nenhum serviço até haver definição | gaps.md A6 |

## 2. Referências (12 abertas; o pin "Modern Rug Retail Shop" não está mais disponível)

| Referência | O que aproveitamos | O que evitamos |
|---|---|---|
| Luxury Flooring | Amostras de madeira em **círculos** → linha de 7 padrões no hero | Hero escuro com texto sobre foto, estrelas falsas |
| Modern Flooring (FargoMa) | Faixa de serviços colada ao hero, CTA repetido | Foto de banco de imagem com instalador sorridente |
| Vlada Sakun | Respiro, foto grande dividida com bloco de texto | Bloco verde-petróleo (fora da marca) |
| DEV.UN | Sequência de seções em neutros; serviços numerados | Numeração decorativa (só numeramos a instalação) |
| Oura & Co. | **Fotografia grande + linha editorial**; números grandes como prova | Paleta marrom/terracota (clichê vetado pelo prompt) |
| Linora (alto impacto) | Tipografia forte no hero; **paleta mostrada como amostras** | Script manuscrito |
| Curio Rugs (principal) | **Minimalismo com foco em textura**, grade de produto, títulos serifados finos, fundo claro | Vermelhos e motivos de tapete persa |
| Curio — página de produto | Galeria de closes ao lado da ficha → painel do seletor | Layout de e-commerce (preço, carrinho) |
| High-End Rugs | Grade de produto com fundo neutro e legenda curta | Avaliações e estrelas |
| Farahs / MAT | Só contraste; fundo escuro não será usado (instruções §4) | — |

## 3. Como a direção se traduz na página

| Tema | Decisão | Fonte |
|---|---|---|
| Conceito | Minimalista. A **régua** é a unidade da composição (divisores em juntas desencontradas, régua em escala no seletor). Os círculos aparecem só como amostras rápidas | prompt §4 + instruções §5 + ref. Luxury Flooring |
| Paleta | Base off-white quente, areia e cinza quente; texto em preto da marca; **um único acento para ações** (preto da marca; o marrom `#6D4609` do site fica como alternativa). O produto traz a cor | instruções §5 + manual (preto, branco, Cool Gray 10C/9C/6C) |
| Tipografia | No máximo 2 famílias. Texto: DM Sans, 16–18 px, entrelinha 1,5–1,6. Títulos: **DM Serif Display**, a mesma tipografia da LP B_life (decidido pelo Emmanuel em 11/10/2026). A serifada não pode vir combinada com fundo creme e terracota | instruções §5 + prompt §4 + manual 2017 |
| Grid | 12 colunas no desktop, 4 no celular, conteúdo com até 1200 px | instruções §5 |
| Imagem | Fotos grandes de ambiente + **closes de textura** (nova faixa "Textura de perto") | instruções §5–6 |
| Movimento | **Só o encaixe das réguas no hero**, sem animação de entrada nas seções; respeita `prefers-reduced-motion` | Emmanuel, 11/10/2026 |
| Cabeçalho | Logo + até 3 âncoras (Padrões, Ambientes, Especificações; escondidas no celular) + CTA | instruções §6.1 |
| Prova | Só material real: selos e garantias. Cases e depoimentos `[[PENDENTE: cases reais com Timberland]]` | instruções §6.7 |
| Marcador de falta | `[[PENDENTE: descrição]]`, visível; a guarda de conteúdo do build falha se sobrar algum em produção | instruções §3 (substitui `__TODO__`) |

## 4. Estrutura final (prompt §3 + acréscimos das instruções §6)

0 Cabeçalho · 1 Hero (com amostras em círculo) · 2 Benefícios · 3 Especificadores · 4 Padrões e formatos ·
**4b Textura de perto** · 5 Ambientes/aplicações (filtro residencial/comercial) · 6 Instalação · 7 Garantia e documentos ·
7b FAQ (proposta) · 8 Formulário · 9 Rodapé.

## 5. Verificação (a mais exigente das duas listas)

360, 390, 768, 1024, 1280 e 1440 px, sem rolagem lateral · teclado completo · contraste AA · formulário em erro e em sucesso ·
Lighthouse mobile (≥ 90 em desempenho, ≥ 95 em acessibilidade e SEO, com os números reais) · axe · console sem erros · lista de todos os `[[PENDENTE]]`.
