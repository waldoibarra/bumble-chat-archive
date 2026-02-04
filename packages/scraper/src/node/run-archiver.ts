import { writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';

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
import { setupBrowser } from './setup-browser.js';
import { getPathFromProjectRoot } from './utils/get-path-from-project-root.js';

async function waitForUserToPressEnter(): Promise<void> {
  await new Promise<void>(resolve => process.stdin.once('data', () => resolve()));
}

async function waitForConversationSelection(page: Page): Promise<void> {
  console.log('Waiting for conversations to be ready.');
  await page.waitForSelector(SELECTORS.conversationsContainer, {
    timeout: 0,
  });

  console.log(
    'Select the conversation and wait until messages are visible, THEN press ENTER in this terminal.'
  );
  await waitForUserToPressEnter();
}

async function scrollConversationToLoadAllMessages(page: Page): Promise<void> {
  console.log('Scrolling conversation to load all messages.');
  const scrollConversationSelectors: ScrollConversationSelectors = {
    messagesListScrollContainerSelector: SELECTORS.messagesListScrollContainer,
  };
  await page.evaluate(
    selectors => (globalThis as unknown as BrowserFunctions).scrollConversation(selectors),
    scrollConversationSelectors
  );
}

async function extractConversationMessages(page: Page): Promise<Conversation> {
  console.log('Extracting conversation messages.');
  const extractConversationSelectors: ExtractConversationSelectors = {
    matchNameSelector: SELECTORS.matchName,
    conversationSelector: SELECTORS.conversation,
    textContainerSelector: SELECTORS.textContainer,
    imageContainerSelector: SELECTORS.imageContainer,
    gifContainerSelector: SELECTORS.gifContainer,
    audioContainerSelector: SELECTORS.audioContainer,
    textSelector: SELECTORS.text,
    imageSelector: SELECTORS.image,
    gifSelector: SELECTORS.gif,
    audioSelector: SELECTORS.audio,
    messageGroupDateClass: CLASSES.messageGroupDate,
    messageOutClass: CLASSES.messageOut,
  };
  const conversation = await page.evaluate(
    async selectors => (globalThis as unknown as BrowserFunctions).extractConversation(selectors),
    extractConversationSelectors
  );

  return conversation;
}

async function recreateMediaDirectory(matchName: string): Promise<void> {
  const mediaPath = path.join(OUTPUT_MEDIA_PATH, matchName);
  const outputPath = getPathFromProjectRoot(mediaPath);

  console.log(`Recreating media directory: ${mediaPath}.`);
  await rm(outputPath, { recursive: true, force: true });
  await mkdir(outputPath, { recursive: true });
}

function isMediaMessage(message: Message): message is MediaMessage {
  return message.kind !== MEDIA_KIND.TEXT;
}

async function downloadConversationMediaMessages(conversation: Conversation): Promise<void> {
  const mediaMessages = conversation.messages.filter(isMediaMessage);

  if (!mediaMessages.length) return;

  const mediaPath = path.join(OUTPUT_MEDIA_PATH, conversation.matchName);
  const outputPath = getPathFromProjectRoot(mediaPath);
  console.log(`Downloading conversation media messages on: ${mediaPath}.`);

  for (const message of mediaMessages) {
    const { url, localPath, mimeType, status } = await downloadMedia(
      message as MediaMessage,
      outputPath
    );

    message.url = url;
    message.localPath = localPath;
    message.mimeType = mimeType;
    message.status = status;
  }
}

async function persistConversationFile(conversation: Conversation): Promise<void> {
  const archivePath = path.join(OUTPUT_MEDIA_PATH, conversation.matchName, OUTPUT_FILE);
  const outputPath = getPathFromProjectRoot(archivePath);
  const stringifiedConversation = JSON.stringify(conversation, null, 2);

  console.log(`Persisting conversation file: ${archivePath}.`);
  await writeFile(outputPath, stringifiedConversation, ENCODING_OPTIONS);
  console.log('Conversation archive complete.');
}

async function archiveConversation(page: Page): Promise<void> {
  await waitForConversationSelection(page);
  await scrollConversationToLoadAllMessages(page);

  const conversation = await extractConversationMessages(page);
  await recreateMediaDirectory(conversation.matchName);
  await downloadConversationMediaMessages(conversation);
  await persistConversationFile(conversation);
}

async function main(): Promise<void> {
  const { page, context } = await setupBrowser();
  await authenticateBumble(context);
  await archiveConversation(page);

  process.exit(0);
}

await main();
