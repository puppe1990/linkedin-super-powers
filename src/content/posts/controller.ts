import { renderPostsDrawer } from '../notifications/drawer';
import { extractFeedPostsFromDocument } from './parser';
import { saveExtractedPosts } from './storage';

export function extractAndShowFeedPosts(
  hostDocument: Document = document,
  storage: Storage = window.localStorage
): number {
  const posts = extractFeedPostsFromDocument(hostDocument);
  saveExtractedPosts(posts, storage);
  renderPostsDrawer(posts);
  return posts.length;
}
