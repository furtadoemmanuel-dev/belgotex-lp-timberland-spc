import { track } from './analytics';

// Carrossel "visor" (ambientes): só a foto do visor fica aberta; as demais ficam dobradas de lado
// (giradas um quarto de volta e inclinadas em perspectiva), formando uma pilha de bordas.
// A faixa desliza numa mola convertida em `linear()`; a dobra usa uma curva com leve antecipação.
// Nada roda quadro a quadro em JavaScript: o script só troca classes e variáveis CSS.

const DURATION = 0.8; // s, dobra e mola
const BOUNCE = 0.2;
const TILT = 60; // graus que a foto dobrada inclina para trás
const ROLL = 90; // graus que a foto dobrada gira de lado
const FOLD_EASE = 'cubic-bezier(1, -0.03, 0.413, 0.965)';
const TYPE_LABEL: Record<string, string> = { residencial: 'Residencial', comercial: 'Comercial' };

function springAt(t: number): number {
  const zeta = 1 - BOUNCE;
  const w = (2 * Math.PI) / DURATION;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
}

/** A mola como easing CSS, amostrada até o envelope ficar abaixo de 0,1%. */
function springEasing(samples = 48): { easing: string; ms: number } {
  const zeta = 1 - BOUNCE;
  const w = (2 * Math.PI) / DURATION;
  const T = Math.log(1000) / (zeta * w);
  const pts: string[] = [];
  for (let k = 0; k <= samples; k++)
    pts.push(String(k === samples ? 1 : +springAt((k / samples) * T).toFixed(4)));
  return { easing: `linear(${pts.join(', ')})`, ms: Math.round(T * 1000) };
}

