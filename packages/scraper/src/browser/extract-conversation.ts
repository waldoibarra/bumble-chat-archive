/// <reference lib="dom" />
import {
  BrowserFunctions,
  Direction,
  ExtractConversation,
  Message,
  MessageKind,
} from '../shared/browser-functions.js';
import { MEDIA_KIND } from '../shared/constants.js';

interface NodeData {
  kind: MessageKind;
  text?: string;
  url?: string;
}

const hoursToSubstractFromScrappedTimelessDateHeader = 6;

function parseDate(raw: string): string {
  const normalizedDate = raw.replace(/\u00A0/g, ' ').trim();
  const date = new Date(normalizedDate);

  date.setHours(date.getHours() - hoursToSubstractFromScrappedTimelessDateHeader);

  return date.toISOString();
}

function normalizeUnicodeSeparators(text: string = ''): string {
  return (
    text
      .trim()
      // Paragraph Separator → blank line
      .replace(/\u2029/g, '\n\n')
      // Line Separator → single line break
      .replace(/\u2028/g, '\n')
  );
}

async function getNodeData(
  node: Element,
  {
    textContainerSelector,
    imageContainerSelector,
    gifContainerSelector,
    audioContainerSelector,
    imageSelector,
    gifSelector,
    audioSelector,
  }: {
    textContainerSelector: string;
    imageContainerSelector: string;
    gifContainerSelector: string;
    audioContainerSelector: string;
    textSelector: string;
    imageSelector: string;
    gifSelector: string;
    audioSelector: string;
  }
): Promise<NodeData> {
  const textEl = node.querySelector(textContainerSelector);
  const text = normalizeUnicodeSeparators(textEl?.textContent);

  if (text) {
    return {
      kind: MEDIA_KIND.TEXT,
      text,
    };
  }

  const imageEl = node.querySelector(imageContainerSelector) as HTMLImageElement | null;
  const gifEl = node.querySelector(gifContainerSelector) as HTMLVideoElement | null;
  const audioEl = node.querySelector(audioContainerSelector) as HTMLAudioElement | null;

  if (imageEl) {
    const url = await (globalThis as unknown as BrowserFunctions).waitForMessageHydrationAndGetSrc(
      node,
      imageSelector
    );

    return {
      kind: MEDIA_KIND.IMAGE,
      url,
    };
  }

  if (gifEl) {
    const url = await (globalThis as unknown as BrowserFunctions).waitForMessageHydrationAndGetSrc(
      node,
      gifSelector
    );

    return {
      kind: MEDIA_KIND.GIF,
      url,
    };
  }

  if (audioEl) {
    const url = await (globalThis as unknown as BrowserFunctions).waitForMessageHydrationAndGetSrc(
      node,
      audioSelector
    );

    return {
      kind: MEDIA_KIND.AUDIO,
      url,
    };
  }

  throw new Error('Unknown media kind');
}

const extractConversation: ExtractConversation = async ({
  matchNameSelector,
  conversationSelector,
  textContainerSelector,
  imageContainerSelector,
  gifContainerSelector,
  audioContainerSelector,
  textSelector,
  imageSelector,
  gifSelector,
  audioSelector,
  messageGroupDateClass,
  messageOutClass,
}) => {
  const root = document.querySelector(conversationSelector);
  if (!root) throw new Error('Conversation container not found');

  const messages: Message[] = [];
  let currentDay: string | null = null;
  let messageId: number = 1;

  for await (const node of Array.from(root.children)) {
    if (node.classList.contains(messageGroupDateClass)) {
      currentDay = parseDate(node.textContent || '');
      continue;
    }

    if (!node.classList.contains('message') || !currentDay) continue;

    const direction: Direction = node.classList.contains(messageOutClass) ? 'out' : 'in';

    const { kind, text, url } = await getNodeData(node, {
      textContainerSelector,
      imageContainerSelector,
      gifContainerSelector,
      audioContainerSelector,
      textSelector,
      imageSelector,
      gifSelector,
      audioSelector,
    });

    if (kind === MEDIA_KIND.TEXT) {
      messages.push({
        id: messageId++,
        direction,
        timestamp: currentDay,
        kind: MEDIA_KIND.TEXT,
        text: text!,
      });
    } else {
      messages.push({
        id: messageId++,
        direction,
        timestamp: currentDay,
        kind,
        url: url!,
      });
    }
  }

  const matchNameEl = document.querySelector(matchNameSelector);

  return {
    matchName: matchNameEl?.textContent?.trim() || '',
    exportedAt: new Date().toISOString(),
    messages,
  };
};

(globalThis as any).extractConversation = extractConversation;
