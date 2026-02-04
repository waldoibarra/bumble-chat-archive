import { access, constants } from 'node:fs/promises';

export async function checkFileExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
