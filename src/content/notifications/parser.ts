import type { NotificationItem } from '../../shared/types';

const BLOCKED_TITLES = new Set([
  'atualizacoes do feed novas notificacoes inicio',
  'inicio',
  'minha rede',
  'vagas',
  'mensagens',
  'notificacoes',
  'ver configuracoes'
]);

function normalizeText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getAnchorTitle(anchor: HTMLAnchorElement): string {
  const ariaLabel = normalizeText(anchor.getAttribute('aria-label'));
  if (ariaLabel) {
    return ariaLabel;
  }

  return normalizeText(anchor.textContent);
}

function getAnchorSubtitle(anchor: HTMLAnchorElement): string {
  const time = anchor.querySelector('time');
  return normalizeText(time?.textContent);
}

function toAbsoluteUrl(href: string): string {
  return new URL(href, 'https://www.linkedin.com').toString();
}

function isBlockedTitle(title: string): boolean {
  return BLOCKED_TITLES.has(normalizeKey(title));
}

function hasNotificationWords(title: string): boolean {
  const key = normalizeKey(title);
  return (
    key.includes('notificacao') ||
    key.includes('publicacao') ||
    key.includes('coment') ||
    key.includes('reag') ||
    key.includes('curti') ||
    key.includes('anivers') ||
    key.includes('visualizou') ||
    key.includes('mencionou') ||
    key.includes('mensagem')
  );
}

function findNotificationAnchor(
  time: HTMLTimeElement
): HTMLAnchorElement | null {
  const directAnchor = time.closest('a[href]');
  if (directAnchor instanceof HTMLAnchorElement) {
    return directAnchor;
  }

  const container = time.closest(
    '[role="listitem"], li, article, section, div'
  );
  if (!container) {
    return null;
  }

  const anchors = Array.from(
    container.querySelectorAll<HTMLAnchorElement>('a[href]')
  );
  return (
    anchors.find((anchor) => {
      const title = getAnchorTitle(anchor);
      return title.length > 20 && !isBlockedTitle(title);
    }) ?? null
  );
}

function buildNotificationItem(
  anchor: HTMLAnchorElement
): NotificationItem | null {
  const href = anchor.getAttribute('href') ?? '';
  const title = getAnchorTitle(anchor);

  if (!href || !title || href === '/notifications/' || isBlockedTitle(title)) {
    return null;
  }

  return {
    id: href,
    title,
    subtitle: getAnchorSubtitle(anchor),
    href: toAbsoluteUrl(href)
  };
}

export function extractNotificationsFromDocument(
  root: ParentNode
): NotificationItem[] {
  const seen = new Set<string>();
  const items: NotificationItem[] = [];

  for (const time of Array.from(
    root.querySelectorAll<HTMLTimeElement>('time')
  )) {
    const anchor = findNotificationAnchor(time);
    const item = anchor ? buildNotificationItem(anchor) : null;

    if (!item || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    items.push(item);
  }

  if (items.length > 0) {
    return items;
  }

  for (const anchor of Array.from(
    root.querySelectorAll<HTMLAnchorElement>('a[href]')
  )) {
    const item = buildNotificationItem(anchor);
    if (!item || !hasNotificationWords(item.title) || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    items.push(item);
  }

  return items;
}

export function extractNotificationsFromHtml(html: string): NotificationItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return extractNotificationsFromDocument(doc);
}
