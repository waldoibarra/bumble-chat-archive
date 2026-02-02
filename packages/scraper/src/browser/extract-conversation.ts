/// <reference lib="dom" />
import {
  Conversation,
  Direction,
  ExtractConversationSelectors,
  Message,
  MessageKind,
} from '../shared/browser-functions.js';
import { MEDIA_KIND } from '../shared/constants.js';

interface NodeData {
  kind: MessageKind;
  text?: string;
  url?: string;
}

function getNodeData(
  node: Element,
  {
    textSelector,
    imageSelector,
    gifSelector,
    audioSelector,
  }: {
    textSelector: string;
    imageSelector: string;
    gifSelector: string;
    audioSelector: string;
  }
): NodeData {
  const textEl = node.querySelector(textSelector);
  const text = textEl?.textContent?.trim();

  if (text) {
    return {
      kind: MEDIA_KIND.TEXT,
      text,
    };
  }

  const imageEl = node.querySelector(imageSelector) as HTMLImageElement | null;
  const gifEl = node.querySelector(gifSelector) as HTMLVideoElement | null;
  const audioEl = node.querySelector(audioSelector) as HTMLAudioElement | null;

  const hasImage = !!imageEl?.src;
  const hasGif = !!gifEl?.src;
  const hasAudio = !!audioEl?.src;

  if (hasImage) {
    return {
      kind: MEDIA_KIND.IMAGE,
      url: imageEl!.src,
    };
  }

  if (hasGif) {
    return {
      kind: MEDIA_KIND.GIF,
      url: gifEl!.src,
    };
  }

  if (hasAudio) {
    return {
      kind: MEDIA_KIND.AUDIO,
      url: audioEl!.src,
    };
  }

  throw new Error('Unknown media kind');
}

function extractConversation({
  matchNameSelector,
  conversationSelector,
  textSelector,
  imageSelector,
  gifSelector,
  audioSelector,
  messageGroupDateClass,
  messageOutClass,
}: ExtractConversationSelectors): Conversation {
  const normalizeDate = (raw: string): string => raw.replace(/\u00A0/g, ' ').trim();

  const root = document.querySelector(conversationSelector);
  if (!root) throw new Error('Conversation container not found');

  const messages: Message[] = [];
  let currentDay: string | null = null;

  Array.from(root.children).forEach((node, index) => {
    if (node.classList.contains(messageGroupDateClass)) {
      currentDay = normalizeDate(node.textContent || '');
      return;
    }

    if (!node.classList.contains('message') || !currentDay) return;

    const direction: Direction = node.classList.contains(messageOutClass) ? 'out' : 'in';

    const { kind, text, url } = getNodeData(node, {
      textSelector,
      imageSelector,
      gifSelector,
      audioSelector,
    });

    if (kind === MEDIA_KIND.TEXT) {
      messages.push({
        id: index,
        direction,
        timestamp: currentDay,
        kind: MEDIA_KIND.TEXT,
        text: text!,
      });
    } else {
      messages.push({
        id: index,
        direction,
        timestamp: currentDay,
        kind,
        url: url!,
      });
    }
  });

  const matchNameEl = document.querySelector(matchNameSelector);

  return {
    matchName: matchNameEl?.textContent?.trim() || '',
    exportedAt: new Date().toISOString(),
    messages,
  };
}

(globalThis as any).extractConversation = extractConversation;
