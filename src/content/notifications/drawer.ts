import type { NotificationItem } from '../../shared/types';
import { DRAWER_ROOT_ID, STYLE_ID } from './constants';

let previousOverflow = '';

function normalizeKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildAvatarText(title: string): string {
  return title.trim().charAt(0).toUpperCase() || 'N';
}

function isUnreadNotification(title: string): boolean {
  return normalizeKey(title).includes('nao lida');
}

function removeDrawer(): void {
  document.getElementById(DRAWER_ROOT_ID)?.remove();
  document.body.style.overflow = previousOverflow;
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${DRAWER_ROOT_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
    }

    #${DRAWER_ROOT_ID} .lnsp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.32);
    }

    #${DRAWER_ROOT_ID} .lnsp-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: min(430px, 100vw);
      height: 100vh;
      overflow: auto;
      background: #f3f2ef;
      box-shadow: -12px 0 32px rgba(0, 0, 0, 0.18);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #${DRAWER_ROOT_ID} .lnsp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      border-bottom: 1px solid #d9d9d9;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 1;
    }

    #${DRAWER_ROOT_ID} .lnsp-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: #191919;
    }

    #${DRAWER_ROOT_ID} .lnsp-close {
      border: 0;
      background: transparent;
      font-size: 38px;
      line-height: 1;
      cursor: pointer;
      color: #191919;
      padding: 0;
    }

    #${DRAWER_ROOT_ID} .lnsp-list {
      display: grid;
      gap: 1px;
      padding: 0;
      background: #f3f2ef;
    }

    #${DRAWER_ROOT_ID} .lnsp-item {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
      text-decoration: none;
      color: inherit;
      background: #fff;
      border: 0;
      border-bottom: 1px solid #e0e0e0;
      padding: 14px 16px;
      transition: background 120ms ease;
    }

    #${DRAWER_ROOT_ID} .lnsp-item:hover {
      background: #eef3f8;
    }

    #${DRAWER_ROOT_ID} .lnsp-avatar {
      width: 48px;
      height: 48px;
      border-radius: 999px;
      background: linear-gradient(135deg, #0a66c2, #378fe9);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }

    #${DRAWER_ROOT_ID} .lnsp-content {
      min-width: 0;
    }

    #${DRAWER_ROOT_ID} .lnsp-item-title {
      display: block;
      font-size: 14px;
      line-height: 1.35;
      font-weight: 400;
      color: #191919;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }

    #${DRAWER_ROOT_ID} .lnsp-item-title strong {
      font-weight: 600;
    }

    #${DRAWER_ROOT_ID} .lnsp-item-subtitle {
      display: inline-block;
      font-size: 12px;
      color: #666666;
      margin-top: 6px;
    }

    #${DRAWER_ROOT_ID} .lnsp-unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #0a66c2;
      margin-top: 7px;
    }

    #${DRAWER_ROOT_ID} .lnsp-empty,
    #${DRAWER_ROOT_ID} .lnsp-loading,
    #${DRAWER_ROOT_ID} .lnsp-error {
      display: grid;
      justify-items: center;
      gap: 12px;
      padding: 32px 16px;
      color: #4b5563;
      text-align: center;
      background: #fff;
    }

    #${DRAWER_ROOT_ID} .lnsp-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #d8dce6;
      border-top-color: #0a66c2;
      border-radius: 999px;
      animation: lnsp-spin 0.8s linear infinite;
    }

    #${DRAWER_ROOT_ID} .lnsp-loading {
      gap: 0;
      padding: 0;
      background: transparent;
    }

    #${DRAWER_ROOT_ID} .lnsp-loading-header {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      padding: 14px 16px;
      font-size: 13px;
      color: #666666;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
      gap: 12px;
      padding: 14px 16px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-avatar,
    #${DRAWER_ROOT_ID} .lnsp-skeleton-line {
      background: linear-gradient(90deg, #edf3f8 25%, #e2e9f0 50%, #edf3f8 75%);
      background-size: 200% 100%;
      animation: lnsp-shimmer 1.4s infinite linear;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 999px;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-copy {
      display: grid;
      gap: 8px;
      align-content: center;
      padding-top: 2px;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-line {
      height: 11px;
      border-radius: 999px;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-line[data-size='lg'] {
      width: 92%;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-line[data-size='md'] {
      width: 74%;
    }

    #${DRAWER_ROOT_ID} .lnsp-skeleton-line[data-size='sm'] {
      width: 32%;
    }

    @keyframes lnsp-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes lnsp-shimmer {
      from {
        background-position: 200% 0;
      }

      to {
        background-position: -200% 0;
      }
    }
  `;

  document.head.appendChild(style);
}

function createRoot(): HTMLDivElement {
  removeDrawer();
  ensureStyle();
  previousOverflow = document.body.style.overflow;

  const root = document.createElement('div');
  root.id = DRAWER_ROOT_ID;

  const backdrop = document.createElement('div');
  backdrop.className = 'lnsp-backdrop';
  backdrop.addEventListener('click', removeDrawer);

  const drawer = document.createElement('aside');
  drawer.className = 'lnsp-drawer';

  const header = document.createElement('header');
  header.className = 'lnsp-header';

  const title = document.createElement('h2');
  title.className = 'lnsp-title';
  title.textContent = 'Notificacoes';

  const closeButton = document.createElement('button');
  closeButton.className = 'lnsp-close';
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', removeDrawer);

  const list = document.createElement('div');
  list.className = 'lnsp-list';

  header.append(title, closeButton);
  drawer.append(header, list);
  root.append(backdrop, drawer);
  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';
  return root;
}

function getList(root: ParentNode): HTMLDivElement {
  const list = root.querySelector<HTMLDivElement>('.lnsp-list');
  if (list) {
    return list;
  }

  throw new Error('Expected .lnsp-list to exist in notifications drawer.');
}

export function renderLoadingDrawer(): void {
  const root = createRoot();
  const list = getList(root);
  const loading = document.createElement('div');
  loading.className = 'lnsp-loading';

  const header = document.createElement('div');
  header.className = 'lnsp-loading-header';
  const spinner = document.createElement('div');
  spinner.className = 'lnsp-spinner';
  const text = document.createElement('div');
  text.textContent = 'Carregando notificacoes...';
  header.append(spinner, text);
  loading.appendChild(header);

  for (let index = 0; index < 4; index += 1) {
    const skeleton = document.createElement('div');
    skeleton.className = 'lnsp-skeleton';

    const avatar = document.createElement('div');
    avatar.className = 'lnsp-skeleton-avatar';

    const copy = document.createElement('div');
    copy.className = 'lnsp-skeleton-copy';

    const lineOne = document.createElement('div');
    lineOne.className = 'lnsp-skeleton-line';
    lineOne.dataset.size = 'lg';

    const lineTwo = document.createElement('div');
    lineTwo.className = 'lnsp-skeleton-line';
    lineTwo.dataset.size = 'md';

    const lineThree = document.createElement('div');
    lineThree.className = 'lnsp-skeleton-line';
    lineThree.dataset.size = 'sm';

    copy.append(lineOne, lineTwo, lineThree);
    skeleton.append(avatar, copy);
    loading.appendChild(skeleton);
  }

  list.appendChild(loading);
}

export function renderDrawer(items: NotificationItem[]): void {
  const root = createRoot();
  const list = getList(root);

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'lnsp-empty';
    empty.textContent = 'Nenhuma notificacao encontrada.';
    list.appendChild(empty);
  }

  for (const item of items) {
    const link = document.createElement('a');
    link.className = 'lnsp-item';
    link.href = item.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const avatar = document.createElement('div');
    avatar.className = 'lnsp-avatar';
    avatar.textContent = buildAvatarText(item.title);

    const content = document.createElement('div');
    content.className = 'lnsp-content';

    const itemTitle = document.createElement('strong');
    itemTitle.className = 'lnsp-item-title';
    itemTitle.textContent = item.title;

    const subtitle = document.createElement('span');
    subtitle.className = 'lnsp-item-subtitle';
    subtitle.textContent = item.subtitle;

    content.append(itemTitle, subtitle);
    link.append(avatar, content);

    if (isUnreadNotification(item.title)) {
      const unreadDot = document.createElement('div');
      unreadDot.className = 'lnsp-unread-dot';
      link.appendChild(unreadDot);
    }

    list.appendChild(link);
  }
}
