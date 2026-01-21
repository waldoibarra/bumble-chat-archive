import fs from 'fs';
import { chromium, Page } from 'playwright';
import { BUMBLE_URL, AUTH_STATE_FILE } from './constants.js';

export async function authenticateBumble(): Promise<Page> {
  const browser = await chromium.launch({ headless: false });
  const existsAuthFile = fs.existsSync(AUTH_STATE_FILE);

  const context = existsAuthFile
    ? await browser.newContext({ storageState: AUTH_STATE_FILE })
    : await browser.newContext();

  const page = await context.newPage();
  await page.goto(BUMBLE_URL, { waitUntil: 'domcontentloaded' });

  if (!existsAuthFile) {
    console.log('Log in if needed, then click the conversation you want to archive.\n');

    await context.storageState({ path: AUTH_STATE_FILE });
    console.log('Auth state saved');
  }

  return page;
}