export function initGallery(): void {
  const root = document.querySelector<HTMLElement>('[data-gallery-root]');
  const list = document.querySelector<HTMLElement>('[data-gallery]');
  const dlg = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!root || !list || !dlg) return;

  const slots = [...list.querySelectorAll<HTMLLIElement>('li')];
  const frame = root.querySelector<HTMLElement>('[data-vf-frame]')!;
  let title = root.querySelector<HTMLElement>('[data-vf-title]')!;
  const live = root.querySelector<HTMLElement>('[data-vf-live]')!;
  const dots = root.querySelector<HTMLElement>('[data-vf-dots]')!;
  const count = root.querySelector<HTMLElement>('[data-vf-count]')!;
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const prev = root.querySelector<HTMLButtonElement>('[data-vf-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-vf-next]')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (CSS.supports('transition-timing-function', 'linear(0, 1)')) {
    const s = springEasing();
    root.style.setProperty('--vf-spring', `${s.ms}ms ${s.easing}`);
  }
  root.style.setProperty('--vf-fold', `${DURATION * 1000}ms ${FOLD_EASE}`);

  let visible = slots;
  let active = Math.floor((visible.length - 1) / 2);
  let movingUntil = 0;
  let first = true;

  const caption = (li: HTMLLIElement) => li.querySelector<HTMLButtonElement>('button')!.dataset.caption ?? '';

  function buildDots(): void {
    dots.replaceChildren(
      ...visible.map((li, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Ir para o ambiente ${i + 1}: ${caption(li)}`);
        b.addEventListener('click', () => go(i));
        return b;
      }),
    );
  }

  function render(): void {
    const n = visible.length;
    root!.style.setProperty('--vf-active', String(active));
    visible.forEach((li, i) => {
      const side = i < active ? 1 : i > active ? -1 : 0;
      li.style.zIndex = String(n - Math.abs(active - i));
      li.classList.toggle('is-active', side === 0);
      (li.firstElementChild as HTMLElement).style.transform =
        `rotateY(${side * TILT}deg) rotateZ(${side * ROLL}deg)`;
      const b = li.querySelector<HTMLButtonElement>('button')!;
      b.tabIndex = side === 0 ? 0 : -1;
      b.setAttribute('aria-label', `${side === 0 ? 'Ampliar foto' : 'Ver ambiente'}: ${caption(li)}`);
      if (side === 0) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    [...dots.children].forEach((d, i) =>
      i === active ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'),
    );
    count.textContent = `${pad2(active + 1)} / ${pad2(n)}`;
    prev.disabled = active <= 0;
    next.disabled = active >= n - 1;
    const li = visible[active];
    if (li) {
      // elemento novo = a animação de entrada do título roda de novo
      const fresh = title.cloneNode() as HTMLElement;
      const type = TYPE_LABEL[li.dataset.type ?? ''] ?? '';
      fresh.textContent = type ? `${caption(li)} · ${type}` : caption(li);
      title.replaceWith(fresh);
      title = fresh;
      if (!first) live.textContent = `Ambiente ${active + 1} de ${n}: ${caption(li)}`;
    }
    if (!first && !reduce.matches) {
      frame.classList.remove('pulse');
      void frame.offsetWidth;
      frame.classList.add('pulse');
    }
    first = false;
  }

  function go(i: number): void {
    const to = Math.min(Math.max(i, 0), visible.length - 1);
    if (to === active) return;
    const now = performance.now();
    if (now < movingUntil) return; // espera o movimento anterior assentar
    movingUntil = reduce.matches ? 0 : now + DURATION * 1000;
    active = to;
    render();
  }

  // Lightbox (ampliar)
  const img = dlg.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const cap = dlg.querySelector<HTMLElement>('[data-lb-caption]')!;
  let current: HTMLLIElement | null = null;

  const show = (li: HTMLLIElement) => {
    current = li;
    const b = li.querySelector<HTMLButtonElement>('button')!;
    img.srcset = b.dataset.full ?? '';
    img.src = b.dataset.fullDefault ?? '';
    img.alt = b.dataset.alt ?? '';
    cap.textContent = b.dataset.caption ?? '';
  };
  const step = (d: number) => {
    if (!current || !visible.length) return;
    show(visible[(visible.indexOf(current) + d + visible.length) % visible.length]!);
  };

  // Arrastar para os lados troca de foto; um clique sem arrasto abre (borda) ou amplia (foto aberta)
  let swipe = { id: -1, x: 0, done: false };
  root.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('.vf-controls')) return;
    swipe = { id: e.pointerId, x: e.clientX, done: false };
  });
  root.addEventListener('pointermove', (e) => {
    if (swipe.id !== e.pointerId || swipe.done) return;
    const dx = e.clientX - swipe.x;
    if (Math.abs(dx) > 40) {
      swipe.done = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  });
  const end = () => {
    swipe.id = -1;
    setTimeout(() => (swipe.done = false), 0);
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  list.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || swipe.done) return;
    const li = b.closest('li')!;
    const i = visible.indexOf(li);
    if (i !== active) return go(i);
    show(li);
    dlg.showModal();
    track('gallery_open', { photo: b.dataset.caption });
  });

  root.addEventListener('keydown', (e) => {
    if ((e.target as Element).closest('.vf-dots')) return;
    const k = e.key;
    const to =
      k === 'ArrowRight'
        ? active + 1
        : k === 'ArrowLeft'
          ? active - 1
          : k === 'Home'
            ? 0
            : k === 'End'
              ? visible.length - 1
              : null;
    if (to === null) return;
    e.preventDefault();
    go(to);
  });
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));

  dlg.querySelector('[data-lb-prev]')!.addEventListener('click', () => step(-1));
  dlg.querySelector('[data-lb-next]')!.addEventListener('click', () => step(1));
  dlg.querySelector('[data-lb-close]')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
  // Ao fechar, o carrossel para na última foto vista na ampliação
  dlg.addEventListener('close', () => {
    if (current) {
      const i = visible.indexOf(current);
      if (i >= 0 && i !== active) {
        movingUntil = 0;
        go(i);
      }
    }
    visible[active]?.querySelector('button')?.focus();
  });

  // Filtros: Todos / Residencial / Comercial
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter!;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      slots.forEach((li) => (li.hidden = f !== 'todos' && li.dataset.type !== f));
      visible = slots.filter((li) => !li.hidden);
      active = Math.floor((visible.length - 1) / 2);
      movingUntil = 0;
      buildDots();
      render();
    }),
  );

  // Fotos dobradas em 3D não são vistas como "na tela" pelo lazy loading: carrega todas quando a seção se aproxima
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e!.isIntersecting) return;
      root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((im) => (im.loading = 'eager'));
      io.disconnect();
    },
    { rootMargin: '600px 0px' },
  );
  io.observe(root);

  buildDots();
  render();
}
