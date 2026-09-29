const TRIGGER_ID = 'lnsp-superpowers-trigger';
const MENU_ID = 'lnsp-superpowers-menu';
const STYLE_ID = 'lnsp-superpowers-style';
const ROOT_ID = 'lnsp-superpowers-root';
const STATUS_CLEAR_DELAY_MS = 2500;
const ACTION_BUTTON_LABEL = 'Extrair posts';
const outsideClickHandlers = new WeakMap<HTMLElement, EventListener>();
const clearStatusTimers = new WeakMap<HTMLElement, number>();

type ExtractPostsAction = () => number | Promise<number>;
type MenuAction = () => void;

function waitForUiPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${ROOT_ID} {
      position: relative;
      display: flex;
      align-items: center;
      list-style: none;
    }

    #${TRIGGER_ID} {
      border: 0;
      background: transparent;
      color: #0a66c2;
      font: inherit;
      font-weight: 600;
      padding: 0 12px;
      min-height: 52px;
      cursor: pointer;
    }

    #${MENU_ID} {
      position: absolute;
      z-index: 1000;
      top: calc(100% - 6px);
      left: 50%;
      transform: translateX(-50%);
      min-width: 180px;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
      overflow: hidden;
    }

    #${MENU_ID} button {
      width: 100%;
      border: 0;
      background: transparent;
      color: #191919;
      font: inherit;
      text-align: left;
      padding: 12px 16px;
      cursor: pointer;
    }

    #${MENU_ID} button:hover {
      background: #f3f6f8;
    }
  `;

  document.head.appendChild(style);
}

function findHeaderAnchor(root: ParentNode): HTMLElement | null {
  const globalNav = root.querySelector<HTMLElement>('[data-test="global-nav"]');
  if (globalNav) {
    return (
      globalNav.querySelector<HTMLElement>('nav[aria-label]') ??
      globalNav.querySelector<HTMLElement>('nav')
    );
  }

  const header = root.querySelector<HTMLElement>('header');
  if (!header) {
    return null;
  }

  return (
    header.querySelector<HTMLElement>('nav[aria-label]') ??
    header.querySelector<HTMLElement>('nav')
  );
}

function findExistingTrigger(anchor: HTMLElement): HTMLButtonElement | null {
  return anchor.querySelector<HTMLButtonElement>(`#${TRIGGER_ID}`);
}

function findTriggerMount(anchor: HTMLElement): HTMLElement {
  const list = anchor.querySelector<HTMLElement>('ul');
  if (!list) {
    return anchor;
  }

  const item = document.createElement('li');
  item.id = ROOT_ID;
  return list.appendChild(item);
}

function findOwner(trigger: HTMLButtonElement): HTMLElement | null {
  return trigger.closest<HTMLElement>(`#${ROOT_ID}`) ?? trigger.parentElement;
}

function findActionButton(owner: HTMLElement): HTMLButtonElement | null {
  return owner.querySelector<HTMLButtonElement>(`#${MENU_ID} button`);
}

function cancelClearStatus(owner: HTMLElement): void {
  const timer = clearStatusTimers.get(owner);
  if (timer === undefined) {
    return;
  }

  window.clearTimeout(timer);
  clearStatusTimers.delete(owner);
}

function scheduleClearStatus(owner: HTMLElement): void {
  cancelClearStatus(owner);
  const timer = window.setTimeout(() => {
    const button = findActionButton(owner);
    if (button) {
      button.textContent = ACTION_BUTTON_LABEL;
      button.disabled = false;
    }
    clearStatusTimers.delete(owner);
  }, STATUS_CLEAR_DELAY_MS);
  clearStatusTimers.set(owner, timer);
}

function setActionState(
  trigger: HTMLButtonElement,
  message: string,
  disabled: boolean
): void {
  const owner = findOwner(trigger);
  if (!owner) {
    return;
  }

  const button = findActionButton(owner);
  if (!button) {
    return;
  }

  button.textContent = message;
  button.disabled = disabled;
}

function setLoadingState(trigger: HTMLButtonElement): void {
  const owner = findOwner(trigger);
  if (!owner) {
    return;
  }

  cancelClearStatus(owner);
  setActionState(trigger, 'Extraindo posts...', true);
}

function setResultState(trigger: HTMLButtonElement, count: number): void {
  const owner = findOwner(trigger);
  if (!owner) {
    return;
  }

  const message =
    count === 0 ? 'Nenhum post encontrado' : `${count} posts extraídos`;
  setActionState(trigger, message, false);
  scheduleClearStatus(owner);
}

function setErrorState(trigger: HTMLButtonElement): void {
  const owner = findOwner(trigger);
  if (!owner) {
    return;
  }

  setActionState(trigger, 'Falha ao extrair posts', false);
  scheduleClearStatus(owner);
}

async function runExtraction(
  trigger: HTMLButtonElement,
  onExtract: ExtractPostsAction
): Promise<void> {
  if (findActionButton(findOwner(trigger) ?? document.body)?.disabled) {
    return;
  }

  setLoadingState(trigger);
  await waitForUiPaint();

  try {
    const count = await onExtract();
    setResultState(trigger, count);
  } catch {
    setErrorState(trigger);
  }
}

function buildActionButton(onExtract: MenuAction): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = ACTION_BUTTON_LABEL;
  button.addEventListener('click', () => {
    onExtract();
  });
  return button;
}

function buildMenu(onExtract: MenuAction): HTMLDivElement {
  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.appendChild(buildActionButton(onExtract));
  return menu;
}

function unbindOutsideClick(owner: HTMLElement): void {
  const handler = outsideClickHandlers.get(owner);
  if (!handler) {
    return;
  }

  document.removeEventListener('click', handler);
  outsideClickHandlers.delete(owner);
}

function closeMenu(owner: HTMLElement): void {
  owner.querySelector<HTMLElement>(`#${MENU_ID}`)?.remove();
  unbindOutsideClick(owner);
}

function bindOutsideClick(owner: HTMLElement): void {
  const handler = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Node) || owner.contains(target)) {
      return;
    }

    closeMenu(owner);
  };

  document.addEventListener('click', handler);
  outsideClickHandlers.set(owner, handler);
}

function toggleMenu(trigger: HTMLButtonElement, onExtract: MenuAction): void {
  const owner = findOwner(trigger);
  if (!owner) {
    return;
  }

  const existing = owner.querySelector<HTMLElement>(`#${MENU_ID}`);
  if (existing) {
    closeMenu(owner);
    return;
  }

  owner.appendChild(buildMenu(onExtract));
  bindOutsideClick(owner);
}

function buildTrigger(onExtract: MenuAction): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = TRIGGER_ID;
  button.type = 'button';
  button.textContent = 'Superpowers';
  button.addEventListener('click', () => toggleMenu(button, onExtract));
  return button;
}

export function bindPostsHeaderDropdown(
  onExtract: ExtractPostsAction,
  root: ParentNode = document
): void {
  ensureStyle();

  const anchor = findHeaderAnchor(root);
  if (!anchor) {
    return;
  }

  if (findExistingTrigger(anchor)) {
    return;
  }

  const trigger = buildTrigger(() => {
    void runExtraction(trigger, onExtract);
  });
  findTriggerMount(anchor).appendChild(trigger);
}
