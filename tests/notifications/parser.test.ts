import { describe, expect, it } from 'vitest';

import {
  extractNotificationsFromDocument,
  extractNotificationsFromHtml
} from '../../src/content/notifications/parser';

describe('extractNotificationsFromHtml', () => {
  it('extracts notifications from linkedin-like cards', () => {
    const html = `
      <main>
        <section>
          <a href="/feed/update/urn:li:activity:1/" aria-label="Maria comentou no seu post">
            <span aria-hidden="true">Maria comentou no seu post</span>
            <time datetime="2026-04-28T10:00:00.000Z">1 h</time>
          </a>
          <a href="/jobs/view/1/" aria-label="Nova vaga recomendada para voce">
            <span aria-hidden="true">Nova vaga recomendada para voce</span>
            <time datetime="2026-04-28T09:00:00.000Z">2 h</time>
          </a>
        </section>
      </main>
    `;

    const items = extractNotificationsFromHtml(html);

    expect(items).toEqual([
      {
        id: '/feed/update/urn:li:activity:1/',
        title: 'Maria comentou no seu post',
        subtitle: '1 h',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:1/'
      },
      {
        id: '/jobs/view/1/',
        title: 'Nova vaga recomendada para voce',
        subtitle: '2 h',
        href: 'https://www.linkedin.com/jobs/view/1/'
      }
    ]);
  });

  it('removes duplicates and ignores empty anchors', () => {
    const html = `
      <div>
        <a href="/feed/update/urn:li:activity:1/" aria-label="Alguem visualizou seu perfil"></a>
        <a href="/feed/update/urn:li:activity:1/" aria-label="Alguem visualizou seu perfil"></a>
        <a href="/notifications/"></a>
      </div>
    `;

    const items = extractNotificationsFromHtml(html);

    expect(items).toEqual([
      {
        id: '/feed/update/urn:li:activity:1/',
        title: 'Alguem visualizou seu perfil',
        subtitle: '',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:1/'
      }
    ]);
  });

  it('extracts notifications from a live document root', () => {
    document.body.innerHTML = `
      <section>
        <a href="/feed/update/urn:li:activity:2/" aria-label="Joao curtiu seu comentario">
          <time datetime="2026-04-28T08:00:00.000Z">3 h</time>
        </a>
      </section>
    `;

    const items = extractNotificationsFromDocument(document);

    expect(items).toEqual([
      {
        id: '/feed/update/urn:li:activity:2/',
        title: 'Joao curtiu seu comentario',
        subtitle: '3 h',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:2/'
      }
    ]);
  });

  it('ignores navigation links when the page has notification timestamps', () => {
    document.body.innerHTML = `
      <main>
        <a href="/feed/">Inicio</a>
        <a href="/mynetwork/">Minha rede</a>
        <section>
          <a href="/feed/update/urn:li:activity:4/" aria-label="Carolina reagiu a sua publicacao">
            <time datetime="2026-04-28T06:00:00.000Z">5 h</time>
          </a>
        </section>
      </main>
    `;

    const items = extractNotificationsFromDocument(document);

    expect(items).toEqual([
      {
        id: '/feed/update/urn:li:activity:4/',
        title: 'Carolina reagiu a sua publicacao',
        subtitle: '5 h',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:4/'
      }
    ]);
  });
});
