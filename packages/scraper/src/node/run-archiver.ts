import fs from 'fs';
import path from 'path';
import { authenticateBumble } from './authenticate-bumble.js';
import { extractConversation } from '../browser/extract-conversation.js';
import { scrollConversation } from '../browser/scroll-conversation.js';
import { downloadMedia } from './download-media.js';
import { CLASSES, OUTPUT_FILE, OUTPUT_MEDIA_PATH, SELECTORS } from '../constants.js';

(async () => {
  const page = await authenticateBumble();

  console.log('Waiting for conversations to be ready...');
  await page.waitForSelector(SELECTORS.conversationsContainer, {
    timeout: 0,
  });

  console.log(
    'Select the conversation and wait until messages are visible, THEN press ENTER in this terminal.'
  );
  await new Promise<void>(resolve => process.stdin.once('data', () => resolve()));

  console.log('Scrolling conversation...');
  await page.evaluate(scrollConversation, SELECTORS.messagesListScrollContainer);

  console.log('Extracting messages...');
  const archive = await page.evaluate(extractConversation, {
    matchNameSelector: SELECTORS.matchName,
    conversationSelector: SELECTORS.conversation,
    textSelector: SELECTORS.text,
    imageSelector: SELECTORS.image,
    gifSourceSelector: SELECTORS.gifSource,
    audioSelector: SELECTORS.audio,
    messageGroupDate: CLASSES.messageGroupDate,
    messageOut: CLASSES.messageOut,
  });

  for (const day of archive.conversation.days) {
    for (const message of day.messages) {
      if (message.media.length) {
        message.media = await downloadMedia(
          message.media,
          path.join(OUTPUT_MEDIA_PATH, archive.conversation.matchName),
          `message-${message.id.toString()}`
        );
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(archive, null, 2), 'utf-8');

  console.log('Archive complete');
  process.exit(0);
})();
