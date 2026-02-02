export const BUMBLE_URL = 'https://bumble.com/app';
export const AUTH_STATE_FILE = '.auth-state.json';
export const OUTPUT_FILE = 'conversation.json';
export const OUTPUT_MEDIA_PATH = 'media';

export const SELECTORS = {
  matchName: '.messages-header .messages-header__name',
  conversationsContainer: '.contact-tabs__section--conversations',
  messagesListScrollContainer: '.messages-list .scroll__inner',
  conversation: '.messages-list__conversation',
  message: '.message',
  dateSeparator: '.message-group-date',
  text: '.message-bubble__text',
  image: '.message-media__image',
  gif: '.message-gif__media',
  audio: '.message-audio',
} as const;

export const CLASSES = {
  messageGroupDate: 'message-group-date',
  messageOut: 'message--out',
} as const;
