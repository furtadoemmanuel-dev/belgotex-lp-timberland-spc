/** Seleção compartilhada entre o seletor, o WhatsApp e o formulário. */
export interface Selection {
  pattern: string;
  patternName: string;
  format: string;
  formatLabel: string;
  /** true depois que a pessoa escolhe algo no seletor (antes disso não pré-preenchemos nada). */
  chosen: boolean;
}

const selection: Selection = { pattern: '', patternName: '', format: '', formatLabel: '', chosen: false };

export const getSelection = (): Readonly<Selection> => selection;

export function setSelection(next: Partial<Selection>): void {
  Object.assign(selection, next);
  document.dispatchEvent(new CustomEvent('selection:change', { detail: { ...selection } }));
}
