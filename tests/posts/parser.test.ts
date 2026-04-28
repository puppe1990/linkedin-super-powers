import { describe, expect, it, vi } from 'vitest';

import { extractFeedPostsFromDocument } from '../../src/content/posts/parser';

describe('extractFeedPostsFromDocument', () => {
  it('extracts visible linkedin feed posts with initial fields', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T12:00:00.000Z'));

    document.body.innerHTML = `
      <main>
        <article data-urn="urn:li:activity:1">
          <div class="update-components-actor__title">
            <span aria-hidden="true">Pessoa Exemplo</span>
          </div>
          <div class="update-components-text">
            <span dir="ltr">Lancamos uma nova funcionalidade de exemplo.</span>
          </div>
          <a href="/feed/update/urn:li:activity:1/">Abrir post</a>
        </article>
      </main>
    `;

    const posts = extractFeedPostsFromDocument(document);

    expect(posts).toEqual([
      {
        id: 'urn:li:activity:1',
        author: 'Pessoa Exemplo',
        headline: 'Lancamos uma nova funcionalidade de exemplo.',
        contentPreview: 'Lancamos uma nova funcionalidade de exemplo.',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:1/',
        capturedAt: '2026-04-28T12:00:00.000Z'
      }
    ]);
  });

  it('ignores repeated articles without enough post content', () => {
    document.body.innerHTML = `
      <main>
        <article data-urn="urn:li:activity:1">
          <div class="update-components-actor__title">
            <span aria-hidden="true">Pessoa Exemplo</span>
          </div>
          <a href="/feed/update/urn:li:activity:1/">Abrir post</a>
        </article>
        <article data-urn="urn:li:activity:1">
          <div class="update-components-actor__title">
            <span aria-hidden="true">Pessoa Exemplo</span>
          </div>
          <div class="update-components-text">
            <span dir="ltr">Texto duplicado.</span>
          </div>
          <a href="/feed/update/urn:li:activity:1/">Abrir post</a>
        </article>
      </main>
    `;

    const posts = extractFeedPostsFromDocument(document);

    expect(posts).toHaveLength(1);
    expect(posts[0]?.contentPreview).toBe('Texto duplicado.');
  });

  it('extracts posts from the current linkedin feed markup without article tags', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T12:00:00.000Z'));

    document.body.innerHTML = `
      <main>
        <div componentkey="feed-post-1">
          <button
            type="button"
            aria-label="Abrir menu de controle da publicação de Perfil Exemplo"
          ></button>
          <a href="https://www.linkedin.com/in/perfil-exemplo/">
            <p>Perfil Exemplo</p>
          </a>
          <p data-testid="expandable-text-box">
            Este e um texto de exemplo para validar a extracao do feed atual.
          </p>
        </div>
      </main>
    `;

    const posts = extractFeedPostsFromDocument(document);

    expect(posts).toEqual([
      {
        id: 'feed-post-1',
        author: 'Perfil Exemplo',
        headline:
          'Este e um texto de exemplo para validar a extracao do feed atual.',
        contentPreview:
          'Este e um texto de exemplo para validar a extracao do feed atual.',
        href: '',
        capturedAt: '2026-04-28T12:00:00.000Z'
      }
    ]);
  });
});
