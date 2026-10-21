# Pendências para o e-mail ao cliente

Link de aprovação: https://belgotex-timberland.pages.dev (publicado em 12/10/2026; atualizar com `npm run deploy:approval`).

Para o e-mail ao cliente:

1. Ficha do XL: a ficha completa do Timberland XL (peso, tratamento de superfície e ensaios) aparece marcada como pendente na própria página.
2. Formulários: a cotação e o pedido de amostra estão em modo de teste até a Belgotex passar o destino no RD.
3. Fotos e selos: os tirados do catálogo estão em baixa resolução até chegarem os originais. Também falta o macro oficial da textura sincronizada e o desenho técnico do perfil clic, e a animação é uma ilustração.
4. Embalagem: há uma divergência na metragem da caixa do formato Regular. O catálogo traz 2,68 m² e a ficha técnica traz 2,608 m², que é o que bate com a conta. Preciso que a Belgotex confirme.
5. Publicação final: falta definir o subdomínio e o ID do GTM.

## Versão 02 (14/10/2026)

- Resolvido (15/10/2026): **e-mail do XP** para os pedidos de amostra: `lucas.boita@belgotex.com.br`
  (`SAMPLE_EMAIL`). O envio abre o e-mail da pessoa já preenchido para esse endereço.
- Resolvido (15/10/2026): **WhatsApp do XP** para "Falar com um consultor": (42) 99139-1436 (`5542991391436`).
- Resolvido (15/10/2026): **mensagem do WhatsApp** confirmada pelo cliente: "Olá! Vim pela página do Timberland
  SPC e gostaria de falar com um consultor." (seguida do padrão, do formato e do código da campanha).
- **Roomvo**: liberar o subdomínio e informar os SKUs dos padrões (`docs/roomvo.md`).
- Cotação: decidido, vai para a página do Timberland no site (`QUOTE_URL`).

## Versão 03 (21/10/2026), correções do PDF do cliente

- Resolvido: **ficha do XL** aplicada a partir de "Especificação Técnica Timberland XL" (atualizada em 20/10/2026):
  uso 23 · 32 (comercial geral), peso, embalagem 5 peças / 2,118 m², tratamento, ensaios, Δ 19 dB, GREENGUARD Gold.
  O marcador `[[PENDENTE]]` saiu da página. "Produto importado: China" ficou de fora (decisão do Emmanuel).
- Garantia: "limitada ao uso residencial" (antes "para uso residencial"), em todos os textos.
- Seletor: a escolha de cor vem antes do quadro "Os 3 formatos em escala".
- Mais espaço antes de "Veja de perto".
- Título "7 padrões de carvalho" mantido (5 no Regular, 2 deles também no XL, e 2 no HB).

## Resolvido pelo site da Belgotex (21/10/2026)

- Caixa do Regular: a ficha do site confirma 11 peças / 2,608 m² (já era o valor da página).
- Classificação de uso do Regular e do HB na tabela: "32 comercial geral", como na ficha do site.
  (A ficha do site traz "≤ 2,0 kV" em estabilidade dimensional do Regular/HB, erro de digitação; a tabela mantém "—".)
- Roomvo: desconsiderado. O botão leva à página do produto, onde o site já carrega o plug-in.
- Hospedagem, DNS e publicação: com o desenvolvedor do site.
