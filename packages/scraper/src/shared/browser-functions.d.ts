import { MEDIA_KIND, MEDIA_STATUS } from './constants';

/* ---------- primitives ---------- */

export type Direction = 'in' | 'out';

export type MessageKind = (typeof MEDIA_KIND)[keyof typeof MEDIA_KIND];

export type MediaStatus = (typeof MEDIA_STATUS)[keyof typeof MEDIA_STATUS];

/* ---------- message ---------- */

export interface BaseMessage {
  id: number;
  direction: Direction;
  timestamp: string; // ISO 8601
  kind: MessageKind;
}

/* ---------- variants ---------- */

export interface TextMessage extends BaseMessage {
  kind: 'text';
  text: string;
}

export interface MediaMessage extends BaseMessage {
  kind: Exclude<MessageKind, 'text'>;
  url: string;
  status?: MediaStatus;
  localPath?: string;
  mimeType?: string;
}

/* ---------- union ---------- */

export type Message = TextMessage | MediaMessage;

/* ---------- archive ---------- */

export interface ConversationArchive {
  matchName: string;
  exportedAt: string; // ISO 8601
  messages: Message[];
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

  extractConversation: (selectors: ExtractConversationSelectors) => ConversationArchive;
}
