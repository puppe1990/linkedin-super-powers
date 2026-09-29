import { beforeEach, describe, expect, it } from 'vitest';

import { extractAndShowFeedPosts } from '../../src/content/posts/controller';
import { EXTRACTED_POSTS_STORAGE_KEY } from '../../src/content/posts/storage';

describe('extractAndShowFeedPosts', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('extracts posts, opens the side drawer and saves them in localStorage', () => {
    document.body.innerHTML = `
      <main>
        <article data-urn="urn:li:activity:9">
          <div class="update-components-actor__title">
            <span aria-hidden="true">Pessoa Demo</span>
          </div>
          <div class="update-components-text">
            <span dir="ltr">Conteudo inicial do post.</span>
          </div>
          <a href="/feed/update/urn:li:activity:9/">Abrir post</a>
        </article>
      </main>
    `;

    const count = extractAndShowFeedPosts(document, window.localStorage);

    expect(document.body.textContent).toContain('Posts extraidos');
    expect(document.body.textContent).toContain('Conteudo inicial do post.');
    expect(count).toBe(1);
    expect(window.localStorage.getItem(EXTRACTED_POSTS_STORAGE_KEY)).toContain(
      'urn:li:activity:9'
    );
  });
});
