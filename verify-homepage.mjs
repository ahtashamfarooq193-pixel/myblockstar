import { chromium } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const originalSource = fs.readFileSync('../homepage-reference.html', 'utf8');
page.on('pageerror', (error) => errors.push(error.message));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1800);
const copyDifferences = await page.evaluate((source) => {
  const original = new DOMParser().parseFromString(source, 'text/html');
  const normalize = (value) => value.replace(/\s+/g, '');
  const differences = [];

  for (const section of original.querySelectorAll('main section')) {
    const current = section.id
      ? document.getElementById(section.id)
      : document.querySelector('section.bs-5755df1');
    const selector = 'h1, h2, h3, p, a, label, button[type="submit"]';
    const before = [...section.querySelectorAll(selector)].map((element) => normalize(element.textContent));
    const after = [...current.querySelectorAll(selector)].map((element) => normalize(element.textContent));
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      differences.push(section.id || 'closing');
    }
  }

  return differences;
}, originalSource);
await page.screenshot({ path: 'screenshots/desktop-hero.png' });

const sectionIds = await page.locator('main section').evaluateAll((elements) => {
  return elements.map((element) => element.id).filter(Boolean);
});

for (const section of await page.locator('main section').all()) {
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
}

await page.screenshot({ path: 'screenshots/desktop-full.png', fullPage: true });
await page.locator('.brand').click();
await page.waitForTimeout(1000);
const logoScroll = await page.evaluate(() => window.scrollY);
await page.locator('.primary-navigation a[href="#token"]').click();
await page.waitForTimeout(1000);
const tokenScroll = await page.locator('#token').evaluate((element) => element.getBoundingClientRect().top);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const reloadScroll = await page.evaluate(() => window.scrollY);

const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
await page.locator('img').evaluateAll((images) => {
  images.forEach((image) => { image.loading = 'eager'; });
});
await page.waitForFunction(() => [...document.images].every((image) => image.complete));
const brokenImages = await page.locator('img').evaluateAll((images) => {
  return images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src);
});

await page.locator('#invest').scrollIntoViewIfNeeded();
await page.locator('#inv-name').fill('Preview Check');
await page.locator('#inv-email').fill('preview@example.com');
await page.locator('#inv-acc').check();
await page.locator('button[type="submit"]').click();
const formPreview = await page.getByRole('status').isVisible();

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
await page.screenshot({ path: 'screenshots/mobile-hero.png' });
await page.getByRole('button', { name: 'Open menu', exact: true }).click();
const mobileMenu = await page.locator('#primary-navigation').isVisible();
await page.locator('.primary-navigation a[href="#portfolio"]').click();
await page.waitForTimeout(900);
const mobileMenuClosed = await page.getByRole('button', { name: 'Open menu', exact: true }).getAttribute('aria-expanded') === 'false';
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);

for (const section of await page.locator('main section').all()) {
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
}

await page.screenshot({ path: 'screenshots/mobile-full.png', fullPage: true });
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.reload({ waitUntil: 'networkidle' });
const reducedMotionHidden = await page.locator('.reveal:not(.is-visible)').count();

const result = {
  copyDifferences,
  sectionIds,
  errors,
  brokenImages,
  desktopOverflow,
  mobileOverflow,
  logoReturnsToTop: logoScroll < 10,
  navigationReachesToken: Math.abs(tokenScroll - 30) < 10,
  reloadReturnsToTop: reloadScroll === 0,
  formPreview,
  mobileMenu,
  mobileMenuClosed,
  reducedMotionHidden,
};

fs.writeFileSync('screenshots/verification.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();

if (
  copyDifferences.length || errors.length || brokenImages.length || desktopOverflow || mobileOverflow ||
  !result.logoReturnsToTop || !result.navigationReachesToken ||
  !result.reloadReturnsToTop || !formPreview || !mobileMenu || !mobileMenuClosed || reducedMotionHidden
) {
  process.exitCode = 1;
}
