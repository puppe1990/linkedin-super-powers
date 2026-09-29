import { describe, expect, it } from 'vitest';

import { renderPostsMenuPanel } from '../../src/content/posts/dropdown';

describe('renderPostsMenuPanel', () => {
  it('renders extracted posts inside a linkedin-like panel', () => {
    const container = document.createElement('div');

    renderPostsMenuPanel(
      [
        {
          id: 'post-1',
          author: 'Pessoa Demo',
          headline: 'Atualizacao de exemplo',
          contentPreview: 'Texto inicial do post.',
          href: 'https://www.linkedin.com/feed/update/post-1',
          capturedAt: '2026-04-28T12:00:00.000Z'
        }
      ],
      container
    );

    expect(container.textContent).toContain('Posts extraidos');
    expect(container.textContent).toContain('Texto inicial do post.');
  });
});
