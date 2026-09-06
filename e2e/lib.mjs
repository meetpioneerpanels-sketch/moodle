import { chromium } from 'playwright';

/**
 * Launch options. Playwright normally manages its own Chromium; set
 * PLAYWRIGHT_CHROMIUM to reuse a browser that is already on the machine.
 */
export function launchOptions() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM;
  return executablePath ? { executablePath } : {};
}

export async function launch() {
  return chromium.launch(launchOptions());
}

/** Runs a named step and prints a pass line, so a failure names itself. */
export async function step(name, fn) {
  await fn();
  console.log('OK  -', name);
}

/** Collects page errors, ignoring the noise from blocked third-party fonts. */
export function collectErrors(page, sink) {
  page.on('pageerror', (error) => sink.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/fonts\.g(oogle|static)apis?\.com|ERR_CONNECTION_RESET|ERR_INTERNET_DISCONNECTED/.test(text)) {
      return;
    }
    sink.push(`console: ${text}`);
  });
}

export function report(errors) {
  if (errors.length > 0) {
    console.log('\nBROWSER ERRORS:\n' + errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('\nNo unexpected console or page errors.');
  }
}
