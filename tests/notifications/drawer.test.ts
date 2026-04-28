import { describe, expect, it } from 'vitest';

import {
  renderDrawer,
  renderLoadingDrawer,
  renderPostsDrawer
} from '../../src/content/notifications/drawer';

describe('renderLoadingDrawer', () => {
  it('shows a spinner and loading copy', () => {
    renderLoadingDrawer();

    expect(document.querySelector('.lnsp-spinner')).not.toBeNull();
    expect(document.body.textContent).toContain('Carregando notificacoes...');
  });
});

describe('renderDrawer', () => {
  it('renders compact notification items', () => {
    renderDrawer([
      {
        id: '1',
        title: 'Pessoa Demo reagiu a sua publicacao',
        subtitle: '1 h',
        href: 'https://www.linkedin.com/feed/update/1'
      }
    ]);

    expect(document.querySelectorAll('.lnsp-item')).toHaveLength(1);
    expect(document.body.textContent).toContain(
      'Pessoa Demo reagiu a sua publicacao'
    );
  });
});

describe('renderPostsDrawer', () => {
  it('renders extracted posts in the side drawer', () => {
    renderPostsDrawer([
      {
        id: 'post-1',
        author: 'Pessoa Demo',
        headline: 'Atualizacao do produto',
        contentPreview: 'Texto inicial do post.',
        href: 'https://www.linkedin.com/feed/update/post-1',
        capturedAt: '2026-04-28T12:00:00.000Z'
      }
    ]);

    expect(document.body.textContent).toContain('Posts extraidos');
    expect(document.body.textContent).toContain('Texto inicial do post.');
  });
});
