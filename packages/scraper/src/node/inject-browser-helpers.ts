import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENCODING_OPTIONS } from '../shared/encoding-options.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export async function injectBrowserHelpers(page: import('playwright').Page) {
  const scrollConversationFnPath = path.resolve(dirName, '../browser/scroll-conversation.js');
  const extractConversationFnPath = path.resolve(dirName, '../browser/extract-conversation.js');

  const scrollConversationFnStr = await readFile(scrollConversationFnPath, ENCODING_OPTIONS);
  const extractConversationFnStr = await readFile(extractConversationFnPath, ENCODING_OPTIONS);

  await page.addInitScript(scrollConversationFnStr);
  await page.addInitScript(extractConversationFnStr);
}
