import { setSelection } from './state';
import { track } from './analytics';

export function initSelector(): void {
  const found = document.querySelector<HTMLElement>('[data-selector]');
  if (!found) return;
  const root: HTMLElement = found;
  const labels = JSON.parse(root.querySelector('[data-format-labels]')!.textContent || '{}') as Record<
    string,
    string
  >;
  const formatInputs = [...root.querySelectorAll<HTMLInputElement>('input[name="format"]')];
  const patternInputs = [...root.querySelectorAll<HTMLInputElement>('input[name="pattern"]')];
  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;

  const current = () => ({
    format: formatInputs.find((i) => i.checked)!,
    pattern: patternInputs.find((i) => i.checked)!,
  });

  function render(): void {
    const { format, pattern } = current();
    const f = format.value;
    // Mostra só os padrões que existem no formato escolhido
    patternInputs.forEach((input) => {
      const ok = (input.dataset.formats ?? '').split(' ').includes(f);
      input.disabled = !ok;
      input.closest('li')!.hidden = !ok;
    });
    let p = pattern;
    if (!p || p.disabled) {
      p = patternInputs.find((i) => !i.disabled)!;
      p.checked = true;
    }
    root
      .querySelectorAll<HTMLElement>('[data-preview]')
      .forEach((el) => (el.hidden = el.dataset.preview !== p.value));
    $('[data-pv-name]').textContent = p.dataset.name ?? '';
    $('[data-pv-format]').textContent = format.dataset.label ?? '';
    $('[data-pv-size]').textContent = format.dataset.size ?? '';
    $('[data-pv-thick]').textContent = format.dataset.thickness ?? '';
    const also = (p.dataset.formats ?? '')
      .split(' ')
      .filter((x) => x && x !== f)
      .map((x) => formatInputs.find((i) => i.value === x)?.dataset.label ?? labels[x]);
    $('[data-pv-also]').textContent = also.length ? also.join(', ') : 'Somente neste formato';
    const note = $<HTMLElement>('[data-pv-note]');
    note.textContent = p.dataset.note ?? '';
    note.hidden = !p.dataset.note;
    $<HTMLAnchorElement>('[data-pv-skp]').href = p.dataset.skp ?? '#';
    $<HTMLAnchorElement>('[data-pv-download]').href = p.dataset.download ?? '#';
    // ROOMVO: todos os gatilhos do simulador levam o padrão escolhido
    document
      .querySelectorAll<HTMLElement>('[data-roomvo-trigger]')
      .forEach((el) => (el.dataset.roomvoPattern = p.value));
    $<HTMLElement>('[data-xl-note]').hidden = f !== 'xl';
    root
      .querySelectorAll<HTMLElement>('[data-scale]')
      .forEach((g) => g.classList.toggle('on', g.dataset.scale === f));
  }

  function commit(): void {
    const { format, pattern } = current();
    setSelection({
      pattern: pattern.value,
      patternName: pattern.dataset.name ?? '',
      format: format.value,
      formatLabel: format.dataset.label ?? '',
      chosen: true,
    });
  }

  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    render();
    if (t.name === 'format') track('format_select', { format: t.value });
    if (t.name === 'pattern') track('pattern_select', { pattern: t.value, format: current().format.value });
    commit();
  });

  // Amostras em círculo do hero levam ao padrão correspondente
  document.querySelectorAll<HTMLAnchorElement>('[data-pattern-link]').forEach((a) =>
    a.addEventListener('click', () => {
      const id = a.dataset.patternLink!;
      const input = patternInputs.find((i) => i.value === id)!;
      const fmt = (input.dataset.formats ?? '').split(' ')[0]!;
      formatInputs.forEach((i) => (i.checked = i.value === fmt));
      render();
      input.checked = true;
      render();
      commit();
      track('pattern_select', { pattern: id, format: fmt, location: 'hero' });
    }),
  );

  // "Solicitar cotação deste padrão" garante que a seleção atual vá para o formulário
  root.querySelector('[data-prefill]')?.addEventListener('click', commit);
  render();
}
