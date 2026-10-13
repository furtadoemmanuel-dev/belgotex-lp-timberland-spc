import { chromium } from '@playwright/test';
const [url, w, js] = [process.argv[2], Number(process.argv[3]), process.argv[4]];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
