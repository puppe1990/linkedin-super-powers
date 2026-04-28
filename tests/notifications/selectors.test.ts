import { describe, expect, it } from 'vitest';

import { isNotificationAnchorCandidate } from '../../src/content/notifications/selectors';

describe('isNotificationAnchorCandidate', () => {
  it('matches the notifications href', () => {
    expect(
      isNotificationAnchorCandidate(
        '/notifications/?filter=all',
        'Notifications'
      )
    ).toBe(true);
  });

  it('matches localized notification text', () => {
    expect(isNotificationAnchorCandidate('/feed/', 'Notificacoes')).toBe(true);
  });

  it('ignores unrelated feed links', () => {
    expect(isNotificationAnchorCandidate('/feed/', 'Inicio')).toBe(false);
  });
});
