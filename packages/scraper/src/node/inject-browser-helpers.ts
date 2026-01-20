import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { encodingOptions } from '../shared/encoding-options.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function injectBrowserHelpers(page: import('playwright').Page) {
  const scrollConversationFnPath = path.resolve(__dirname, '../browser/scroll-conversation.js');
  const extractConversationFnPath = path.resolve(__dirname, '../browser/extract-conversation.js');

  const scrollConversationFnStr = await readFile(scrollConversationFnPath, encodingOptions);
  const extractConversationFnStr = await readFile(extractConversationFnPath, encodingOptions);

  await page.addInitScript(scrollConversationFnStr);
  await page.addInitScript(extractConversationFnStr);
}
