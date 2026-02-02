import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Page } from 'playwright';

import { authenticateBumble } from './authenticate-bumble.js';
import { downloadMedia } from './download-media.js';
import { CLASSES, OUTPUT_FILE, OUTPUT_MEDIA_PATH, SELECTORS } from './constants.js';
import { ENCODING_OPTIONS } from '../shared/encoding-options.js';
import {
  BrowserFunctions,
  Conversation,
  ExtractConversationSelectors,
  MediaMessage,
  Message,
  ScrollConversationSelectors,
} from '../shared/browser-functions.js';
import { MEDIA_KIND } from '../shared/constants.js';

async function waitForConversationSelection(page: Page): Promise<void> {
  console.log('Waiting for conversations to be ready...');
  await page.waitForSelector(SELECTORS.conversationsContainer, {
    timeout: 0,
  });

  console.log(
    'Select the conversation and wait until messages are visible, THEN press ENTER in this terminal.'
  );
  await new Promise<void>(resolve => process.stdin.once('data', () => resolve()));
}

async function scrollConversationToLoadAllMessages(page: Page): Promise<void> {
  console.log('Scrolling conversation...');
  const scrollConversationSelectors: ScrollConversationSelectors = {
    messagesListScrollContainerSelector: SELECTORS.messagesListScrollContainer,
  };
  await page.evaluate(
    selectors => (globalThis as unknown as BrowserFunctions).scrollConversation(selectors),
    scrollConversationSelectors
  );
}

async function extractConversationMessages(page: Page): Promise<Conversation> {
  console.log('Extracting messages...');
  const extractConversationSelectors: ExtractConversationSelectors = {
    matchNameSelector: SELECTORS.matchName,
    conversationSelector: SELECTORS.conversation,
    textSelector: SELECTORS.text,
    imageSelector: SELECTORS.image,
    gifSelector: SELECTORS.gif,
    audioSelector: SELECTORS.audio,
    messageGroupDateClass: CLASSES.messageGroupDate,
    messageOutClass: CLASSES.messageOut,
  };
  const conversation = await page.evaluate(
    selectors => (globalThis as unknown as BrowserFunctions).extractConversation(selectors),
    extractConversationSelectors
  );

  return conversation;
}

function isMediaMessage(message: Message): message is MediaMessage {
  return message.kind !== MEDIA_KIND.TEXT;
}

async function downloadConversationMediaMessages(conversation: Conversation): Promise<void> {
  for (const message of conversation.messages) {
    if (isMediaMessage(message)) {
      const { url, localPath, mimeType, status } = await downloadMedia(
        message as MediaMessage,
        path.join(OUTPUT_MEDIA_PATH, conversation.matchName)
      );

      message.url = url;
      message.localPath = localPath;
      message.mimeType = mimeType;
      message.status = status;
    }
  }
}

async function archiveConversation(conversation: Conversation): Promise<void> {
  const projectRootUrl = new URL('../../../../', import.meta.url);
  const outputPath = fileURLToPath(new URL(OUTPUT_FILE, projectRootUrl));
  const stringifiedConversation = JSON.stringify(conversation, null, 2);

  await writeFile(outputPath, stringifiedConversation, ENCODING_OPTIONS);
  console.log('Conversation archive complete');
}

async function main(): Promise<void> {
  // setup browser, login, archive.
  const page = await authenticateBumble();

  await waitForConversationSelection(page);
  // await scrollConversationToLoadAllMessages(page);

  const conversation = await extractConversationMessages(page);
  await new Promise<void>(resolve => process.stdin.once('data', () => resolve()));
  await downloadConversationMediaMessages(conversation);
  await archiveConversation(conversation);
}

await main();
