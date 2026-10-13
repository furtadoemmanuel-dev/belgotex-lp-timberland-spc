// Fileira curva dos selos (SealArc.astro). Adaptação sem React do "Scroll Tilted Grid" em curva: os cards
// dos selos correm por dentro de um cilindro, de frente no centro e curvando na direção de quem olha nas
// pontas, que somem num degradê. Um card não dobra, então cada um é cortado em SLICES faixas verticais,
// cada faixa um pedaço plano do cilindro. Aqui quem move a fileira é a rolagem da página (parallax): rolou,
// ela anda, com uma suavização leve. As setas laterais avançam ou voltam um selo por clique, somando-se à
// rolagem. Com movimento reduzido a rolagem não move a fileira e as setas trocam de selo sem animação. É
// decorativa (aria-hidden): os selos estão descritos nos cards logo abaixo.

const SLICES = 14;
const CAMERA = 1.6; // distância da câmera, em raios do cilindro
const BEND = (64 * Math.PI) / 180; // quanto a fileira já curvou na borda da faixa
const TILE = 0.56; // altura do card, em fração da altura da faixa
const MAX_WIDTH = 0.4; // largura máxima do card, em fração da largura da faixa
const ASPECT = 0.84; // largura / altura do card
const GAP = 0.1; // espaço entre cards, em fração da altura do card
const PX_PER_TILE = 240; // rolagem (px) para a fileira andar um card
const EASE = 0.1; // suavização por quadro

interface Seal {
  src: string;
  label: string;
}

const deg = (rad: number) => (rad * 180) / Math.PI;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Raio do cilindro (em larguras da faixa) que põe a borda da faixa BEND radianos adiante no arco. */
const arc = (bend: number) => (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));

export function initSealArc(): void {
  const root = document.querySelector<HTMLElement>('[data-sealarc]');
  if (!root) return;
  const band = root.querySelector<HTMLElement>('[data-sealarc-band]')!;
  const seals = JSON.parse(root.dataset.seals ?? '[]') as Seal[];
  if (!seals.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tiles: { el: HTMLElement; imgs: HTMLImageElement[]; labels: HTMLElement[]; shown: number }[] = [];
  let geo = { radius: 0, pitch: 0, loop: 0, sweep: 0, limit: 0 };
  let current = 0; // deslocamento atual, em graus
  let target = 0;
  let nudge = 0; // selos avançados pelas setas
  /** Posição desejada, em cards: rolagem da página + setas. */
  const pos = () => (reduce ? 0 : window.scrollY / PX_PER_TILE) + nudge;
  let raf = 0;
  let visible = false;
  let size = '';

  const turn = (d: number) =>
    `translateZ(${geo.radius}px) rotateY(${d.toFixed(4)}deg) translateZ(${-geo.radius}px)`;

  const build = () => {
    const { width: w, height: hh } = root.getBoundingClientRect();
    if (!w || !hh || size === `${w}x${hh}`) return;
    size = `${w}x${hh}`;
    const ratio = geo.pitch ? current / geo.pitch : 0; // mantém a posição (em cards) ao redimensionar
    const h = Math.min(TILE * hh, (MAX_WIDTH * w) / ASPECT);
    const radius = w * arc(BEND);
    const unit = deg(h / radius);
    const pitch = (ASPECT + GAP) * unit;
    const limit = deg(BEND) + (ASPECT * unit) / 2;
    const columns = Math.min(40, Math.max(2, Math.ceil((2 * limit) / pitch)));
    geo = { radius, pitch, loop: columns * pitch, sweep: (columns * pitch) / 2, limit };
    current = ratio * pitch;
    target = pos() * pitch;

    band.style.perspective = `${radius * CAMERA}px`;
    band.textContent = '';
    const share = ASPECT / SLICES;
    const tw = ASPECT * h;
    tiles = Array.from({ length: columns }, () => {
      const el = document.createElement('div');
      el.className = 'sa-tile';
      Object.assign(el.style, {
        left: `${(w - tw) / 2}px`,
        top: `${(hh - h) / 2}px`,
        width: `${tw}px`,
        height: `${h}px`,
        fontSize: `${h * 0.075}px`,
      });
      const imgs: HTMLImageElement[] = [];
      const labels: HTMLElement[] = [];
      for (let k = 0; k < SLICES; k++) {
        const strip = document.createElement('div');
        strip.className = 'sa-strip';
        Object.assign(strip.style, {
          left: `${((ASPECT - share) / 2) * h}px`,
          // um pixel a mais para as faixas vizinhas se sobreporem e não abrir fresta
          width: `${share * h + (k === SLICES - 1 ? 0 : 1)}px`,
          height: `${h}px`,
          transform: turn((ASPECT / 2 - (k + 0.5) * share) * unit),
        });
        const card = document.createElement('div');
        card.className = 'sa-card';
        Object.assign(card.style, { left: `${-k * share * h}px`, width: `${tw}px`, height: `${h}px` });
        const img = document.createElement('img');
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        const label = document.createElement('span');
        card.append(img, label);
        strip.append(card);
        el.append(strip);
        imgs.push(img);
        labels.push(label);
      }
      band.append(el);
      return { el, imgs, labels, shown: -1 };
    });
    render();
  };

  // Posição de cada card no arco; o card troca de selo só quando dá a volta, fora da vista
  const render = () => {
    const { pitch, loop, sweep, limit } = geo;
    const n = tiles.length;
    tiles.forEach((t, i) => {
      const raw = i * pitch + current;
      const lap = Math.floor(raw / loop);
      const angle = raw - lap * loop - sweep;
      const off = Math.abs(angle) > limit;
      t.el.style.visibility = off ? 'hidden' : 'visible';
      if (off) return;
      t.el.style.transform = turn(angle);
      const idx = mod(-lap * n + (n - 1 - i), seals.length);
      if (idx !== t.shown) {
        t.shown = idx;
        const s = seals[idx]!;
        t.imgs.forEach((im) => (im.src = s.src));
        t.labels.forEach((l) => (l.textContent = s.label));
      }
    });
  };

  const tick = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.002) current = target;
    render();
    raf = current === target ? 0 : requestAnimationFrame(tick);
  };
  const go = () => {
    target = pos() * geo.pitch;
    if (reduce) {
      current = target;
      render();
    } else if (visible && !raf) raf = requestAnimationFrame(tick);
  };

  // Carrega os selos antes de a fileira precisar deles
  seals.forEach((s) => (new Image().src = s.src));
  build();
  new ResizeObserver(() => build()).observe(root);
  root.dataset.ready = '';

  // Seta da direita traz os próximos selos (a fileira anda para a esquerda), a da esquerda volta
  document.querySelectorAll<HTMLButtonElement>('[data-sealarc-step]').forEach((btn) =>
    btn.addEventListener('click', () => {
      nudge += Number(btn.dataset.sealarcStep);
      go();
    }),
  );

  if (reduce) return;
  current = target = pos() * geo.pitch;
  render();
  new IntersectionObserver(
    ([e]) => {
      visible = e!.isIntersecting;
      if (visible) go();
    },
    { rootMargin: '100px 0px' },
  ).observe(root);
  window.addEventListener('scroll', go, { passive: true });
}
