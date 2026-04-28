import { describe, expect, it } from 'vitest';

import { loadNotificationsFromFrame } from '../../src/content/notifications/frame-loader';

function buildFrameWithContent(contentDocument: Document): HTMLIFrameElement {
  const frame = document.createElement('iframe');

  Object.defineProperty(frame, 'contentDocument', {
    configurable: true,
    value: contentDocument
  });

  return frame;
}

describe('loadNotificationsFromFrame', () => {
  it('loads notification items from an iframe document', async () => {
    const contentDocument = document.implementation.createHTMLDocument('');
    const frame = buildFrameWithContent(contentDocument);
    const promise = loadNotificationsFromFrame(document, () => frame, {
      intervalMs: 5,
      timeoutMs: 50
    });

    window.setTimeout(() => {
      contentDocument.body.innerHTML = `
        <a href="/feed/update/urn:li:activity:3/" aria-label="Pessoa Demo enviou uma mensagem">
          <time datetime="2026-04-28T07:00:00.000Z">4 h</time>
        </a>
      `;
      frame.dispatchEvent(new Event('load'));
    }, 0);

    await expect(promise).resolves.toEqual([
      {
        id: '/feed/update/urn:li:activity:3/',
        title: 'Pessoa Demo enviou uma mensagem',
        subtitle: '4 h',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:3/'
      }
    ]);
    expect(document.body.contains(frame)).toBe(false);
  });
});
