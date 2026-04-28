import type { ExtractedPost } from '../../shared/types';

const MENU_PANEL_ID = 'lnsp-posts-menu-panel';
const MENU_STYLE_ID = 'lnsp-posts-menu-style';

function ensureStyle(): void {
  if (document.getElementById(MENU_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = MENU_STYLE_ID;
  style.textContent = `
    #${MENU_PANEL_ID} {
      margin-top: 8px;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
      overflow: hidden;
    }

    #${MENU_PANEL_ID} .lnsp-posts-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    #${MENU_PANEL_ID} .lnsp-posts-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #191919;
    }

    #${MENU_PANEL_ID} .lnsp-posts-count {
      font-size: 12px;
      color: #666666;
    }

    #${MENU_PANEL_ID} .lnsp-posts-list {
      max-height: 320px;
      overflow: auto;
    }

    #${MENU_PANEL_ID} .lnsp-posts-empty {
      padding: 16px;
      font-size: 13px;
      color: #666666;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item {
      display: block;
      padding: 12px 16px;
      text-decoration: none;
      color: inherit;
      border-top: 1px solid #f0f2f5;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item:hover {
      background: #f3f6f8;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item:first-child {
      border-top: 0;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item-title {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #191919;
      line-height: 1.35;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item-meta {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #666666;
    }

    #${MENU_PANEL_ID} .lnsp-posts-item-preview {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.45;
      color: #344054;
    }
  `;

  document.head.appendChild(style);
}
function buildItem(post: ExtractedPost): HTMLElement {
  const item = document.createElement(post.href ? 'a' : 'div');
  item.className = 'lnsp-posts-item';

  if (item instanceof HTMLAnchorElement) {
    item.href = post.href;
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
  }

  const title = document.createElement('strong');
  title.className = 'lnsp-posts-item-title';
  title.textContent = post.headline;

  const meta = document.createElement('span');
  meta.className = 'lnsp-posts-item-meta';
  meta.textContent = `${post.author} · ${new Date(post.capturedAt).toLocaleString(
    'pt-BR'
  )}`;

  const preview = document.createElement('span');
  preview.className = 'lnsp-posts-item-preview';
  preview.textContent = post.contentPreview;

  item.append(title, meta, preview);
  return item;
}

export function renderPostsMenuPanel(
  posts: ExtractedPost[],
  container: HTMLElement
): void {
  const existing = container.querySelector(`#${MENU_PANEL_ID}`);
  existing?.remove();

  const panel = document.createElement('section');
  panel.id = MENU_PANEL_ID;

  const head = document.createElement('div');
  head.className = 'lnsp-posts-head';

  const title = document.createElement('h3');
  title.className = 'lnsp-posts-title';
  title.textContent = 'Posts extraidos';

  const count = document.createElement('span');
  count.className = 'lnsp-posts-count';
  count.textContent = `${posts.length} posts`;

  const list = document.createElement('div');
  list.className = 'lnsp-posts-list';

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'lnsp-posts-empty';
    empty.textContent = 'Nenhum post visivel encontrado.';
    list.appendChild(empty);
  }

  for (const post of posts) {
    list.appendChild(buildItem(post));
  }

  head.append(title, count);
  panel.append(head, list);
  container.appendChild(panel);
}
