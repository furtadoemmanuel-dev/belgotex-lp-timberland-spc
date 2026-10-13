// Carrossel "abertura" do hero: a próxima foto abre num círculo que cresce a partir do clique,
// com um anel fino na borda. Clique na metade direita avança, na esquerda volta; também aceita
// arrastar, setas do teclado e os botões. Com movimento reduzido vira um fade e não troca sozinho.

/** Raio que cobre uma caixa w×h a partir de (x, y): a distância até o canto mais longe. */
const coverRadius = (x: number, y: number, w: number, h: number) =>
  Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
const wrap = (i: number, n: number) => ((i % n) + n) % n;
const pad2 = (n: number) => String(n).padStart(2, '0');
const EASE = 'cubic-bezier(.7,0,.2,1)';
// Cliques nestes elementos são da página, não do carrossel
const IGNORE = 'a, button, input, select, textarea, .hero-copy, .ap-bar';

export function initAperture(): void {
  const root = document.querySelector<HTMLElement>('[data-aperture]');
  if (!root) return;
  const slides = [...root.querySelectorAll<HTMLElement>('.ap-slide')];
  const n = slides.length;
  if (n < 2) return;

  const captions = JSON.parse(root.dataset.captions ?? '[]') as string[];
  const autoplay = Number(root.dataset.autoplay ?? 0);
  const duration = Number(root.dataset.duration ?? 1100);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ring = root.querySelector<HTMLElement>('.ap-ring')!;
  const lens = root.querySelector<HTMLElement>('.ap-lens')!;
  const fill = root.querySelector<HTMLElement>('.ap-fill')!;
  const live = root.querySelector<HTMLElement>('[data-ap-live]')!;
  let caption = root.querySelector<HTMLElement>('[data-ap-caption]')!;
  const counter = root.querySelector<HTMLElement>('[data-ap-index]')!;
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-ap-pause]')!;

  let index = 0;
  let busy = false;
  let userPaused = reduce;
  let hold = false; // fora da tela ou aba em segundo plano
  root.style.setProperty('--ap-dur', `${autoplay}ms`);
  if (reduce || !autoplay) root.dataset.static = '';

  // Só baixa as outras fotos depois que a página carregou, para não disputar com a primeira, e só as
  // vizinhas da atual (a próxima e a anterior): no celular isso evita baixar o carrossel inteiro de uma vez
  const hydrate = (slide: HTMLElement) => {
    const img = slide.querySelector<HTMLImageElement>('img[data-srcset]');
    if (!img) return;
    // o recorte vertical do celular (<source>) primeiro, para o navegador já escolher entre os dois
    slide.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((src) => {
      src.srcset = src.dataset.srcset!;
      src.removeAttribute('data-srcset');
    });
    img.srcset = img.dataset.srcset!;
    img.src = img.dataset.src!;
    img.removeAttribute('data-srcset');
  };
  const hydrateNear = () => [1, -1].forEach((d) => hydrate(slides[wrap(index + d, n)]!));
  if (document.readyState === 'complete') setTimeout(hydrateNear, 600);
  else window.addEventListener('load', () => setTimeout(hydrateNear, 600), { once: true });

  const syncPaused = () => {
    if (userPaused || hold) root.dataset.paused = '';
    else delete root.dataset.paused;
  };
  const runFill = () => {
    fill.classList.remove('run');
    if (reduce || !autoplay || userPaused) return;
    void fill.offsetWidth; // reinicia a animação
    fill.classList.add('run');
  };
  fill.addEventListener('animationend', () => go(1));

  const showCaption = (i: number) => {
    counter.textContent = pad2(i + 1);
    const fresh = caption.cloneNode() as HTMLElement;
    fresh.textContent = captions[i] ?? '';
    caption.replaceWith(fresh); // elemento novo = a animação de subida roda de novo
    caption = fresh;
  };

  async function go(dir: number, x?: number, y?: number): Promise<void> {
    if (busy) return;
    busy = true;
    fill.classList.remove('run');
    const to = wrap(index + dir, n);
    const next = slides[to]!;
    const img = next.querySelector<HTMLImageElement>('img')!;
    hydrate(next);
    try {
      await img.decode();
    } catch {
      /* segue mesmo assim */
    }
    const { width: w, height: h } = root!.getBoundingClientRect();
    const cx = x ?? (dir > 0 ? w * 0.85 : w * 0.15);
    const cy = y ?? h * 0.5;
    const R = coverRadius(cx, cy, w, h);
    const at = ` at ${cx}px ${cy}px)`;
    next.classList.add('is-incoming');
    showCaption(to);

    const anims: Animation[] = [];
    if (reduce) {
      anims.push(next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'both' }));
    } else {
      anims.push(
        next.animate([{ clipPath: `circle(0px${at}` }, { clipPath: `circle(${R}px${at}` }], {
          duration,
          easing: EASE,
          fill: 'both',
        }),
        img.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], {
          duration: duration * 1.25,
          easing: 'cubic-bezier(.2,.7,.2,1)',
          fill: 'both',
        }),
      );
      ring.style.width = ring.style.height = `${R * 2}px`;
      const t = `translate(${cx - R}px,${cy - R}px)`;
      anims.push(
        ring.animate(
          [
            { transform: `${t} scale(0)`, opacity: 1 },
            { opacity: 1, offset: 0.7 },
            { transform: `${t} scale(1)`, opacity: 0 },
          ],
          { duration, easing: EASE, fill: 'both' },
        ),
      );
    }
    await anims[0]!.finished.catch(() => undefined);
    slides[index]!.classList.remove('is-current');
    next.classList.add('is-current');
    next.classList.remove('is-incoming');
    // a escala da foto termina depois do círculo; deixa terminar antes de soltar
    anims
      .slice(1)
      .forEach((a) => (a.playState === 'finished' ? a.cancel() : (a.onfinish = () => a.cancel())));
    anims[0]!.cancel();
    index = to;
    busy = false;
    hydrateNear();
    runFill();
  }

  // Ação da pessoa: anuncia a legenda para leitores de tela (na troca automática fica em silêncio)
  const userGo = (dir: number, x?: number, y?: number) => {
    live.setAttribute('aria-live', 'polite');
    void go(dir, x, y);
  };

  root.querySelector('[data-ap-prev]')!.addEventListener('click', () => userGo(-1));
  root.querySelector('[data-ap-next]')!.addEventListener('click', () => userGo(1));
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute(
      'aria-label',
      userPaused ? 'Retomar troca de ambientes' : 'Pausar troca de ambientes',
    );
    syncPaused();
    if (!userPaused && !fill.classList.contains('run')) runFill();
  });
  root.querySelector('.ap-ctrl')!.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
    e.preventDefault();
    userGo(k === 'ArrowRight' ? 1 : -1);
  });

  // Clique / toque / arrasto na foto
  const local = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width };
  };
  let down: { x: number; y: number } | null = null;
  root.addEventListener('pointerdown', (e) => {
    down = (e.target as Element).closest(IGNORE) ? null : { x: e.clientX, y: e.clientY };
  });
  root.addEventListener('pointerup', (e) => {
    const start = down;
    down = null;
    if (!start) return;
    const p = local(e);
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) userGo(dx < 0 ? 1 : -1, p.x, p.y);
    else if (Math.abs(dx) < 8) userGo(p.x >= p.w / 2 ? 1 : -1, p.x, p.y);
  });

  // Cursor-lente "Próximo / Anterior" (só com mouse e fora do texto e dos controles)
  root.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const over = (e.target as Element).closest(IGNORE);
    root.classList.toggle('lens-on', !over);
    if (over) return;
    const p = local(e);
    lens.style.transform = `translate(${p.x}px,${p.y}px)`;
    const label = p.x >= p.w / 2 ? 'Próximo' : 'Anterior';
    if (lens.textContent !== label) lens.textContent = label;
  });
  root.addEventListener('pointerleave', () => root.classList.remove('lens-on'));

  // Pausa o tempo quando o hero sai da tela ou a aba fica em segundo plano
  let seen = true;
  const sync = () => {
    hold = !seen || document.hidden;
    syncPaused();
  };
  new IntersectionObserver(([e]) => {
    seen = e!.isIntersecting;
    sync();
  }).observe(root);
  document.addEventListener('visibilitychange', sync);

  syncPaused();
  pauseBtn.setAttribute('aria-pressed', String(userPaused));
  runFill();
}

// Réguas do hero "encaixam" quando entram na tela
export function initFloor(): void {
  const floor = document.querySelector<HTMLElement>('.hero .floor');
  if (!floor) return;
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e!.isIntersecting) {
        floor.dataset.wait = '';
        return;
      }
      delete floor.dataset.wait;
      floor.classList.add('in');
      io.disconnect();
    },
    { threshold: 0.4 },
  );
  io.observe(floor);
}
