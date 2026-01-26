import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { authenticateBumble } from './authenticate-bumble.js';
import { downloadMedia } from './download-media.js';
import { CLASSES, OUTPUT_FILE, OUTPUT_MEDIA_PATH, SELECTORS } from './constants.js';
import { injectBrowserHelpers } from './inject-browser-helpers.js';
import { ENCODING_OPTIONS } from '../shared/encoding-options.js';
import {
  BrowserFunctions,
  ExtractConversationSelectors,
  MediaMessage,
  Message,
  ScrollConversationSelectors,
} from '../shared/browser-functions.js';
import { MEDIA_KIND } from '../shared/constants.js';

function isMediaMessage(message: Message): message is MediaMessage {
  return message.kind !== MEDIA_KIND.TEXT;
}

(async () => {
  const page = await authenticateBumble();
  await injectBrowserHelpers(page);

  console.log('Waiting for conversations to be ready...');
  await page.waitForSelector(SELECTORS.conversationsContainer, {
    timeout: 0,
  });

  console.log(
    'Select the conversation and wait until messages are visible, THEN press ENTER in this terminal.'
  );
  await new Promise<void>(resolve => process.stdin.once('data', () => resolve()));

  console.log('Scrolling conversation...');
  const scrollConversationSelectors: ScrollConversationSelectors = {
    messagesListScrollContainerSelector: SELECTORS.messagesListScrollContainer,
  };
  await page.evaluate(
    selectors => (globalThis as unknown as BrowserFunctions).scrollConversation(selectors),
    scrollConversationSelectors
  );

  console.log('Extracting messages...');
  const extractConversationSelectors: ExtractConversationSelectors = {
    matchNameSelector: SELECTORS.matchName,
    conversationSelector: SELECTORS.conversation,
    textSelector: SELECTORS.text,
    imageSelector: SELECTORS.image,
    gifSourceSelector: SELECTORS.gifSource,
    audioSelector: SELECTORS.audio,
    messageGroupDate: CLASSES.messageGroupDate,
    messageOut: CLASSES.messageOut,
  };
  const conversationArchive = await page.evaluate(
    selectors => (globalThis as unknown as BrowserFunctions).extractConversation(selectors),
    extractConversationSelectors
  );

  for (const message of conversationArchive.messages) {
    if (isMediaMessage(message)) {
      const { url, localPath, mimeType, status } = await downloadMedia(
        message as MediaMessage,
        path.join(OUTPUT_MEDIA_PATH, conversationArchive.matchName)
      );

      message.url = url;
      message.localPath = localPath;
      message.mimeType = mimeType;
      message.status = status;
    }
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(conversationArchive, null, 2), ENCODING_OPTIONS);

  console.log('Conversation archive complete');
  process.exit(0);
})();
