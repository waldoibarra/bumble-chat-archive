import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { chromium, Page } from 'playwright';

import { injectBrowserHelpers } from './inject-browser-helpers.js';
import { BUMBLE_URL, AUTH_STATE_FILE } from './constants.js';

export async function authenticateBumble(): Promise<Page> {
  const browser = await chromium.launch({ headless: false });

  const projectRootUrl = new URL('../../../../', import.meta.url);
  const outputPath = fileURLToPath(new URL(AUTH_STATE_FILE, projectRootUrl));
  const existsAuthFile = fs.existsSync(outputPath);

  const context = existsAuthFile
    ? await browser.newContext({ storageState: outputPath })
    : await browser.newContext();

  const page = await context.newPage();

  await injectBrowserHelpers(page);
  await page.goto(BUMBLE_URL, { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    if (typeof (globalThis as any).extractConversation !== 'function') {
      throw new Error('extractConversation not installed');
    }
  });

  if (!existsAuthFile) {
    console.log('Log in if needed, then click the conversation you want to archive.\n');

    await context.storageState({ path: outputPath });
    console.log('Auth state saved');
  }

  return page;
}
