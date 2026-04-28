import { renderDrawer, renderLoadingDrawer } from './drawer';
import { loadNotificationsFromFrame } from './frame-loader';

export async function openNotificationsDrawer(): Promise<void> {
  renderLoadingDrawer();
  const items = await loadNotificationsFromFrame();
  renderDrawer(items);
}
