import { fileURLToPath } from 'node:url';

export function getPathFromProjectRoot(filePath: string): string {
  const projectRootUrl = new URL('../../../../../', import.meta.url);

  return fileURLToPath(new URL(filePath, projectRootUrl));
}
