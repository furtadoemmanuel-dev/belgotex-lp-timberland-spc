# Arquitetura de informação — LP Timberland SPC

A ordem segue a seção 3 do prompt (definida pela Belgotex). Duas inclusões propostas pela Ample Sample estão marcadas como **[PROPOSTA]**, para aprovação.

**CTAs**
- Primário: **Solicitar cotação** → âncora `#cotacao` (formulário).
- Secundário: **Falar com um consultor** → WhatsApp com código da campanha e local do clique.
- Terciários: Pedir amostra (abre o formulário com "amostra" marcado), Ver no meu ambiente (simulador), downloads.

**Regras globais**
- Nenhum link para o menu do site principal. O logo leva ao topo e o rodapé tem um único link "belgotex.com.br".
- No celular, barra fixa inferior com os 2 CTAs. Ela some quando o formulário está visível.
- Todo `section_id` dispara `section_view` ao entrar 50% na tela.

| # | Seção | `id` / `section_id` | Objetivo | Conteúdo | Fonte | CTA |
|---|---|---|---|---|---|---|
| 0 | Cabeçalho | `topo` / `header` | Marca e acesso imediato à conversão | Logo Belgotex · selo "Timberland SPC" · "Falar com um consultor" (link) · "Solicitar cotação" (botão) | marca | quote · consultant(header) |
| 1 | Hero | `inicio` / `hero` | Promessa + desejo + prova em 5 s | H1: resistência do SPC + madeira natural · subtítulo · faixa com "3 formatos" e "instalação clic" · 2 CTAs · **faixa de prova com 4 selos** (garantia vitalícia residencial, 100% à prova d'água, FloorScore, ISO 9001/14001) · imagem ambientada + réguas que encaixam (única animação) | PÁG, CAT, FICHA | quote(hero) · consultant(hero) |
| 2 | Benefícios técnicos | `beneficios` / `benefits` | Prioridade 1: provar a resistência e a técnica | Grade de 6 benefícios: SPC núcleo rígido · à prova d'água · clic sem cola · base acústica IXPE (Δ18 dB) · 5 mm (4 + 1) · uso 23 e 32. **Diagrama em corte** só com as camadas confirmadas (capa de uso 0,50 mm · núcleo SPC · base IXPE 1 mm; total 5 mm). Linha de tecnologias: EIR, Excimer Xtra Matte, PureCoat UV/PUR, 24 réguas únicas por cor, livre de ftalatos, pet-friendly | FICHA, CAT p.6–24 | quote(benefits) |
| 3 | Para arquitetos e designers | `especificadores` / `specifiers` | Converter especificadores (objetivo principal) | Faixa curta: Ficha técnica (PDF) · SketchUp (3D Warehouse e .skp por cor) · Laudos (PDF) · Casoca · CTAs "Pedir amostra" e "Falar com um consultor" | PÁG | sample(specifiers) · consultant(specifiers) · document |
| 4 | Cores, padrões e formatos | `padroes` / `patterns` | Prioridade 2: desejo + intenção qualificada | **Seletor:** formato (Padrão · HB · XL) como radio → grade de réguas dos padrões disponíveis → painel grande com textura, nome, código, formato e medida, **régua em escala (SVG)** comparando os 3 formatos, "também disponível em", downloads (.skp) · botões "Solicitar cotação deste padrão" (pré-preenche o formulário), "Falar com um consultor" (WhatsApp com padrão e formato) e "Ver no meu ambiente" (simulador) | PÁG, CAT p.29–65 | quote(pattern) · consultant(pattern) · simulator |
| 5 | Ambientes e inspirações | `ambientes` / `gallery` | Prioridade 3: imaginar no próprio espaço | Filtro Todos / Residencial / Comercial · grade de fotos com legenda (padrão + formato) · ampliação em `<dialog>` com navegação por teclado · CTA no fim | PÁG (11 fotos), ARQ (14 fotos) | quote(gallery) |
| 6 | Instalação | `instalacao` / `install` | Prioridade 4: reduzir o medo da obra | 4 passos numerados (sequência real): 1. aclimatação 24 h · 2. encaixe angle-angle sem cola · 3. instalação flutuante · 4. pronto para usar · destaque "até 30% mais rápida que LVTs tradicionais" · bloco de conservação (vassoura macia/mop, detergente neutro) · link para o PDF | CAT p.22–23, INST | consultant(install) · document |
| 7 | Garantia, certificações e documentos | `garantia` / `trust` | Prioridade 5: segurança da decisão | Garantia vitalícia limitada residencial + 15 anos comercial (texto da ficha) · **todos os 19 selos** da página atual · tabela técnica completa (acordeão "Ver todas as especificações") · lista de documentos com tamanho do arquivo | FICHA, PÁG | document · quote(trust) |
| 7b | **[PROPOSTA]** Perguntas frequentes | `perguntas` / `faq` | Quebrar objeções antes do formulário | 6 a 8 perguntas com respostas só positivas e verificadas: à prova d'água? pets? onde posso usar (23/32)? precisa de cola? posso instalar sobre o piso atual? (→ "um consultor avalia") qual a garantia? como limpo? tem amostra? · usa `<details>` | FICHA, CAT, INST | consultant(faq) |
| 8 | Formulário "Solicitar cotação" | `cotacao` / `form` | Destino de todos os CTAs primários | **[PROPOSTA] 2 etapas.** Etapa 1: nome, WhatsApp, perfil → "Continuar". Etapa 2: e-mail, cidade/UF, preciso de (cotação / amostra), padrão e formato (pré-preenchidos), área do projeto, mensagem, consentimento LGPD → "Solicitar cotação". Sucesso na própria página + "Continuar no WhatsApp". Erro: mantém os dados e oferece o WhatsApp | prompt §5 | quote(form) · whatsapp(form_success) |
| 9 | Rodapé | `rodape` / `footer` | Confiança institucional | Logo · razão social e CNPJ · endereço · e-mail · redes · Política de privacidade · Política de cookies · nota de tolerância técnica | FICHA, site | — |

## Componentes fixos

| Componente | Comportamento |
|---|---|
| Barra fixa (celular) | "Falar com consultor" + "Solicitar cotação". Aparece depois do hero e some quando o formulário está visível |
| Banner de consentimento | Consent Mode v2, negado por padrão; aceitar, recusar e configurar |
| `<dialog>` da galeria | Foco preso, Esc fecha, setas navegam |

## Fluxo de conversão

```
Anúncio/orgânico → Hero ─┬─ Solicitar cotação ──────────────→ #cotacao (etapa 1 → etapa 2 → sucesso → WhatsApp opcional)
                         ├─ Falar com consultor ────────────→ WhatsApp (código + origem)
                         └─ rolagem → Benefícios → Especificadores (amostra/docs)
                                    → Seletor (padrão+formato) ─→ cotação pré-preenchida | WhatsApp com padrão
                                    → Galeria → Instalação → Garantia → FAQ → Formulário
```

## Mapa de eventos por seção

| Seção | Eventos |
|---|---|
| Todas | `section_view`, `scroll_depth` |
| Cabeçalho, hero, barra fixa | `cta_click`, `whatsapp_click` |
| Especificadores, garantia, instalação | `document_download {doc_id}`, `cta_click {cta_type: sample/document}` |
| Seletor | `format_select`, `pattern_select`, `cta_click {simulator}`, `whatsapp_click {pattern, format}` |
| Galeria | `gallery_open` |
| Formulário | `form_start`, `form_error {field}`, `form_submit {perfil, needs}` |
