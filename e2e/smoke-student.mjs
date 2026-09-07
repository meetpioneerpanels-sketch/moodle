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
  await page.getByLabel('Email').fill('ahmed.khan@school.edu');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
});

await step('onboarding asks for the exam and universities', async () => {
  await page.getByRole('heading', { name: 'Choose your Courses' }).waitFor();
  // Next stays disabled until at least one university is picked.
  const next = page.getByRole('button', { name: 'Next' });
  if (await next.isEnabled()) throw new Error('Next should be disabled with no university chosen');
  await page.getByRole('button', { name: 'FAST' }).click();
  await page.getByRole('button', { name: 'KU' }).click();
  await next.click();
});

await step('onboarding asks for a package', async () => {
  await page.getByRole('heading', { name: 'Select Package' }).waitFor();
  const next = page.getByRole('button', { name: 'Next' });
  if (await next.isEnabled()) throw new Error('Next should be disabled with no package chosen');
  await page.getByRole('button', { name: 'Select' }).nth(1).click();
  await page.getByRole('button', { name: 'Selected' }).waitFor();
  await next.click();
});

await step('home shows the quick actions and action rows', async () => {
  await page.getByText(/^Hi /).first().waitFor();
  for (const label of ['Live Classes', 'Recorded Course', 'Practice Zone', 'Share with Friends']) {
    await page.getByText(label, { exact: true }).first().waitFor();
  }
});

await step('practice zone lists tests, locked and unlocked', async () => {
  await page.getByText('Practice Zone', { exact: true }).first().click();
  await page.getByRole('heading', { name: 'Practice Zone' }).waitFor();
  await page.getByText('Topical Test - 01').first().waitFor();
  if ((await page.getByText('Locked').count()) === 0) throw new Error('no locked tests shown');
  // Subject and chapter switching both re-filter the list.
  await page.getByRole('button', { name: 'Physics', exact: true }).click();
  await page.getByText('Topical Test - 01').first().waitFor();
  await page.getByRole('button', { name: 'Ch 2', exact: true }).click();
  await page.getByText('Locked').first().waitFor();
  await page.getByRole('button', { name: 'Ch 1', exact: true }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
});

let questionCount = 0;

await step('the test player runs a timed question', async () => {
  await page.getByText('Topical Test - 01').first().click();
  await page.getByText('Time', { exact: true }).waitFor();
  await page.getByText(/^\d+ sec$/).waitFor();
  await page.getByText('Progress').waitFor();
  const counter = await page.getByText(/^\d+\/\d+$/).first().innerText();
  questionCount = Number(counter.split('/')[1]);
  if (!questionCount) throw new Error(`could not read the question count from "${counter}"`);
});

await step('answering reveals the correct option and the solution', async () => {
  await page.locator('ul li button').first().click();
  await page.getByText('Solution').waitFor();
  await page.getByText('Difficulty Level').waitFor();
  // Exactly one option is marked correct.
  const correct = await page.locator('button.border-success').count();
  if (correct !== 1) throw new Error(`expected 1 correct option, found ${correct}`);
});

await step('finishing every question produces a score report', async () => {
  for (let index = 0; index < questionCount + 2; index++) {
    const next = page.getByRole('button', { name: /Next question|Finish test/ });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
    } else if (await page.getByRole('heading', { name: 'Score and Stats' }).isVisible().catch(() => false)) {
      break;
    }
    const options = page.locator('ul li button');
    if (await options.first().isVisible().catch(() => false)) {
      await options.first().click();
    }
  }
  await page.getByRole('heading', { name: 'Score and Stats' }).waitFor({ timeout: 20000 });
});

await step('the report shows score, accuracy and both charts', async () => {
  await page.getByText('Correct').first().waitFor();
  await page.getByText('Incorrect').first().waitFor();
  await page.getByText('Accuracy').waitFor();
  await page.getByText('Performance Analysis by Question Difficulty').waitFor();
  await page.getByText('Time Taken for Each Question').waitFor();
});

await step('solutions expand on demand', async () => {
  await page.getByRole('button', { name: 'View solutions' }).click();
  await page.getByRole('heading', { name: 'Solutions' }).waitFor();
  await page.getByRole('button', { name: 'Hide solutions' }).click();
});

