// Captura da janela visível depois de um tempo: node qa/vshot.mjs url largura y saida [espera_ms]
import { chromium } from '@playwright/test';
const [url, w, y, out, wait = '2500'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: Number(w), height: Number(w) < 768 ? 844 : 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate((yy) => window.scrollTo(0, Number(yy)), y);
await p.waitForTimeout(Number(wait));
await p.screenshot({ path: out });
await b.close();
