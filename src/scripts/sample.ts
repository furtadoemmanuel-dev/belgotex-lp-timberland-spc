// Pedido de amostra pelo correio (Sample.astro): painel lateral em 2 etapas (padrões → contato e endereço).
// Qualquer link/botão com data-sample-open abre o painel; data-sample-from-selector pré-marca o padrão do seletor.
import { createLeadProvider, submitLead, type SampleLeadPayload } from '../lib/lead';
import { isValidCEP, isValidEmail, isValidPhoneBR, maskCEP, maskPhoneBR } from '../lib/validation';
import { getSelection } from './state';
import { getUtms } from './utm';
import { track } from './analytics';

const MIN_FILL_MS = 3000;

type Rule = (f: HTMLFormElement) => string;
const val = (f: HTMLFormElement, n: string) =>
  ((f.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '').trim();
const checkedPatterns = (f: HTMLFormElement) =>
  [...f.querySelectorAll<HTMLInputElement>('input[name="patterns"]:checked')].map((i) => i.value);

const rules: Record<string, Rule> = {
  patterns: (f) => (checkedPatterns(f).length ? '' : 'Escolha pelo menos um padrão.'),
  profile: (f) => (val(f, 'profile') ? '' : 'Selecione o seu perfil.'),
  name: (f) => (val(f, 'name').length >= 3 ? '' : 'Informe o nome completo de quem vai receber.'),
  email: (f) =>
    isValidEmail(val(f, 'email')) ? '' : 'Informe um e-mail válido, por exemplo nome@empresa.com.br.',
  phone: (f) =>
    isValidPhoneBR(val(f, 'phone')) ? '' : 'Informe um telefone com DDD, por exemplo (42) 99999-0000.',
  cep: (f) => (isValidCEP(val(f, 'cep')) ? '' : 'Informe o CEP com 8 números.'),
  street: (f) => (val(f, 'street').length >= 3 ? '' : 'Informe a rua ou avenida.'),
  number: (f) => (val(f, 'number') ? '' : 'Informe o número (ou "s/n").'),
  district: (f) => (val(f, 'district').length >= 2 ? '' : 'Informe o bairro.'),
  city: (f) => (val(f, 'city').length >= 2 ? '' : 'Informe a cidade.'),
  uf: (f) => (val(f, 'uf') ? '' : 'Selecione a UF.'),
  consent: (f) =>
    (f.elements.namedItem('consent') as HTMLInputElement).checked
      ? ''
      : 'Para enviar, é preciso concordar com o uso dos dados.',
};
const STEP: Record<number, string[]> = {
  1: ['patterns', 'profile'],
  2: ['name', 'email', 'phone', 'cep', 'street', 'number', 'district', 'city', 'uf', 'consent'],
};

export function initSample(): void {
  const dlg = document.querySelector<HTMLDialogElement>('[data-sample-dialog]');
  const form = document.querySelector<HTMLFormElement>('[data-sample-form]');
  if (!dlg || !form) return;
  const provider = createLeadProvider(form.dataset.endpoint ?? '');
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('[data-sp-step]')];
  const label = form.querySelector<HTMLElement>('[data-sp-step-label]')!;
  const progress = form.querySelector<HTMLElement>('[data-sp-progress]')!;
  const progress2 = form.querySelector<HTMLElement>('[data-sp-progress-2]')!;
  const errorBox = form.querySelector<HTMLElement>('[data-sp-error]')!;
  const success = form.querySelector<HTMLElement>('[data-sp-success]')!;
  const summary = form.querySelector<HTMLElement>('[data-sp-summary]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-sp-submit]')!;
  let step = 1;
  let openedAt = 0;
  let origin = 'direct';
  let opener: HTMLElement | null = null;
  let started = false;

  const setError = (name: string, msg: string) => {
    const out = form.querySelector<HTMLElement>(`[data-sp-error-for="${name}"]`);
    if (out) out.textContent = msg;
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLElement && name !== 'patterns') {
      if (msg) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    }
  };
  const validate = (names: string[]): boolean => {
    let first: string | null = null;
    for (const n of names) {
      const msg = rules[n]!(form);
      setError(n, msg);
      if (msg) {
        track('sample_error', { field: n });
        first ??= n;
      }
    }
    if (!first) return true;
    const el =
      first === 'patterns'
        ? form.querySelector<HTMLElement>('input[name="patterns"]')
        : (form.elements.namedItem(first) as HTMLElement);
    el?.focus();
    return false;
  };
  // revalida enquanto a pessoa corrige
  const revalidate = (e: Event) => {
    const n = (e.target as HTMLInputElement).name;
    if (rules[n] && form.querySelector(`[data-sp-error-for="${n}"]`)?.textContent)
      setError(n, rules[n]!(form));
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  const phone = form.elements.namedItem('phone') as HTMLInputElement;
  phone.addEventListener('input', () => (phone.value = maskPhoneBR(phone.value)));
  const cep = form.elements.namedItem('cep') as HTMLInputElement;
  cep.addEventListener('input', () => (cep.value = maskCEP(cep.value)));

  const goTo = (n: number) => {
    step = n;
    steps.forEach((s) => (s.hidden = Number(s.dataset.spStep) !== n));
    progress2.classList.toggle('on', n === 2);
    label.textContent = n === 1 ? 'Etapa 1 de 2 · Padrões' : 'Etapa 2 de 2 · Entrega pelo correio';
  };

  // Abrir: qualquer [data-sample-open] da página
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-sample-open]');
    if (!el) return;
    e.preventDefault();
    opener = el;
    origin = el.dataset.loc ?? 'direct';
    // pré-marca o padrão do seletor (botão dentro do seletor) ou o que a pessoa já escolheu nele
    const fromSelector = 'sampleFromSelector' in el.dataset;
    const pre = fromSelector
      ? (document.querySelector<HTMLInputElement>('#padroes input[name="pattern"]:checked')?.value ?? '')
      : getSelection().chosen
        ? getSelection().pattern
        : '';
    if (pre && success.hidden) {
      const box = form.querySelector<HTMLInputElement>(`input[name="patterns"][value="${pre}"]`);
      if (box) box.checked = true;
    }
    openedAt = Date.now();
    dlg.showModal();
    track('sample_open', { origin });
  });
  const close = () => dlg.close();
  form.querySelector('[data-sample-close]')!.addEventListener('click', close);
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });
  dlg.addEventListener('close', () => opener?.focus());

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    track('sample_start', { origin });
  });

  form.querySelector('[data-sp-next]')!.addEventListener('click', () => {
    if (!validate(STEP[1]!)) return;
    goTo(2);
    track('sample_step', { step: 2, patterns: checkedPatterns(form).join(',') });
    (form.elements.namedItem('name') as HTMLInputElement).focus();
  });
  form.querySelector('[data-sp-back]')!.addEventListener('click', () => {
    goTo(1);
    form.querySelector<HTMLElement>('input[name="patterns"]')?.focus();
  });
  // Enter na etapa 1 avança em vez de enviar
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && step === 1 && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      form.querySelector<HTMLButtonElement>('[data-sp-next]')!.click();
    }
  });

  const patternName = (id: string) =>
    form
      .querySelector(`input[name="patterns"][value="${id}"] ~ .sp-sw-name`)
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? id;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (step === 1) return;
    errorBox.hidden = true;
    if (!validate(STEP[2]!)) return;
    const patterns = checkedPatterns(form);
    const done = () => {
      steps.forEach((s) => (s.hidden = true));
      progress.hidden = true;
      label.textContent = 'Pedido enviado';
      summary.textContent = patterns.map(patternName).join(', ');
      success.hidden = false;
      success.focus();
    };
    // Proteção: honeypot e tempo mínimo de preenchimento (falha silenciosa para robôs)
    if (val(form, 'website') || Date.now() - openedAt < MIN_FILL_MS) return done();
    const payload: SampleLeadPayload = {
      lead_type: 'amostra',
      name: val(form, 'name'),
      phone: val(form, 'phone'),
      email: val(form, 'email'),
      profile: val(form, 'profile'),
      patterns,
      cep: val(form, 'cep'),
      street: val(form, 'street'),
      number: val(form, 'number'),
      complement: val(form, 'complement'),
      district: val(form, 'district'),
      city: val(form, 'city'),
      uf: val(form, 'uf'),
      consent: true,
      consent_text: form.dataset.consentText ?? '',
      campaign_code: form.dataset.campaign ?? '',
      click_origin: origin,
      page_url: location.href.split('#')[0]!,
      ...getUtms(),
      submitted_at: new Date().toISOString(),
    };
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;
    try {
      await submitLead(payload, provider);
      track('sample_submit', { perfil: payload.profile, patterns: patterns.join(','), uf: payload.uf });
      done();
    } catch {
      track('sample_error', { field: 'submit' });
      errorBox.hidden = false;
    } finally {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
    }
  });

  // Leque de amostras do CTA abre quando a faixa entra na tela
  const fan = document.querySelector<HTMLElement>('.sc-fan');
  if (fan) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e!.isIntersecting) {
          fan.dataset.wait = '';
          return;
        }
        delete fan.dataset.wait;
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(fan);
  }
}
