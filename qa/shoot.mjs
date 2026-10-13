// Capturas de página inteira em várias larguras: node qa/shoot.mjs [url] [larguras...]
import { chromium } from '@playwright/test';
const url = process.argv[2] ?? 'http://127.0.0.1:4322/';
const widths = (process.argv.slice(3).length ? process.argv.slice(3) : ['390', '1280']).map(Number);
const browser = await chromium.launch({ channel: 'chrome' });
for (const w of widths) {
  const page = await browser.newPage({
    viewport: { width: w, height: w < 768 ? 844 : 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  // força carregamento das imagens lazy
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `qa/screens/full-${w}.png`, fullPage: true });
  console.log(
    `${w}px: overflow=${overflow}px, console errors=${errors.length}${errors.length ? ' → ' + errors.join(' | ') : ''}`,
  );
  await page.close();
}
await browser.close();
