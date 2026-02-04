import { BrowserFunctions, WaitForMessageHydrationAndGetSrc } from '../shared/browser-functions.js';

type MediaElement = HTMLImageElement | HTMLVideoElement | HTMLAudioElement;

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));

const waitForMessageHydrationAndGetSrc: WaitForMessageHydrationAndGetSrc = async (
  node,
  selector,
  timeoutMs = 5000
) => {
  const start = Date.now();

  while (true) {
    const element = node.querySelector(selector) as MediaElement | null;
    if (element?.src) return element.src;

    if (Date.now() - start > timeoutMs) return '';

    (element ?? node).scrollIntoView();
    await sleep(100);
  }
};

(globalThis as unknown as BrowserFunctions).waitForMessageHydrationAndGetSrc =
  waitForMessageHydrationAndGetSrc;
