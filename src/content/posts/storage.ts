import type { ExtractedPost } from '../../shared/types';

export const EXTRACTED_POSTS_STORAGE_KEY = 'lnsp-extracted-posts';

function isExtractedPost(value: unknown): value is ExtractedPost {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.author === 'string' &&
    typeof item.headline === 'string' &&
    typeof item.contentPreview === 'string' &&
    typeof item.href === 'string' &&
    typeof item.capturedAt === 'string'
  );
}

export function saveExtractedPosts(
  posts: ExtractedPost[],
  storage: Storage = window.localStorage
): void {
  storage.setItem(EXTRACTED_POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function loadExtractedPosts(
  storage: Storage = window.localStorage
): ExtractedPost[] {
  const rawValue = storage.getItem(EXTRACTED_POSTS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isExtractedPost) : [];
  } catch {
    return [];
  }
}
