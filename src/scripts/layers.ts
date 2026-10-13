// Anatomia da régua: a régua aparece montada e se abre em camadas quando entra na tela.
// Passar o mouse ou focar na lista, ou tocar numa camada do desenho, destaca a camada nos dois lugares.
import { track } from './analytics';

export function initLayers(): void {
  const root = document.querySelector<HTMLElement>('[data-layers]');
  if (!root) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = root.querySelector<HTMLButtonElement>('[data-layers-toggle]')!;
  const labelEx = toggle.querySelector<HTMLElement>('[data-label-exploded]')!;
  const labelAs = toggle.querySelector<HTMLElement>('[data-label-assembled]')!;
  const svgLayers = [...root.querySelectorAll<SVGGElement>('.ly-layer')];
  const items = [...root.querySelectorAll<HTMLLIElement>('.ly-list li')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-layer-btn]')];

  const setState = (state: 'assembled' | 'exploded') => {
    root.dataset.state = state;
    const assembled = state === 'assembled';
    toggle.setAttribute('aria-pressed', String(assembled));
    labelEx.hidden = assembled;
    labelAs.hidden = !assembled;
  };

  let pinned: string | null = null;
  const highlight = (n: string | null) => {
    if (n && root.dataset.state === 'assembled') setState('exploded');
    if (n) root.dataset.active = n;
    else delete root.dataset.active;
    svgLayers.forEach((g) => g.classList.toggle('is-active', g.dataset.layer === n));
    // SVG não tem z-index: a camada em destaque vai para o fim do grupo e as outras voltam à ordem original
    const parent = svgLayers[0]!.parentNode!;
    svgLayers.forEach((g) => parent.appendChild(g));
    const active = svgLayers.find((g) => g.dataset.layer === n);
    if (active) parent.appendChild(active);
    items.forEach((li) => li.classList.toggle('is-active', li.dataset.layer === n));
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layerBtn === pinned)));
  };
  const release = () => highlight(pinned);
  const pin = (n: string) => {
    pinned = pinned === n ? null : n;
    highlight(pinned ?? n);
    if (pinned) track('layer_view', { layer: n });
  };

  buttons.forEach((b) => {
    const n = b.dataset.layerBtn!;
    b.addEventListener('mouseenter', () => highlight(n));
    b.addEventListener('focus', () => highlight(n));
    b.addEventListener('mouseleave', release);
    b.addEventListener('blur', release);
    b.addEventListener('click', () => pin(n));
  });
  // No desenho, só clique/toque: com hover a camada destacada se desloca e o cursor "pula" para a vizinha
  svgLayers.forEach((g) => g.addEventListener('click', () => pin(g.dataset.layer!)));

  toggle.addEventListener('click', () => {
    pinned = null;
    highlight(null);
    setState(root.dataset.state === 'assembled' ? 'exploded' : 'assembled');
  });

  // Abertura na entrada da tela (sem animação para quem prefere movimento reduzido)
  if (reduce) return;
  setState('assembled');
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e!.isIntersecting) return;
      io.disconnect();
      setTimeout(() => {
        if (!root.dataset.active) setState('exploded');
      }, 450);
    },
    { threshold: 0.45 },
  );
  io.observe(root.querySelector('.ly-svg')!);
}
