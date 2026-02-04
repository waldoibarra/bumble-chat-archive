import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export async function injectBrowserHelpers(page: import('playwright').Page) {
  const scrollConversationFnPath = path.resolve(dirName, '../browser/scroll-conversation.js');
  const waitForMessageHydrationAndGetSrcFnPath = path.resolve(
    dirName,
    '../browser/wait-for-message-hydration-and-get-src.js'
  );
  const extractConversationFnPath = path.resolve(dirName, '../browser/extract-conversation.js');

  await page.addInitScript({ path: scrollConversationFnPath });
  await page.addInitScript({ path: waitForMessageHydrationAndGetSrcFnPath });
  await page.addInitScript({ path: extractConversationFnPath });
}
