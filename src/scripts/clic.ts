// Animação do encaixe clic (Install.astro): a régua da direita vem inclinada a 30°, como na instalação
// angle-angle, encosta a quina de cima na quina da régua da esquerda (as superfícies se encontram) e, num só
// movimento contínuo, gira em torno desse ponto até deitar e travar, com um brilho no encaixe. A chegada e o
// giro se sobrepõem, então a régua nunca para no meio do caminho; acelera e freia de forma suave, sem
// rebote. Repete em ciclo enquanto o painel está na tela; tem botão de pausa. Com movimento reduzido fica
// parada, já encaixada.

const PIVOT = { x: 0, y: 4 }; // ponto de giro: a quina de cima da junta, onde as duas superfícies se encontram
const ANGLE = -30; // inclinação de entrada, graus
const RAD = (ANGLE * Math.PI) / 180;
const REACH = 130; // distância de onde a régua chega, ao longo do próprio eixo inclinado
const FROM = { x: REACH * Math.cos(RAD), y: REACH * Math.sin(RAD) };
// Linha do tempo de um ciclo (ms)
const T_PLACE = 2800; // chega e gira até travar, sem pausa entre um e outro
const T_REST = 2400; // fica encaixada
const T_LIFT = 1900; // levanta e sai
const T_GAP = 500;
const CYCLE = T_PLACE + T_REST + T_LIFT + T_GAP;

const clamp = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Estado da régua num instante do ciclo: deslocamento, ângulo e intensidade do brilho. */
function stateAt(ms: number): { dx: number; dy: number; a: number; flash: number } {
  let t = ms % CYCLE;
  if (t < T_PLACE) {
    // aproxima nos primeiros 45% do tempo; o giro começa aos 30%, antes de a chegada terminar
    const k = t / T_PLACE;
    const m = easeOut(clamp(k / 0.45));
    const r = easeInOut(clamp((k - 0.3) / 0.7));
    return { dx: lerp(FROM.x, 0, m), dy: lerp(FROM.y, 0, m), a: lerp(ANGLE, 0, r), flash: 0 };
  }
  t -= T_PLACE;
  if (t < T_REST) {
    const f = t < 220 ? easeInOut(t / 220) : Math.max(0, 1 - (t - 220) / 1100);
    return { dx: 0, dy: 0, a: 0, flash: f };
  }
  t -= T_REST;
  if (t < T_LIFT) {
    // o mesmo caminho ao contrário: levanta girando e, já no meio do giro, começa a deslizar para fora
    const k = t / T_LIFT;
    const r = easeInOut(clamp(k / 0.65));
    const m = easeIn(clamp((k - 0.45) / 0.55));
    return { dx: lerp(0, FROM.x, m), dy: lerp(0, FROM.y, m), a: lerp(0, ANGLE, r), flash: 0 };
  }
  return { dx: FROM.x, dy: FROM.y, a: ANGLE, flash: 0 };
}

export function initClic(): void {
  const root = document.querySelector<HTMLElement>('[data-clic]');
  if (!root) return;
  const plank = root.querySelector<SVGGElement>('[data-clic-r]')!;
  const flash = root.querySelector<SVGCircleElement>('[data-clic-flash]')!;
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-clic-pause]')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const apply = (s: ReturnType<typeof stateAt>) => {
    plank.setAttribute(
      'transform',
      `translate(${s.dx.toFixed(2)} ${s.dy.toFixed(2)}) translate(${PIVOT.x} ${PIVOT.y}) rotate(${s.a.toFixed(3)}) translate(${-PIVOT.x} ${-PIVOT.y})`,
    );
    flash.setAttribute('opacity', s.flash.toFixed(3));
  };

  if (reduce) {
    root.dataset.static = '';
    apply({ dx: 0, dy: 0, a: 0, flash: 0 });
    return;
  }

  let visible = false;
  let paused = false;
  let raf = 0;
  let elapsed = 0; // tempo de ciclo acumulado (para a pausa continuar de onde parou)
  let last = 0;
  apply(stateAt(0));

  const tick = (now: number) => {
    elapsed += now - last;
    last = now;
    apply(stateAt(elapsed));
    raf = requestAnimationFrame(tick);
  };
  const sync = () => {
    const run = visible && !paused && !document.hidden;
    cancelAnimationFrame(raf);
    if (run) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  new IntersectionObserver(([e]) => {
    visible = e!.isIntersecting;
    sync();
  }).observe(root);
  document.addEventListener('visibilitychange', sync);

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.querySelector<HTMLElement>('[data-label-pause]')!.hidden = paused;
    pauseBtn.querySelector<HTMLElement>('[data-label-play]')!.hidden = !paused;
    sync();
  });
}
