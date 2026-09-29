import { describe, expect, it } from 'vitest';

import {
  EXTRACTED_POSTS_STORAGE_KEY,
  loadExtractedPosts,
  saveExtractedPosts
} from '../../src/content/posts/storage';

describe('saveExtractedPosts', () => {
  it('persists extracted posts in localStorage', () => {
    const posts = [
      {
        id: 'post-1',
        author: 'Pessoa Demo',
        headline: 'Headline',
        contentPreview: 'Preview',
        href: 'https://www.linkedin.com/feed/update/post-1',
        capturedAt: '2026-04-28T12:00:00.000Z'
      }
    ];

    saveExtractedPosts(posts, window.localStorage);

    expect(window.localStorage.getItem(EXTRACTED_POSTS_STORAGE_KEY)).toBe(
      JSON.stringify(posts)
    );
  });
});

describe('loadExtractedPosts', () => {
  it('returns only valid extracted posts', () => {
    window.localStorage.setItem(
      EXTRACTED_POSTS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'post-1',
          author: 'Pessoa Demo',
          headline: 'Headline',
          contentPreview: 'Preview',
          href: 'https://www.linkedin.com/feed/update/post-1',
          capturedAt: '2026-04-28T12:00:00.000Z'
        },
        {
          id: 'post-2'
        }
      ])
    );

    expect(loadExtractedPosts(window.localStorage)).toEqual([
      {
        id: 'post-1',
        author: 'Pessoa Demo',
        headline: 'Headline',
        contentPreview: 'Preview',
        href: 'https://www.linkedin.com/feed/update/post-1',
        capturedAt: '2026-04-28T12:00:00.000Z'
      }
    ]);
  });
});