await step('the attempt lands in analytics beside the seeded history', async () => {
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('heading', { name: 'Analytics' }).waitFor();
  await page.getByText('All Subjects').waitFor();
  await page.getByText('Questions Correct').waitFor();
  await page.getByText('Tests Attempted').waitFor();
  await page.getByText('Topical Test - 01').first().waitFor();

  // The seeded attempts must produce a real per-subject reading, not 0%.
  const percentages = await page.locator('p.tabular-nums').allInnerTexts();
  const nonZero = percentages.filter((value) => /^[1-9]\d?%$|^100%$/.test(value.trim()));
  if (nonZero.length === 0) {
    throw new Error(`expected seeded history to give non-zero subject accuracy, saw ${percentages.join(', ')}`);
  }

  // Attempts are counted, not just the one just taken.
  const attempted = await page.getByText(/^\d+\/20$/).first().innerText();
  if (Number(attempted.split('/')[0]) < 2) {
    throw new Error(`expected several attempts in the history, saw ${attempted}`);
  }
});

await step('progress tab lists course completion', async () => {
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await page.getByText('Algebra Foundations').first().waitFor();
  await page.getByRole('button', { name: 'Performance', exact: true }).click();
});

await step('asking a doubt records it', async () => {
  await page.getByRole('button', { name: 'Ask your Doubt' }).click();
  await page.getByRole('heading', { name: 'Ask your Doubt' }).waitFor();
  await page.getByLabel('Your question').fill('I do not follow the step where 72 - 8n becomes zero.');
  await page.getByRole('button', { name: 'Send to a teacher' }).click();
  await page.getByText('Sent - a teacher will reply shortly').waitFor();
  // The seeded history already contains an open doubt, so scope to the newest.
  await page.getByText('Waiting').first().waitFor();
  await page.getByText('I do not follow the step where 72').waitFor();
});

await step('live classes list what is included', async () => {
  await page.goBack();
  await page.getByRole('button', { name: 'Home' }).click();
  await page.getByText('Live Classes', { exact: true }).first().click();
  await page.getByRole('heading', { name: 'Live Classes' }).waitFor();
  await page.getByText('What is Included?').first().waitFor();
  await page.getByText('NUST Live Course').waitFor();
  await page.getByRole('button', { name: 'Register now' }).first().click();
  await page.getByText(/Registered for/).waitFor();
});

await step('the course library still reads lessons', async () => {
  await page.goBack();
  await page.getByRole('button', { name: 'Courses' }).click();
  await page.getByText('Algebra Foundations').first().click();
  await page.getByText('0 of 3 lessons').waitFor();
  await page.getByText('What a variable really is').click();
  await page.getByRole('heading', { name: 'What a variable really is' }).waitFor();
  await page.getByRole('button', { name: 'Mark as complete' }).click();
  await page.getByText('Lesson complete - nice work!').waitFor();
});

await step('the menu shows the onboarding choices', async () => {
  await page.goBack();
  await page.goBack();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByText('Exam & universities').waitFor();
  await page.getByText('FAST, KU').waitFor();
  await page.getByText('Package').first().waitFor();
  await page.getByText(/Advanced/).first().waitFor();
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

await step('a teacher account is sent to the console, not student onboarding', async () => {
  const staff = await context.newPage();
  await staff.goto(BASE, { waitUntil: 'domcontentloaded' });
  await staff.getByLabel('Email').fill('teacher.demo@school.edu');
  await staff.getByLabel('Password').fill('password123');
  await staff.getByRole('button', { name: 'Create an account' }).click();
  await staff.getByLabel('Your name').fill('Bilal Ahmed');
  await staff.getByLabel('Email').fill('teacher.demo@school.edu');
  await staff.getByLabel('Password').fill('password123');
  await staff.getByRole('button', { name: 'teacher', exact: true }).click();
  await staff.getByRole('button', { name: 'Sign up' }).click();

  await staff.getByRole('heading', { name: 'This app is the student experience' }).waitFor();
  if (await staff.getByRole('heading', { name: 'Choose your Courses' }).isVisible().catch(() => false)) {
    throw new Error('a teacher should not be pushed through student onboarding');
  }
  // They can still look around deliberately.
  await staff.getByRole('button', { name: 'Preview the student app' }).click();
  await staff.getByRole('heading', { name: 'Choose your Courses' }).waitFor();
  await staff.close();
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
