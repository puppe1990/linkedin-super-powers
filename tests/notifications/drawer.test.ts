import { describe, expect, it } from 'vitest';

import {
  renderDrawer,
  renderLoadingDrawer
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
        title: 'Ana reagiu a sua publicacao',
        subtitle: '1 h',
        href: 'https://www.linkedin.com/feed/update/1'
      }
    ]);

    expect(document.querySelectorAll('.lnsp-item')).toHaveLength(1);
    expect(document.body.textContent).toContain('Ana reagiu a sua publicacao');
  });
});
