import { createLeadProvider, submitLead, type LeadPayload } from '../lib/lead';
import { isValidEmail, isValidPhoneBR, maskPhoneBR } from '../lib/validation';
import { getUtms } from './utm';
import { track } from './analytics';

const MIN_FILL_MS = 3000;

type Rule = (form: HTMLFormElement) => string;

const field = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;

const rules: Record<string, Rule> = {
  name: (f) => (field(f, 'name').value.trim().length >= 2 ? '' : 'Informe seu nome.'),
  phone: (f) =>
    isValidPhoneBR(field(f, 'phone').value)
      ? ''
      : 'Informe um telefone com DDD, por exemplo (42) 99999-0000.',
  profile: (f) => (field(f, 'profile').value ? '' : 'Selecione o seu perfil.'),
  email: (f) =>
    isValidEmail(field(f, 'email').value) ? '' : 'Informe um e-mail válido, por exemplo nome@empresa.com.br.',
  city: (f) => (field(f, 'city').value.trim().length >= 2 ? '' : 'Informe a cidade.'),
  uf: (f) => (field(f, 'uf').value ? '' : 'Selecione a UF.'),
  consent: (f) =>
    (f.elements.namedItem('consent') as HTMLInputElement).checked
      ? ''
      : 'Para enviar, é preciso concordar com o uso dos dados.',
};

const STEP_FIELDS: Record<number, string[]> = {
  1: ['name', 'phone', 'profile'],
  2: ['email', 'city', 'uf', 'consent'],
};

let lastOrigin = 'direct';

export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead-form]');
  if (!form) return;
  const provider = createLeadProvider(form.dataset.endpoint ?? '');
  const startedAt = Date.now();
  let started = false;
  let step = 1;

  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
  const label = form.querySelector<HTMLElement>('[data-step-label]')!;
  const progress2 = form.querySelector<HTMLElement>('[data-progress-2]')!;
  const errorBox = form.querySelector<HTMLElement>('[data-form-error]')!;
  const success = form.querySelector<HTMLElement>('[data-success]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]')!;

  // Origem do clique que trouxe a pessoa ao formulário
  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('a[href="#cotacao"][data-loc]');
    if (!el) return;
    lastOrigin = el.dataset.loc!;
  });

  // Pré-preenchimento a partir do seletor: abre "Detalhes do projeto" e resume a escolha no título
  const more = form.querySelector<HTMLDetailsElement>('[data-more]');
  const moreHint = form.querySelector<HTMLElement>('[data-more-hint]');
  document.addEventListener('selection:change', (e) => {
    const d = (e as CustomEvent).detail as { pattern: string; format: string };
    const pattern = field(form, 'pattern') as HTMLSelectElement;
    const format = field(form, 'format') as HTMLSelectElement;
    pattern.value = d.pattern;
    format.value = d.format;
    const picked = [pattern, format].filter((s) => s.value).map((s) => s.selectedOptions[0]!.text.trim());
    if (moreHint) moreHint.textContent = picked.join(' · ');
    if (more && picked.length) more.open = true;
  });

  form.addEventListener('focusin', () => {
    if (!started) {
      started = true;
      track('form_start', { step: 1 });
    }
  });

  const phone = field(form, 'phone') as HTMLInputElement;
  phone.addEventListener('input', () => (phone.value = maskPhoneBR(phone.value)));

  const setError = (name: string, msg: string) => {
    const out = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (out) out.textContent = msg;
    const t = form.elements.namedItem(name) as HTMLElement;
    if (msg) t.setAttribute('aria-invalid', 'true');
    else t.removeAttribute('aria-invalid');
  };

  const validate = (names: string[]): boolean => {
    let first: string | null = null;
    for (const n of names) {
      const msg = rules[n]!(form);
      setError(n, msg);
      if (msg) {
        track('form_error', { field: n });
        first ??= n;
      }
    }
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return false;
    }
    return true;
  };

  // Revalida enquanto a pessoa corrige o campo (e não no blur): assim a mensagem some antes do clique
  // no botão, sem deslocar o layout no meio do clique.
  const revalidate = (e: Event) => {
    const n = (e.target as HTMLInputElement).name;
    if (rules[n] && form.querySelector(`[data-error-for="${n}"]`)?.textContent) setError(n, rules[n]!(form));
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  const goTo = (n: number) => {
    step = n;
    steps.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
    progress2.classList.toggle('on', n === 2);
    label.textContent = `Etapa ${n} de 2`;
  };

  form.querySelector('[data-next]')!.addEventListener('click', () => {
    if (!validate(STEP_FIELDS[1]!)) return;
    goTo(2);
    track('form_step', { step: 2 });
    field(form, 'email').focus();
  });
  form.querySelector('[data-back]')!.addEventListener('click', () => {
    goTo(1);
    field(form, 'name').focus();
  });

  // Enter na etapa 1 avança em vez de enviar
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && step === 1 && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      form.querySelector<HTMLButtonElement>('[data-next]')!.click();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (step === 1) return;
    errorBox.hidden = true;
    if (!validate(STEP_FIELDS[2]!)) return;
    // Proteção: honeypot e tempo mínimo de preenchimento (falha silenciosa para robôs)
    if ((field(form, 'website') as HTMLInputElement).value || Date.now() - startedAt < MIN_FILL_MS) {
      showSuccess();
      return;
    }
    // Amostra tem formulário próprio (sample.ts); aqui o pedido é sempre de cotação
    const needs = ['cotacao'];
    const payload: LeadPayload = {
      name: field(form, 'name').value.trim(),
      phone: field(form, 'phone').value.trim(),
      email: field(form, 'email').value.trim(),
      city: field(form, 'city').value.trim(),
      uf: field(form, 'uf').value,
      profile: field(form, 'profile').value,
      needs,
      pattern: field(form, 'pattern').value,
      format: field(form, 'format').value,
      area: field(form, 'area').value,
      message: field(form, 'message').value.trim(),
      consent: true,
      consent_text: form.dataset.consentText ?? '',
      campaign_code: form.dataset.campaign ?? '',
      click_origin: lastOrigin,
      page_url: location.href.split('#')[0]!,
      ...getUtms(),
      submitted_at: new Date().toISOString(),
    };
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;
    try {
      await submitLead(payload, provider);
      track('form_submit', {
        perfil: payload.profile,
        needs: needs.join(','),
        pattern: payload.pattern,
        format: payload.format,
      });
      showSuccess();
    } catch {
      track('form_error', { field: 'submit' });
      errorBox.hidden = false;
      errorBox.focus?.();
    } finally {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
    }
  });

  function showSuccess(): void {
    steps.forEach((s) => (s.hidden = true));
    form!.querySelector('.progress')!.setAttribute('hidden', '');
    label.textContent = 'Solicitação enviada';
    success.hidden = false;
    success.focus();
  }
}
