import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CODE = 'LP-TIMBERLAND-SPC';

async function open(page: Page, errors: string[] = []) {
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // Recusa os cookies para tirar o banner do caminho
  await page.getByRole('button', { name: 'Recusar' }).click();
  return errors;
}

const events = (page: Page) =>
  page.evaluate(() => (window.dataLayer as Record<string, unknown>[]).map((e) => e.event).filter(Boolean));

test('carrega sem erros no console, com um único h1 e sem rolagem lateral', async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

for (const width of [360, 1024, 1440]) {
  test(`sem rolagem lateral em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('acessibilidade: axe sem violações WCAG 2.2 AA', async ({ page }) => {
  await open(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.length} nó(s) — ${v.nodes[0]?.target.join(' ')}`,
  );
  expect(summary).toEqual([]);
});

test('teclado: link de pular conteúdo e CTA alcançáveis', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(['A', 'BUTTON']).toContain(focused);
});

test('WhatsApp leva código da campanha, origem, padrão e formato', async ({ page, context }) => {
  await open(page);
  await context.route('https://wa.me/**', (r) => r.abort());
  const hero = page.locator('#inicio a.js-wa');
  expect(decodeURIComponent((await hero.getAttribute('href'))!)).toContain(`Código: ${CODE} · origem: hero`);

  await page.locator('#padroes').scrollIntoViewIfNeeded();
  await page.locator('label:has(input[name="format"][value="xl"])').click();
  await page.locator('label:has(input[name="pattern"][value="002"])').click();
  const wa = page.locator('#padroes a.js-wa');
  await wa.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault(), { once: true }));
  await wa.click();
  const href = decodeURIComponent((await wa.getAttribute('href'))!);
  expect(href).toContain('https://wa.me/554291391436');
  expect(href).toContain('Padrão: 002 Classic Oak.');
  expect(href).toContain('Formato: Grande formato (XL).');
  expect(href).toContain('origem: pattern');
  expect(await events(page)).toEqual(
    expect.arrayContaining(['format_select', 'pattern_select', 'whatsapp_click']),
  );
});

test('seletor: XL mostra só os padrões disponíveis e a ficha do grande formato', async ({ page }) => {
  await open(page);
  await page.locator('label:has(input[name="format"][value="xl"])').click();
  await expect(page.locator('#padroes li:not([hidden]) input[name="pattern"]')).toHaveCount(2);
  await expect(page.locator('[data-xl-note]')).toBeVisible();
  await expect(page.locator('[data-pv-thick]')).toHaveText('6,5 mm (5,5 mm + 1 mm IXPE)');
  await page.locator('label:has(input[name="format"][value="hb"])').click();
  await expect(page.locator('#padroes li:not([hidden]) input[name="pattern"]')).toHaveCount(2);
  await expect(page.locator('[data-pv-name]')).toHaveText('HB 001 Harmony Oak');
  await expect(page.locator('[data-pv-size]')).toHaveText('71 × 14,2 cm');
  await expect(page.locator('[data-xl-note]')).toBeHidden();
});

test('formulário: erros, pré-preenchimento e envio com sucesso', async ({ page }) => {
  await open(page);
  // Seleciona um padrão e pede cotação dele
  await page.locator('label:has(input[name="pattern"][value="003"])').click();
  await page.getByRole('link', { name: 'Solicitar cotação deste padrão' }).click();

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('#e-name')).toHaveText('Informe seu nome.');
  await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');

  await page.fill('#f-name', 'Ana Souza');
  await page.fill('#f-phone', '42991234567');
  await expect(page.locator('#f-phone')).toHaveValue('(42) 99123-4567');
  await page.selectOption('#f-profile', 'arquiteto-designer');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.locator('[data-more]')).toHaveAttribute('open', '');
  await expect(page.locator('#f-pattern')).toHaveValue('003');
  await expect(page.locator('#f-format')).toHaveValue('padrao');
  await page.getByRole('button', { name: 'Solicitar cotação', exact: true }).click();
  await expect(page.locator('#e-email')).not.toBeEmpty();
  await expect(page.locator('#e-consent')).not.toBeEmpty();

  await page.fill('#f-email', 'ana@estudio.com.br');
  await page.fill('#f-city', 'Curitiba');
  await page.selectOption('#f-uf', 'PR');
  await page.check('#lead-form input[name="consent"]');
  await page.waitForTimeout(3100); // tempo mínimo anti-robô
  await page.getByRole('button', { name: 'Solicitar cotação', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pedido recebido' })).toBeVisible();
  const wa = decodeURIComponent((await page.locator('[data-success] a.js-wa').getAttribute('href'))!);
  expect(wa).toContain(`Código: ${CODE} · origem: form_success`);
  expect(await events(page)).toEqual(expect.arrayContaining(['form_start', 'form_error', 'form_submit']));
});

