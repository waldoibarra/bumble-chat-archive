export const BUMBLE_URL = 'https://bumble.com/app';
export const AUTH_STATE_FILE = '.auth-state.json';
export const OUTPUT_FILE = '0-conversation.json';
export const OUTPUT_MEDIA_PATH = 'media';

export const SELECTORS = {
  matchName: '.messages-header .messages-header__name',
  conversationsContainer: '.contact-tabs__section--conversations',
  messagesListScrollContainer: '.messages-list .scroll__inner',
  conversation: '.messages-list__conversation',
  message: '.message',

  // Date separator included in the messages list.
  dateSeparator: '.message-group-date',

  // Message containers.
  textContainer: '.message-bubble',
  imageContainer: '.message-media',
  gifContainer: '.message-gif',
  audioContainer: '.message-audio',

  // Text and media messages.
  text: 'span',
  image: 'img',
  gif: 'video source',
  audio: 'audio',
} as const;

export const CLASSES = {
  messageGroupDate: 'message-group-date',
  messageOut: 'message--out',
} as const;
