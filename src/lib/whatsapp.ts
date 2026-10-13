export interface WhatsAppContext {
  number: string;
  campaign: string;
  location: string;
  pattern?: string;
  format?: string;
}

/** Mensagem em linguagem natural com código da campanha e origem do clique, para a Belgotex filtrar o lead. */
export function whatsappMessage({ campaign, location, pattern, format }: WhatsAppContext): string {
  let text = 'Olá! Vim pela página do Timberland SPC e gostaria de falar com um consultor.';
  if (pattern) text += ` Padrão: ${pattern}.`;
  if (format) text += ` Formato: ${format}.`;
  return `${text} Código: ${campaign} · origem: ${location}`;
}

export function whatsappHref(ctx: WhatsAppContext): string {
  return `https://wa.me/${ctx.number}?text=${encodeURIComponent(whatsappMessage(ctx))}`;
}
