import { whatsappHref } from '../lib/whatsapp';
import { getSelection } from './state';
import { track } from './analytics';

/** Atualiza o link no clique para incluir padrão e formato escolhidos no seletor. */
export function initWhatsApp(number: string, campaign: string): void {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a.js-wa');
    if (!a) return;
    const sel = getSelection();
    const location = a.dataset.loc ?? 'unknown';
    a.href = whatsappHref({
      number,
      campaign,
      location,
      pattern: sel.chosen ? sel.patternName : undefined,
      format: sel.chosen ? sel.formatLabel : undefined,
    });
    track('cta_click', { cta_id: `consultant_${location}`, cta_type: 'consultant', location });
    track('whatsapp_click', {
      location,
      pattern: sel.chosen ? sel.pattern : '',
      format: sel.chosen ? sel.format : '',
    });
  });
}
