# Pendências, decisões e perguntas — LP Timberland SPC

> Etapa B entregue em 11/10/2026. Pendências de assets em `assets-todo.md`; integração em `integration-rd.md`.

Atualizado em 11/10/2026. Nada aqui bloqueia a aprovação do wireframe. Itens com `[[PENDENTE]]` precisam ser resolvidos antes da publicação.

## A. Pendências da Belgotex (seção 7 do prompt)

| # | Pendência | Situação | Impacto |
|---|---|---|---|
| 1 | Aprovador final e data de publicação | `[[PENDENTE: aprovador e data]]` | cronograma |
| 2 | Número de WhatsApp | **Resolvido:** `554291391436` é o número em uso em belgotex.com.br (fixo com WhatsApp Business, DDD 42). Confirmar se a LP usa a mesma equipe | baixo |
| 3 | Código da campanha | Proposto `LP-TIMBERLAND-SPC` | baixo |
| 4 | Meta mensal do KPI | `[[PENDENTE: meta mensal]]` | relatório |
| 5 | Campos obrigatórios e critério de lead qualificado | Proposta no wireframe (etapa 1: nome, WhatsApp, perfil; etapa 2: e-mail, cidade/UF, necessidade). Validar | formulário |
| 6 | Integração do lead | O briefing diz **RD Conversas**, mas o site usa **RD Station Marketing**. Qual é o destino? Precisamos de credenciais ou do token público | formulário |
| 7 | Os 3 formatos | Medidas resolvidas pelo catálogo. **XL:** o catálogo diz Canyon + Classic, mas os arquivos são Canyon + Woodland (réguas no tamanho padrão). Sem ficha técnica do XL | seletor, ficha |
| 8 | Imagens e documentos em alta, com autorização de uso | Fotos do site ≤ 900 px; Silver Oak 1520 px; `Harmony IAs.png` parece gerada por IA. Classificar fotos em residencial/comercial | galeria, hero |
| 9 | Simulador, privacidade, GTM e hospedagem | Simulador = **Roomvo**, licenciado por domínio (precisa liberar o subdomínio). Privacidade: `/politica-de-privacidade` ✅. GTM: usar `GTM-PB78XKMK`? Hospedagem e subdomínio `[[PENDENTE: hospedagem e subdomínio]]` | publicação |
| 10 | Logo e cores oficiais | Logo vetorial ✅ (`assets_belgotex`). Cores: só Pantone Cool Gray 10C/9C/6C, sem valores numéricos. Fontes Circular/Publico exigem licença | design |

## B. Decisões tomadas pela Ample Sample (para validar)

1. **FAQ antes do formulário** (seção 7b). Fora da ordem do briefing, mas não altera as prioridades 1–5. Pode ser removido sem impacto no restante.
2. **Formulário em 2 etapas.** A etapa 1 pede 3 campos; a etapa 2 qualifica. **Na produção, nada é enviado na etapa 1** (o consentimento LGPD está na etapa 2). Envio do lead parcial só se a Belgotex pedir, com o consentimento movido para a etapa 1.
3. **Campo "Área do projeto"** reaproveitado do formulário do site (até 100 / 200 / 300 / acima de 300 m²) para qualificar.
4. **Perfil** com 4 opções do prompt: consumidor, arquiteto/designer, construtora/incorporadora, revenda. O "segmento" do site (Casa, Comércio…) **não** entra para não alongar o formulário.
5. **Selos no hero:** garantia vitalícia residencial, 100% à prova d'água, FloorScore, ISO 9001/14001.
6. **Seletor:** escolhe-se o formato primeiro e depois o padrão. Assim cada combinação mostrada existe, o que evita oferecer XL em uma cor que não tem.
7. **Diagrama em corte:** capa de uso 0,50 mm + núcleo SPC + base IXPE 1 mm = 5 mm (todos os valores vêm da ficha técnica).
8. **Limitações omitidas** (regra do briefing): contrapiso, substratos não autorizados, áreas molhadas, uso externo, área máxima, alerta de água em excesso. Elas continuam no PDF de instalação linkado. **Pedir o aval do jurídico da Belgotex.**
9. **FAQ "posso instalar sobre o piso atual?"** A resposta leva ao consultor ("em muitos casos, sim; um consultor avalia o seu piso"), sem prometer o que o manual restringe.
10. **Fontes:** Plus Jakarta Sans (a mesma do site) até haver licença de Circular/Publico.
11. **Origem "importado — China"** não aparece na página; continua no PDF da ficha.
12. **Hospedagem:** estática (Astro). Recomendado Cloudflare Pages na conta da Belgotex + CNAME `timberland.belgotex.com.br`.

## C. Perguntas para a Belgotex

1. Quem aprova a LP e qual a data de publicação?
2. O lead vai para RD Station Marketing ou para RD Conversas? Quem nos passa o acesso ou o token?
3. A LP usa o mesmo GTM do site (`GTM-PB78XKMK`)?
4. Quais cores existem em XL? Há ficha técnica e fotos do XL?
5. A Roomvo pode liberar o subdomínio para o "Ver no meu ambiente"?
6. Aprovam o FAQ e o formulário em 2 etapas?
7. O jurídico aprova omitir as limitações de instalação na página (mantendo-as no PDF)?
8. Há cases ou depoimentos reais com Timberland para usar como prova social?
9. Qual subdomínio e qual hospedagem? Quem administra o Cloudflare?
10. Há licença web de Circular e Publico?

## D. Erros nos arquivos do fornecedor (validação pelo marketing do fabricante)

Ver `../../arquivos do fornecedor/Timberland/PENDENCIAS.md`. Resumo: cores do XL, réguas "XL" do Woodland no tamanho padrão, termos de garantia ausentes no catálogo, imagens em baixa resolução e uma duplicada, erros de texto (p.7, 23 e 25).
