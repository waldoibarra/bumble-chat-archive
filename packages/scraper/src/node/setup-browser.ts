import { BrowserContext, chromium, Page } from 'playwright';

import { injectBrowserHelpers } from './inject-browser-helpers.js';
import { BUMBLE_URL, AUTH_STATE_FILE } from './constants.js';
import { getPathFromProjectRoot } from './utils/get-path-from-project-root.js';
import { checkFileExists } from './utils/check-file-exists.js';

export async function setupBrowser(): Promise<{ page: Page; context: BrowserContext }> {
  const browser = await chromium.launch({ headless: false });
  const storageStatePath = getPathFromProjectRoot(AUTH_STATE_FILE);
  const existsAuthFile = await checkFileExists(storageStatePath);

  const context = existsAuthFile
    ? await browser.newContext({ storageState: storageStatePath })
    : await browser.newContext();

  const page = await context.newPage();

  await injectBrowserHelpers(page);
  await page.goto(BUMBLE_URL, { waitUntil: 'domcontentloaded' });

  return { page, context };
}
