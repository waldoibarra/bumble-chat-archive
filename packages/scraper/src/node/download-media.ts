import fs from 'fs';
import path from 'path';
import https from 'https';
import { MIME_EXTENSION_MAP } from './media-types.js';

interface MediaItem {
  type: 'image' | 'gif' | 'audio';
  url: string;
  localPath?: string;
  mimeType?: string;
  status?: 'available' | 'unavailable';
}

function getFileExtensionFromMime(mime?: string): string {
  if (!mime) {
    return 'bin';
  }

  const baseMime = mime.split(';')[0]?.trim();
  if (!baseMime) {
    return 'bin';
  }

  return MIME_EXTENSION_MAP[baseMime] ?? 'bin';
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
                status: 'available',
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
        status: 'unavailable',
      });
    }
  }

  return results;
}
