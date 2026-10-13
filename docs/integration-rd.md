# Integração do formulário com o RD

**Situação:** o briefing indica **RD Conversas**, mas o site da Belgotex usa **RD Station Marketing** (loader e lead tracking). O destino ainda não foi confirmado.
Enquanto `LEAD_ENDPOINT` estiver vazio, o formulário usa o **provedor simulado**: nenhum dado sai do navegador.

## Como o código está preparado

- `src/lib/lead.ts` define `submitLead(payload, provider)` com provedores substituíveis:
  - `simulatedProvider` (padrão, sem envio);
  - `jsonEndpointProvider(url)`: `POST` JSON para `LEAD_ENDPOINT`. Espera resposta 2xx; qualquer outra resposta mostra a mensagem de erro, mantém os dados e oferece o WhatsApp.
- Payload enviado: nome, telefone, e-mail, cidade, UF, perfil, necessidades (cotação/amostra), padrão, formato, área, mensagem,
  consentimento + texto do consentimento, `campaign_code`, `click_origin`, `page_url`, UTMs e data/hora.

## Opções de integração (escolha da Belgotex)

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Função serverless como proxy** (recomendada) | `LEAD_ENDPOINT` aponta para uma função (Cloudflare Worker / Pages Function) que recebe o JSON, valida e repassa ao RD com o token guardado no servidor | Token nunca vai para o navegador; dá para enviar a RD Station Marketing e RD Conversas ao mesmo tempo; logs | Exige a função (cerca de 40 linhas) e as credenciais |
| **B. Webhook de automação** | `LEAD_ENDPOINT` = URL de webhook (Make, Zapier, n8n) que cria o contato no RD | Sem código no servidor | Mais uma ferramenta paga; menos controle |
| **C. API de conversões do RD Station Marketing com token público** | Chamada direta do navegador com o token público de conversão | Simples | Só serve para RD Station Marketing (não para Conversas); o token público fica exposto (é o uso previsto, mas recebe spam com mais facilidade) |

**Nunca** colocar token privado ou chave OAuth no front-end ou no `.env` de build: tudo o que está no `.env` vai para o HTML.

## O que precisamos da Belgotex

1. Destino: RD Station Marketing, RD Conversas ou os dois.
2. Credenciais (para a opção A, entregues por canal seguro) e o identificador de conversão desejado (sugestão: `lp-timberland-spc`).
3. Campos obrigatórios e o critério de lead qualificado.
4. Quem recebe e o prazo de primeira resposta (para o texto de confirmação).

## Pedido de amostra pelo correio

O painel "Solicite uma amostra" (`src/components/Sample.astro`) usa o mesmo adaptador e o mesmo `LEAD_ENDPOINT` da cotação, com o payload `SampleLeadPayload` (`src/lib/lead.ts`):

- `lead_type: "amostra"` para separar das cotações no destino (no RD, use como tag ou campo personalizado);
- `patterns` (lista de códigos dos padrões), `profile`, contato (`name`, `email`, `phone`);
- endereço de entrega: `cep`, `street`, `number`, `complement`, `district`, `city`, `uf`;
- `consent`, `consent_text`, `campaign_code`, `click_origin`, UTMs e `submitted_at`.

O CEP não é consultado em nenhum serviço externo (ex.: ViaCEP) — o endereço é digitado. Se quiserem o preenchimento automático pelo CEP, é preciso aprovar o serviço antes.
