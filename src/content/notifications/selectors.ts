export function isNotificationAnchorCandidate(
  href: string,
  text: string
): boolean {
  const normalizedHref = href.toLowerCase();
  const normalizedText = text.toLowerCase();

  return (
    normalizedHref.includes('/notifications') ||
    normalizedText.includes('notification') ||
    normalizedText.includes('notifica')
  );
}

export function findNotificationAnchor(
  root: ParentNode = document
): HTMLAnchorElement | null {
  const anchors = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('a[href]')
  );

  return (
    anchors.find((anchor) =>
      isNotificationAnchorCandidate(
        anchor.getAttribute('href') ?? '',
        anchor.textContent ?? ''
      )
    ) ?? null
  );
}
