import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

import { MIME_EXTENSION_MAP } from './media-types.js';
import { MediaMessage } from '../shared/browser-functions.js';
import { MEDIA_STATUS } from '../shared/constants.js';

const standardContentType = 'application/octet-stream';
const standardMediaType = MIME_EXTENSION_MAP[standardContentType];

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

export async function downloadMedia(media: MediaMessage, outputDir: string): Promise<MediaMessage> {
  let result: MediaMessage;

  const cleanUrl = removeSizeParam(media.url);

  try {
    result = await new Promise<MediaMessage>((resolve, reject) => {
      https
        .get(cleanUrl, res => {
          if (res.statusCode !== 200) {
            res.resume();
            return reject();
          }

          const mimeType = res.headers['content-type'] ?? standardContentType;
          const ext = getFileExtensionFromMime(mimeType);
          const fileName = `${media.id}.${ext}`;
          const filePath = path.join(outputDir, fileName);
          const stream = fs.createWriteStream(filePath);

          res.pipe(stream);
          stream.on('finish', () => {
            resolve({
              ...media,
              url: cleanUrl,
              localPath: filePath,
              mimeType,
              status: MEDIA_STATUS.AVAILABLE,
            });
          });
        })
        .on('error', reject);
    });
  } catch {
    result = {
      ...media,
      status: MEDIA_STATUS.UNAVAILABLE,
    };
  }

  return result;
}
