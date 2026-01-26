import fs from 'fs';
import path from 'path';
import https from 'https';
import { MIME_EXTENSION_MAP } from './media-types.js';
import { MediaStatus, MediaType } from '../shared/browser-functions.js';
import { MEDIA_STATUS } from '../shared/constants.js';

interface MediaItem {
  type: MediaType;
  url: string;
  localPath?: string;
  mimeType?: string;
  status?: MediaStatus;
}

const standardMediaType = MIME_EXTENSION_MAP['application/octet-stream'];

function getFileExtensionFromMime(mime?: string): string {
  if (!mime) {
    return standardMediaType;
  }

  const baseMime = mime.split(';')[0]?.trim();
  if (!baseMime) {
    return standardMediaType;
  }

  return MIME_EXTENSION_MAP[baseMime] ?? standardMediaType;
}

function removeSizeParam(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete('size');
    return u.toString();
  } catch {
    return url;
  }
}

export async function downloadMedia(
  media: MediaItem[],
  outputDir: string,
  fileNameWithoutExtension: string
): Promise<MediaItem[]> {
  fs.mkdirSync(outputDir, { recursive: true });

  const results: MediaItem[] = [];

  for (const item of media) {
    const cleanUrl = removeSizeParam(item.url);

    try {
      await new Promise<void>((resolve, reject) => {
        https
          .get(cleanUrl, res => {
            if (res.statusCode !== 200) {
              res.resume();
              return reject();
            }

            const mimeType = res.headers['content-type'];
            const ext = getFileExtensionFromMime(mimeType);
            const fileName = `${fileNameWithoutExtension}.${ext}`;
            const filePath = path.join(outputDir, fileName);
            const stream = fs.createWriteStream(filePath);

            res.pipe(stream);
            stream.on('finish', () => {
              results.push({
                ...item,
                url: cleanUrl,
                localPath: filePath,
                mimeType,
                status: MEDIA_STATUS.AVAILABLE,
              });
              resolve();
            });
          })
          .on('error', reject);
      });
    } catch {
      results.push({
        ...item,
        url: cleanUrl,
        status: MEDIA_STATUS.UNAVAILABLE,
      });
    }
  }

  return results;
}
