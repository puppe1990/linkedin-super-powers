export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface ExtractedPost {
  id: string;
  author: string;
  headline: string;
  contentPreview: string;
  href: string;
  capturedAt: string;
}
