import { BrowserContext } from 'playwright';

import { AUTH_STATE_FILE } from './constants.js';
import { getPathFromProjectRoot } from './utils/get-path-from-project-root.js';
import { checkFileExists } from './utils/check-file-exists.js';

export async function authenticateBumble(context: BrowserContext): Promise<void> {
  const storageStatePath = getPathFromProjectRoot(AUTH_STATE_FILE);
  const existsAuthFile = await checkFileExists(storageStatePath);

  if (!existsAuthFile) {
    console.log('You need to log in.');
    await context.storageState({ path: storageStatePath });
    console.log(`Auth state file saved: ${AUTH_STATE_FILE}`);
  }
}
