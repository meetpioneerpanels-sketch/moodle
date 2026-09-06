// Smoke test for the teacher & admin console, running in demo mode.
// Start it first:  cd console && npm run build && npm run preview -- --port 4173
import { collectErrors, launch, report, step } from './lib.mjs';

const BASE = process.env.CONSOLE_URL ?? 'http://localhost:4173';

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
collectErrors(page, errors);

await page.goto(BASE, { waitUntil: 'domcontentloaded' });

await step('login screen renders', async () => {
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
});

await step('sign in (demo mode accepts any credentials)', async () => {
  await page.getByLabel('Email').fill('head@school.edu');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: /^Hi / }).waitFor();
});

await step('dashboard shows live stats and recent courses', async () => {
  await page.getByText('My courses').waitFor();
  await page.getByText('Algebra Foundations').first().waitFor();
});

await step('create a course', async () => {
  await page.getByRole('button', { name: 'New course' }).first().click();
  await page.getByLabel('Title').fill('Test Course From Smoke');
  await page.getByLabel('Description').fill('Created by the smoke test.');
  await page.getByRole('button', { name: 'Create course' }).click();
  await page.getByText('Course created').waitFor();
  await page.getByText('Test Course From Smoke').first().waitFor();
});

await step('publishing a course toasts and flips the switch', async () => {
  await page.getByRole('switch', { name: 'Publish Test Course From Smoke' }).click();
  await page.getByText(/is live for students/).waitFor();
});

await step('add a lesson from the course editor', async () => {
  await page.getByText('Test Course From Smoke').first().click();
  await page.getByRole('button', { name: 'Add lesson' }).first().click();
  await page.getByLabel('Title').fill('Smoke lesson one');
  await page.getByLabel('Content').fill('First paragraph of the smoke lesson.\n\nSecond paragraph.');
  await page.getByRole('button', { name: 'Save lesson' }).click();
  await page.getByText('Lesson added').waitFor();
  await page.getByText('Smoke lesson one').waitFor();
});

await step('reordering persists the lesson order', async () => {
  await page.getByRole('button', { name: 'Add lesson' }).first().click();
  await page.getByLabel('Title').fill('Smoke lesson two');
  await page.getByLabel('Content').fill('Another lesson body, used to check ordering.');
  await page.getByRole('button', { name: 'Save lesson' }).click();
  await page.getByText('Smoke lesson two').waitFor();
  await page.getByRole('button', { name: 'Move Smoke lesson two up' }).click();
  const first = await page.locator('ol li').first().innerText();
  if (!first.includes('Smoke lesson two')) throw new Error(`reorder failed, first item was: ${first}`);
});

await step('deleting a lesson asks for confirmation', async () => {
  await page.getByRole('button', { name: 'Delete Smoke lesson one' }).click();
  await page
    .getByRole('dialog', { name: 'Delete lesson?' })
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await page.getByText('Lesson deleted').waitFor();
});

await step('admins can change a role from the Users screen', async () => {
  await page.getByRole('button', { name: 'Users' }).first().click();
  await page.getByRole('heading', { name: 'Users' }).waitFor();
  await page.getByLabel('Role for Liam Novak').first().selectOption('teacher');
  await page.getByText('Liam Novak is now a teacher').waitFor();
});

await step('settings reports demo mode', async () => {
  await page.getByRole('button', { name: 'Settings' }).first().click();
  await page.getByText('Firebase connection').waitFor();
  await page.getByText(/Running in/).waitFor();
});

await step('the sidebar becomes bottom navigation on a phone', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  if (!(await page.locator('nav.fixed').isVisible())) {
    throw new Error('bottom navigation is not visible at 390 px');
  }
});

report(errors);
await browser.close();
