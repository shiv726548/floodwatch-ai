import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import bundledChromium from '@sparticuz/chromium';

const output = new URL('./screenshots/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  args: bundledChromium.args,
  executablePath: await bundledChromium.executablePath(),
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

async function capture(name) {
  await page.screenshot({ path: new URL(`${name}.png`, output).pathname, animations: 'disabled', timeout: 0, waitForFonts: false });
}

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await page.getByRole('heading', { name: 'Operations overview' }).waitFor();
await capture('dashboard-dark');
await page.locator('.sidebar nav a[href="/map"]').click();
await page.getByRole('heading', { name: 'Interactive map' }).waitFor();
await capture('map-dark');
await page.locator('.sidebar nav a[href="/"]').click();
await page.getByRole('button', { name: /River Road water rise/ }).click();
await page.getByRole('heading', { name: /River Road water rise/ }).waitFor();
await capture('incident-panel-dark');
await page.getByRole('button', { name: 'Close incident details' }).click();
await page.locator('.sidebar nav a[href="/healthcare"]').click();
await page.getByRole('heading', { name: 'Request coordination' }).waitFor();
await capture('healthcare-dark');
await page.getByRole('button', { name: 'Switch to light theme' }).click();
await capture('healthcare-light');
await page.locator('.sidebar nav a[href="/"]').click();
await capture('dashboard-light');
await page.locator('.sidebar nav a[href="/map"]').click();
await capture('map-light');
await page.locator('.sidebar nav a[href="/"]').click();
await page.getByRole('button', { name: /River Road water rise/ }).click();
await capture('incident-panel-light');

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await mobile.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await mobile.getByRole('heading', { name: 'Operations overview' }).waitFor();
await mobile.screenshot({ path: new URL('dashboard-mobile.png', output).pathname, animations: 'disabled', timeout: 0, waitForFonts: false });
await mobile.locator('.bottom-nav a[href="/healthcare"]').click();
await mobile.getByRole('heading', { name: 'Request coordination' }).waitFor();
await mobile.screenshot({ path: new URL('healthcare-mobile.png', output).pathname, animations: 'disabled', timeout: 0, waitForFonts: false });

console.log(JSON.stringify({ screenshots: 10, pageErrors: errors }, null, 2));
await browser.close();