type Direction = 'in' | 'out';
type MediaType = 'image' | 'gif' | 'audio';

interface MediaItem {
  type: MediaType;
  url: string;
}

interface Message {
  id: number;
  direction: Direction;
  timestamp: {
    date: string;
    time: null;
  };
  text: string | null;
  media: MediaItem[];
}

interface DayGroup {
  date: string;
  messages: Message[];
}

interface Archive {
  conversation: {
    matchName: string;
    exportedAt: string;
    days: DayGroup[];
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
}): Archive {
  const normalizeDate = (raw: string): string => raw.replace(/\u00A0/g, ' ').trim();

  const root = document.querySelector(conversationSelector);
  if (!root) throw new Error('Conversation container not found');

  const days: DayGroup[] = [];
  let currentDay: DayGroup | null = null;

  Array.from(root.children).forEach((node, index) => {
    if (node.classList.contains(messageGroupDate)) {
      currentDay = {
        date: normalizeDate(node.textContent || ''),
        messages: [],
      };
      days.push(currentDay);
      return;
    }

    if (!node.classList.contains('message') || !currentDay) return;

    const direction: Direction = node.classList.contains(messageOut) ? 'out' : 'in';

    const textEl = node.querySelector(textSelector);
    const imgEl = node.querySelector(imageSelector) as HTMLImageElement | null;
    const gifEl = node.querySelector(gifSourceSelector) as HTMLSourceElement | null;
    const audioEl = node.querySelector(audioSelector) as HTMLAudioElement | null;

    const media: MediaItem[] = [];

    if (imgEl?.src) media.push({ type: 'image', url: imgEl.src });
    if (gifEl?.src) media.push({ type: 'gif', url: gifEl.src });
    if (audioEl?.src) media.push({ type: 'audio', url: audioEl.src });

    currentDay.messages.push({
      id: index,
      direction,
      timestamp: { date: currentDay.date, time: null },
      text: textEl?.textContent?.trim() || null,
      media,
    });
  });

  const matchNameEl = document.querySelector(matchNameSelector);

  return {
    conversation: {
      matchName: matchNameEl?.textContent?.trim() || '',
      exportedAt: new Date().toISOString(),
      days,
    },
  };
}
