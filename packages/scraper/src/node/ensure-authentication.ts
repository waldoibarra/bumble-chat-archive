import { BrowserContext, Page } from 'playwright';

import { AUTH_STATE_FILE, SELECTORS } from './constants.js';
import { getPathFromProjectRoot } from './utils/get-path-from-project-root.js';
import { checkFileExists } from './utils/check-file-exists.js';

export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector(SELECTORS.conversationsContainer, {
      timeout: 5_000,
    });
    return true;
  } catch {
    return false;
  }
}

export async function ensureAuthentication({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}): Promise<void> {
  const loggedIn = await isLoggedIn(page);

  if (loggedIn) {
    console.log('Authenticated via existing session.');
    return;
  }

  console.log('Session invalid or missing. Please log in manually.');

  await page.waitForSelector(SELECTORS.conversationsContainer, {
    timeout: 0,
  });

  console.log('Login completed.');

  const storageStatePath = getPathFromProjectRoot(AUTH_STATE_FILE);
  await context.storageState({
    path: storageStatePath,
  });

  console.log('Auth state snapshot saved (best-effort).');
}
