export type Direction = 'in' | 'out';
export type MediaType = 'image' | 'gif' | 'audio';

export interface MediaItem {
  type: MediaType;
  url: string;
}

export interface Message {
  id: number;
  direction: Direction;
  timestamp: {
    date: string;
    time: null;
  };
  text: string | null;
  media: MediaItem[];
}

export interface DayGroup {
  date: string;
  messages: Message[];
}

export interface Archive {
  conversation: {
    matchName: string;
    exportedAt: string;
    days: DayGroup[];
  };
}

export interface ScrollConversationSelectors {
  messagesListScrollContainerSelector: string;
}

export interface ExtractConversationSelectors {
  matchNameSelector: string;
  conversationSelector: string;
  textSelector: string;
  imageSelector: string;
  gifSourceSelector: string;
  audioSelector: string;
  messageGroupDate: string;
  messageOut: string;
}

export interface BrowserFunctions {
  scrollConversation: (selectors: ScrollConversationSelectors) => Promise<void>;

  extractConversation: (selectors: ExtractConversationSelectors) => Archive;
}
