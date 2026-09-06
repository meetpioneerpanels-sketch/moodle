// Smoke test for the student PWA, running in demo mode at phone width.
// Start it first:  cd student && npm run build && npm run preview -- --port 4174
// The PWA checks (service worker, manifest, offline start) need the *built*
// app - a dev server does not serve sw.js the same way.
import { devices } from 'playwright';
import { collectErrors, launch, report, step } from './lib.mjs';

const BASE = process.env.STUDENT_URL ?? 'http://localhost:4174';

const browser = await launch();
const context = await browser.newContext({ ...devices['Pixel 5'] });
const page = await context.newPage();
const errors = [];
collectErrors(page, errors);

await page.goto(BASE, { waitUntil: 'domcontentloaded' });

await step('login screen renders at phone width', async () => {
  await page.getByRole('heading', { name: 'Log in' }).waitFor();
});

await step('log in (demo mode accepts any credentials)', async () => {
  await page.getByLabel('Email').fill('liam@school.edu');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByText(/^Hi /).first().waitFor();
});

await step('home shows continue-learning and the course rail', async () => {
  await page.getByText('Continue learning').waitFor();
  await page.getByText('All courses').waitFor();
});

await step('published courses are listed', async () => {
  const text = await page.locator('body').innerText();
  if (!text.includes('Algebra Foundations')) throw new Error('published course is missing');
});

await step('browse filters by search and category', async () => {
  await page.getByRole('button', { name: 'Browse' }).click();
  await page.getByRole('heading', { name: 'Browse' }).waitFor();
  await page.getByLabel('Search courses').fill('living');
  await page.getByText('Living Systems').waitFor();
  await page.getByLabel('Search courses').fill('');
  await page.getByRole('button', { name: 'Science', exact: true }).click();
  await page.getByText('Living Systems').waitFor();
  await page.getByRole('button', { name: 'All', exact: true }).click();
});

await step('a course opens with its lesson list and progress', async () => {
  await page.getByText('Algebra Foundations').first().click();
  await page.getByText('0 of 3 lessons').waitFor();
});

await step('the lesson player renders the lesson', async () => {
  await page.getByText('What a variable really is').click();
  await page.getByRole('heading', { name: 'What a variable really is' }).waitFor();
  await page.getByText('8 min read').waitFor();
});

await step('marking complete records progress', async () => {
  await page.getByRole('button', { name: 'Mark as complete' }).click();
  await page.getByText('Lesson complete - nice work!').waitFor();
  await page.getByText('Completed').waitFor();
});

await step('next lesson advances within the course', async () => {
  await page.getByRole('button', { name: 'Next lesson' }).click();
  await page.getByRole('heading', { name: 'Balancing equations' }).waitFor();
});

await step('the Android back button returns to the course', async () => {
  await page.goBack();
  await page.getByText('1 of 3 lessons').waitFor();
});

await step('profile shows stats and started courses', async () => {
  await page.goBack();
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.getByText('Completed').first().waitFor();
  await page.getByText('My courses').waitFor();
});

await step('the service worker precaches the app shell', async () => {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 15000,
  });
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const shell = keys.find((key) => key.includes('shell'));
    if (!shell) return null;
    const cache = await caches.open(shell);
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  if (!cached?.includes('/index.html')) {
    throw new Error(`app shell not precached: ${JSON.stringify(cached)}`);
  }
  if (!cached.some((path) => path.endsWith('.js'))) {
    throw new Error('the JS bundle was not precached - offline start would be blank');
  }
});

await step('the manifest is linked and APK-ready', async () => {
  const href = await page.getAttribute('link[rel=manifest]', 'href');
  const manifest = await (await page.request.get(`${BASE}${href}`)).json();
  for (const key of ['name', 'short_name', 'display', 'theme_color', 'background_color', 'icons']) {
    if (!manifest[key]) throw new Error(`manifest is missing "${key}"`);
  }
  if (manifest.display !== 'standalone') throw new Error('display must be "standalone"');
  const sizes = manifest.icons.map((icon) => icon.sizes);
  if (!sizes.includes('192x192') || !sizes.includes('512x512')) {
    throw new Error(`manifest icons missing a required size: ${sizes.join(', ')}`);
  }
});

await step('the app still boots offline', async () => {
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const text = await page.locator('body').innerText();
  if (!/Log in|Hi /.test(text)) throw new Error('the cached shell did not render offline');
  await context.setOffline(false);
});

report(errors);
await browser.close();
