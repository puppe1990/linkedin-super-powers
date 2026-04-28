import { bindPostsHeaderDropdown } from './posts/header-dropdown';
import { extractAndShowFeedPosts } from './posts/controller';
import { openNotificationsDrawer } from './notifications/controller';
import { findNotificationAnchor } from './notifications/selectors';

const BOUND_ATTRIBUTE = 'data-lnsp-bound';

function bindNotificationLink(root: ParentNode = document): void {
  const anchor = findNotificationAnchor(root);

  if (!anchor || anchor.getAttribute(BOUND_ATTRIBUTE) === '1') {
    return;
  }

  anchor.setAttribute(BOUND_ATTRIBUTE, '1');
  anchor.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      void openNotificationsDrawer();
    },
    true
  );
}

bindNotificationLink();
bindPostsHeaderDropdown(() => extractAndShowFeedPosts());

const observer = new MutationObserver(() => {
  bindNotificationLink();
  bindPostsHeaderDropdown(() => extractAndShowFeedPosts());
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
