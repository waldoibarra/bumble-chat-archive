import {
  ConversationArchive,
  Direction,
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
    gifSourceSelector,
    audioSelector,
  }: {
    textSelector: string;
    imageSelector: string;
    gifSourceSelector: string;
    audioSelector: string;
  }
): NodeData {
  const textEl = node.querySelector(textSelector);
  const hasText = !!textEl?.textContent;

  if (hasText) {
    return {
      kind: MEDIA_KIND.TEXT,
      text: textEl.textContent.trim(),
    };
  }

  const imageEl = node.querySelector(imageSelector) as HTMLImageElement | null;
  const gifEl = node.querySelector(gifSourceSelector) as HTMLSourceElement | null;
  const audioEl = node.querySelector(audioSelector) as HTMLAudioElement | null;

  const hasImage = !!imageEl?.src;
  const hasGif = !!gifEl?.src;
  const hasAudio = !!audioEl?.src;

  if (!hasImage || !hasGif || !hasAudio) {
    throw new Error('Unknown media kind');
  }

  let kind: MessageKind = MEDIA_KIND.IMAGE;
  let url: string = '';

  if (hasImage) {
    kind = MEDIA_KIND.IMAGE;
    url = imageEl.src;
  }

  if (hasGif) {
    kind = MEDIA_KIND.GIF;
    url = gifEl.src;
  }

  if (hasAudio) {
    kind = MEDIA_KIND.AUDIO;
    url = audioEl.src;
  }

  return {
    kind,
    url,
  };
}

export function extractConversation({
  matchNameSelector,
  conversationSelector,
  textSelector,
  imageSelector,
  gifSourceSelector,
  audioSelector,
  messageGroupDate,
  messageOut,
}: {
  matchNameSelector: string;
  conversationSelector: string;
  textSelector: string;
  imageSelector: string;
  gifSourceSelector: string;
  audioSelector: string;
  messageGroupDate: string;
  messageOut: string;
}): ConversationArchive {
  const normalizeDate = (raw: string): string => raw.replace(/\u00A0/g, ' ').trim();

  const root = document.querySelector(conversationSelector);
  if (!root) throw new Error('Conversation container not found');

  const messages: Message[] = [];
  let currentDay: string | null = null;

  Array.from(root.children).forEach((node, index) => {
    if (node.classList.contains(messageGroupDate)) {
      currentDay = normalizeDate(node.textContent || '');
      return;
    }

    if (!node.classList.contains('message') || !currentDay) return;

    const direction: Direction = node.classList.contains(messageOut) ? 'out' : 'in';

    const { kind, text, url } = getNodeData(node, {
      textSelector,
      imageSelector,
      gifSourceSelector,
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
