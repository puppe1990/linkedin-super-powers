import { beforeEach, describe, expect, it, vi } from 'vitest';

const extractAndShowFeedPosts = vi.fn();
const openNotificationsDrawer = vi.fn();
const findNotificationAnchor = vi.fn(() => null);

vi.mock('../../src/content/posts/controller', () => ({
  extractAndShowFeedPosts
}));

vi.mock('../../src/content/notifications/controller', () => ({
  openNotificationsDrawer
}));

vi.mock('../../src/content/notifications/selectors', () => ({
  findNotificationAnchor
}));

class FakeMutationObserver {
  observe(): void {}
  disconnect(): void {}
  takeRecords(): MutationRecord[] {
    return [];
  }
}

describe('content bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('MutationObserver', FakeMutationObserver);
    extractAndShowFeedPosts.mockClear();
    openNotificationsDrawer.mockClear();
    findNotificationAnchor.mockClear();
    findNotificationAnchor.mockReturnValue(null);

    document.body.innerHTML = `
      <header>
        <nav aria-label="Primary Navigation">
          <a href="/feed/">Inicio</a>
        </nav>
      </header>
    `;
  });

  it('routes the header trigger to extractAndShowFeedPosts()', async () => {
    vi.useFakeTimers();
    await import('../../src/content/index');

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-menu button')?.click();
    vi.runAllTimers();
    await Promise.resolve();

    expect(extractAndShowFeedPosts).toHaveBeenCalledTimes(1);
    expect(extractAndShowFeedPosts).toHaveBeenCalledWith();
  });
});
