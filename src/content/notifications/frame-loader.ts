import type { NotificationItem } from '../../shared/types';
import { LINKEDIN_NOTIFICATIONS_URL } from './constants';
import { extractNotificationsFromDocument } from './parser';

interface WaitOptions {
  intervalMs: number;
  timeoutMs: number;
}

const DEFAULT_WAIT_OPTIONS: WaitOptions = {
  intervalMs: 250,
  timeoutMs: 5000
};

type FrameFactory = (hostDocument: Document) => HTMLIFrameElement;

function sleep(intervalMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, intervalMs));
}

function createNotificationsFrame(hostDocument: Document): HTMLIFrameElement {
  const frame = hostDocument.createElement('iframe');
  frame.src = LINKEDIN_NOTIFICATIONS_URL;
  frame.setAttribute('aria-hidden', 'true');
  frame.style.display = 'none';
  return frame;
}

function getHostBody(hostDocument: Document): HTMLElement {
  if (hostDocument.body) {
    return hostDocument.body;
  }

  throw new Error(
    'Expected host document.body to exist for notifications iframe.'
  );
}

function readFrameDocument(frame: HTMLIFrameElement): Document {
  if (frame.contentDocument) {
    return frame.contentDocument;
  }

  throw new Error(
    `Expected iframe.contentDocument to exist for "${frame.src}" notifications frame.`
  );
}

function waitForFrameLoad(frame: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    frame.addEventListener('load', () => resolve(), { once: true });
    frame.addEventListener(
      'error',
      () =>
        reject(
          new Error(`Failed to load LinkedIn notifications frame: ${frame.src}`)
        ),
      { once: true }
    );
  });
}

async function waitForNotificationItems(
  frame: HTMLIFrameElement,
  waitOptions: WaitOptions
): Promise<NotificationItem[]> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < waitOptions.timeoutMs) {
    const items = extractNotificationsFromDocument(readFrameDocument(frame));
    if (items.length > 0) {
      return items;
    }

    await sleep(waitOptions.intervalMs);
  }

  return extractNotificationsFromDocument(readFrameDocument(frame));
}

export async function loadNotificationsFromFrame(
  hostDocument: Document = document,
  frameFactory: FrameFactory = createNotificationsFrame,
  waitOptions: WaitOptions = DEFAULT_WAIT_OPTIONS
): Promise<NotificationItem[]> {
  const frame = frameFactory(hostDocument);
  getHostBody(hostDocument).append(frame);

  try {
    await waitForFrameLoad(frame);
    return waitForNotificationItems(frame, waitOptions);
  } finally {
    frame.remove();
  }
}