test('formulário: falha no envio mantém os dados e oferece WhatsApp', async ({ page }) => {
  await open(page);
  await page.locator('#cotacao').scrollIntoViewIfNeeded();
  await page.fill('#f-name', 'Ana Souza');
  await page.fill('#f-phone', '4232221100');
  await page.selectOption('#f-profile', 'consumidor');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.fill('#f-email', 'ana@email.com');
  await page.fill('#f-city', 'Ponta Grossa');
  await page.selectOption('#f-uf', 'PR');
  await page.locator('[data-more] summary').click(); // campos opcionais ficam recolhidos
  await page.fill('#f-message', 'teste [[simular-erro]]');
  await page.check('#lead-form input[name="consent"]');
  await page.waitForTimeout(3100);
  await page.getByRole('button', { name: 'Solicitar cotação', exact: true }).click();
  await expect(page.locator('[data-form-error]')).toBeVisible();
  await expect(page.locator('#f-email')).toHaveValue('ana@email.com');
  await expect(page.locator('[data-form-error] a.js-wa')).toBeVisible();
});

test('amostra: CTA abre o painel, valida padrões e endereço e envia', async ({ page }) => {
  await open(page);
  await page.locator('#amostra').scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: 'Solicite uma amostra' }).click();
  const dlg = page.locator('dialog[data-sample-dialog]');
  await expect(dlg).toBeVisible();

  await dlg.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('#sp-e-patterns')).toHaveText('Escolha pelo menos um padrão.');
  await dlg.locator('label:has(input[name="patterns"][value="003"])').click();
  await dlg.locator('label:has(input[name="patterns"][value="hb001"])').click();
  await page.selectOption('#sp-profile', 'arquiteto-designer');
  await dlg.getByRole('button', { name: 'Continuar' }).click();

  await dlg.getByRole('button', { name: 'Solicitar amostra' }).click();
  await expect(page.locator('#sp-e-cep')).not.toBeEmpty();
  await page.fill('#sp-name', 'Ana Souza');
  await page.fill('#sp-email', 'ana@estudio.com.br');
  await page.fill('#sp-phone', '42991234567');
  await page.fill('#sp-cep', '84043737');
  await expect(page.locator('#sp-cep')).toHaveValue('84043-737');
  await page.fill('#sp-street', 'Av. José Carlos Gomes');
  await page.fill('#sp-number', '100');
  await page.fill('#sp-district', 'Centro');
  await page.fill('#sp-city', 'Ponta Grossa');
  await page.selectOption('#sp-uf', 'PR');
  await dlg.locator('input[name="consent"]').check();
  await page.waitForTimeout(3100); // tempo mínimo anti-robô
  await dlg.getByRole('button', { name: 'Solicitar amostra' }).click();
  await expect(dlg.getByRole('heading', { name: 'Pedido de amostra recebido' })).toBeVisible();
  await expect(dlg.locator('[data-sp-summary]')).toContainText('Pacific Oak');
  expect(await events(page)).toEqual(expect.arrayContaining(['sample_open', 'sample_step', 'sample_submit']));
});

test('galeria: filtro e ampliação em dialog com teclado', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Comercial' }).click();
  await expect(page.locator('[data-gallery] li:not([hidden])')).toHaveCount(2);
  // Clicar na foto aberta (no visor) amplia; as dobradas só passam para o visor
  await page.locator('[data-gallery] li:not([hidden]) button[aria-current="true"]').click();
  const dlg = page.locator('dialog[data-lightbox]');
  await expect(dlg).toBeVisible();
  const first = await page.locator('[data-lb-caption]').textContent();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-lb-caption]')).not.toHaveText(first!);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  expect(await events(page)).toContain('gallery_open');
});

test('consentimento: nada de GTM antes do aceite e Consent Mode negado por padrão', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-consent-bar]')).toBeVisible();
  const consentDefault = await page.evaluate(() =>
    (window.dataLayer as unknown[]).some(
      (e) =>
        Array.isArray(Array.from(e as ArrayLike<unknown>)) &&
        (e as ArrayLike<unknown>)[0] === 'consent' &&
        (e as ArrayLike<unknown>)[1] === 'default',
    ),
  );
  expect(consentDefault).toBe(true);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('lp_timberland_utm'))).toBeNull();
});

test('SEO: title, description, canonical, OG e JSON-LD sem preço', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Timberland SPC/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{80,}/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+\.jpg$/);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld['@type']).toBe('Product');
  expect(ld.offers).toBeUndefined();
  const robots = await page.request.get('/robots.txt');
  expect(await robots.text()).toContain('sitemap-index.xml');
});
