import type { ExtractedPost } from '../../shared/types';

const POST_SELECTOR = 'main article';
const POST_MENU_BUTTON_SELECTOR =
  'button[aria-label^="Abrir menu de controle da publicação"]';
const AUTHOR_SELECTORS = [
  '.update-components-actor__title span[aria-hidden="true"]',
  '.update-components-actor__name span[aria-hidden="true"]',
  'a[href*="/in/"] p',
  'a[href*="/company/"] p',
  'a[href*="/in/"] span[aria-hidden="true"]',
  'a[href*="/company/"] span[aria-hidden="true"]'
];
const CONTENT_SELECTORS = [
  '[data-testid="expandable-text-box"]',
  '.update-components-text span[dir="ltr"]',
  '.feed-shared-inline-show-more-text span[dir="ltr"]',
  '[data-test-id="main-feed-activity-card__commentary"]'
];

function normalizeText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function toAbsoluteUrl(href: string): string {
  return new URL(href, 'https://www.linkedin.com').toString();
}

function findFirstText(root: ParentNode, selectors: string[]): string {
  for (const selector of selectors) {
    const text = normalizeText(root.querySelector(selector)?.textContent);
    if (text) {
      return text;
    }
  }

  return '';
}

function hasPostContent(root: HTMLElement): boolean {
  return findFirstText(root, CONTENT_SELECTORS).length > 0;
}

function hasPostAuthor(root: HTMLElement): boolean {
  return findFirstText(root, AUTHOR_SELECTORS).length > 0;
}

function findInferredPostContainer(
  button: HTMLButtonElement
): HTMLElement | null {
  let current = button.parentElement;

  while (current && current.tagName !== 'MAIN') {
    if (hasPostContent(current) && hasPostAuthor(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function collectPostCandidates(root: ParentNode): HTMLElement[] {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(POST_SELECTOR)
  );
  const inferred = Array.from(
    root.querySelectorAll<HTMLButtonElement>(POST_MENU_BUTTON_SELECTOR),
    (button) => findInferredPostContainer(button)
  ).filter((item): item is HTMLElement => item !== null);

  return [...candidates, ...inferred];
}

function findPostHref(article: HTMLElement): string {
  const anchor = article.querySelector<HTMLAnchorElement>(
    'a[href*="/feed/update/"], a[href*="/posts/"]'
  );
  return normalizeText(anchor?.getAttribute('href'));
}

function findPostHeadline(
  article: HTMLElement,
  contentPreview: string
): string {
  const label = normalizeText(article.getAttribute('aria-label'));
  if (label) {
    return label;
  }

  return contentPreview.slice(0, 120);
}

function buildFallbackId(article: HTMLElement, index: number): string {
  const fallbackId = article.dataset.urn ?? article.dataset.id ?? article.id;
  if (fallbackId) {
    return fallbackId;
  }

  const componentKey = article.getAttribute('componentkey');
  if (componentKey) {
    return componentKey;
  }

  const author = findFirstText(article, AUTHOR_SELECTORS);
  const contentPreview = findFirstText(article, CONTENT_SELECTORS);
  const contentHash = `${author}:${contentPreview.slice(0, 48)}`;
  if (normalizeText(contentHash) !== ':') {
    return contentHash;
  }

  return `linkedin-post-${index + 1}`;
}

function buildExtractedPost(
  article: HTMLElement,
  index: number
): ExtractedPost | null {
  const contentPreview = findFirstText(article, CONTENT_SELECTORS);
  const author = findFirstText(article, AUTHOR_SELECTORS);
  const href = findPostHref(article);
  const headline = findPostHeadline(article, contentPreview);

  if (!author || !headline || !contentPreview) {
    return null;
  }

  return {
    id: article.dataset.urn || href || buildFallbackId(article, index),
    author,
    headline,
    contentPreview,
    href: href ? toAbsoluteUrl(href) : '',
    capturedAt: new Date().toISOString()
  };
}

export function extractFeedPostsFromDocument(
  root: ParentNode = document
): ExtractedPost[] {
  const items: ExtractedPost[] = [];
  const seen = new Set<string>();
  const articles = collectPostCandidates(root);

  for (const [index, article] of articles.entries()) {
    const item = buildExtractedPost(article, index);
    if (!item || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    items.push(item);
  }

  return items;
}
