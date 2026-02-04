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

/* ------ conversation ------- */

export interface Conversation {
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
  textContainerSelector: string;
  imageContainerSelector: string;
  gifContainerSelector: string;
  audioContainerSelector: string;
  textSelector: string;
  imageSelector: string;
  gifSelector: string;
  audioSelector: string;
  messageGroupDateClass: string;
  messageOutClass: string;
}

export type ScrollConversation = (selectors: ScrollConversationSelectors) => Promise<void>;
export type WaitForMessageHydrationAndGetSrc = (
  node: Element,
  selector: string,
  timeoutMs?: number
) => Promise<string>;
export type ExtractConversation = (
  selectors: ExtractConversationSelectors
) => Promise<Conversation>;

export interface BrowserFunctions {
  scrollConversation: ScrollConversation;
  waitForMessageHydrationAndGetSrc: WaitForMessageHydrationAndGetSrc;
  extractConversation: ExtractConversation;
}
