import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindPostsHeaderDropdown } from '../../src/content/posts/header-dropdown';

describe('bindPostsHeaderDropdown', () => {
  const onExtract = vi.fn<() => number | Promise<number>>();

  beforeEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = `
      <header>
        <div data-test="global-nav">
          <nav aria-label="Primary Navigation">
            <ul>
              <li><a href="/feed/">Inicio</a></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
    onExtract.mockClear();
  });

  it('injects one Superpowers trigger into the header', () => {
    bindPostsHeaderDropdown(onExtract, document);
    bindPostsHeaderDropdown(onExtract, document);

    const headerAnchor = document.querySelector('nav[aria-label="Primary Navigation"]');
    const headerList = document.querySelector('nav[aria-label="Primary Navigation"] ul');

    expect(headerAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
    expect(headerAnchor?.children).toHaveLength(1);
    expect(headerList?.querySelectorAll('#lnsp-superpowers-root')).toHaveLength(1);
    expect(headerAnchor?.textContent).toContain('Superpowers');
  });

  it('toggles the dropdown and renders the extract action', () => {
    bindPostsHeaderDropdown(onExtract, document);

    const trigger = document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger');
    trigger?.click();

    expect(document.querySelector('#lnsp-superpowers-menu')).not.toBeNull();
    expect(document.body.textContent).toContain('Extrair posts');

    trigger?.click();

    expect(document.querySelector('#lnsp-superpowers-menu')).toBeNull();
  });

  it('closes the dropdown on outside click', () => {
    bindPostsHeaderDropdown(onExtract, document);

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('#lnsp-superpowers-menu')).toBeNull();
  });

  it('calls extraction when the menu action is clicked', async () => {
    vi.useFakeTimers();
    onExtract.mockReturnValue(2);
    bindPostsHeaderDropdown(onExtract, document);

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-menu button')?.click();
    vi.runAllTimers();
    await Promise.resolve();

    expect(onExtract).toHaveBeenCalledTimes(1);
  });

  it('shows loading feedback while extraction is running', async () => {
    vi.useFakeTimers();
    let resolveExtract: ((value: number) => void) | undefined;
    onExtract.mockImplementation(
      () =>
        new Promise<number>((resolve) => {
          resolveExtract = resolve;
        })
    );

    bindPostsHeaderDropdown(onExtract, document);

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    const actionButton = document.querySelector<HTMLButtonElement>('#lnsp-superpowers-menu button');
    actionButton?.click();

    expect(actionButton?.textContent).toBe('Extraindo posts...');
    expect(actionButton?.disabled).toBe(true);
    expect(onExtract).toHaveBeenCalledTimes(0);

    vi.runAllTimers();
    await Promise.resolve();
    expect(onExtract).toHaveBeenCalledTimes(1);

    resolveExtract?.(3);
    await Promise.resolve();

    expect(actionButton?.textContent).toBe('3 posts extraídos');
  });

  it('shows the empty feedback when no post is extracted', async () => {
    vi.useFakeTimers();
    onExtract.mockResolvedValue(0);
    bindPostsHeaderDropdown(onExtract, document);

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    const actionButton = document.querySelector<HTMLButtonElement>('#lnsp-superpowers-menu button');
    actionButton?.click();
    vi.runAllTimers();
    await Promise.resolve();
    await Promise.resolve();

    expect(actionButton?.textContent).toBe('Nenhum post encontrado');
  });

  it('clears the final feedback after a timeout', async () => {
    vi.useFakeTimers();
    onExtract.mockResolvedValue(2);
    bindPostsHeaderDropdown(onExtract, document);

    document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger')?.click();
    const actionButton = document.querySelector<HTMLButtonElement>('#lnsp-superpowers-menu button');
    actionButton?.click();
    vi.runOnlyPendingTimers();
    await Promise.resolve();
    await Promise.resolve();

    expect(actionButton?.textContent).toBe('2 posts extraídos');

    vi.advanceTimersByTime(2500);

    expect(actionButton?.textContent).toBe('Extrair posts');
  });

  it('opens the current menu when a stale menu exists elsewhere', () => {
    document.body.innerHTML = `
      <header>
        <nav aria-label="Primary Navigation"></nav>
      </header>
      <aside>
        <div id="lnsp-superpowers-menu">Menu antigo</div>
      </aside>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const trigger = document.querySelector<HTMLButtonElement>('#lnsp-superpowers-trigger');
    const headerAnchor = document.querySelector('header nav[aria-label="Primary Navigation"]');
    trigger?.click();

    expect(headerAnchor?.querySelectorAll('#lnsp-superpowers-menu')).toHaveLength(1);
  });

  it('ignores unrelated controls outside the header anchor', () => {
    document.body.innerHTML = `
      <header>
        <nav aria-label="Primary Navigation"></nav>
      </header>
      <aside>
        <button id="outside-trigger" type="button">Fora do header</button>
      </aside>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const headerAnchor = document.querySelector('nav[aria-label="Primary Navigation"]');
    const outsideTrigger = document.querySelector('#outside-trigger');

    expect(headerAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
    expect(outsideTrigger).not.toBeNull();
  });

  it('prefers the header anchor over a labeled nav outside the header', () => {
    document.body.innerHTML = `
      <main>
        <nav aria-label="Primary Navigation"></nav>
      </main>
      <header>
        <nav aria-label="Primary Navigation"></nav>
      </header>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const headerAnchor = document.querySelector('header nav[aria-label="Primary Navigation"]');
    const outsideAnchor = document.querySelector('main nav[aria-label="Primary Navigation"]');

    expect(headerAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
    expect(outsideAnchor?.querySelector('#lnsp-superpowers-trigger')).toBeNull();
  });

  it('prefers a labeled nav over an unlabeled nav inside the same header', () => {
    document.body.innerHTML = `
      <header>
        <nav></nav>
        <nav aria-label="Primary Navigation"></nav>
      </header>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const labeledAnchor = document.querySelector('header nav[aria-label="Primary Navigation"]');
    const unlabeledAnchor = document.querySelector('header nav:not([aria-label])');

    expect(labeledAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
    expect(unlabeledAnchor?.querySelector('#lnsp-superpowers-trigger')).toBeNull();
  });

  it('falls back to a plain nav inside the header', () => {
    document.body.innerHTML = `
      <header>
        <nav></nav>
      </header>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const fallbackAnchor = document.querySelector('header nav');

    expect(fallbackAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
  });

  it('mounts the trigger in the nav list instead of as a loose nav child', () => {
    bindPostsHeaderDropdown(onExtract, document);

    const headerAnchor = document.querySelector('nav[aria-label="Primary Navigation"]');
    const headerList = document.querySelector('nav[aria-label="Primary Navigation"] ul');

    expect(headerAnchor?.querySelector(':scope > #lnsp-superpowers-trigger')).toBeNull();
    expect(headerList?.querySelector(':scope > #lnsp-superpowers-root')).not.toBeNull();
  });

  it('prefers the global-nav header area when multiple headers exist', () => {
    document.body.innerHTML = `
      <header>
        <nav aria-label="Secondary Navigation"></nav>
      </header>
      <header>
        <div data-test="global-nav">
          <nav aria-label="Primary Navigation"></nav>
        </div>
      </header>
    `;

    bindPostsHeaderDropdown(onExtract, document);

    const globalNavAnchor = document.querySelector(
      '[data-test="global-nav"] nav[aria-label="Primary Navigation"]'
    );
    const genericHeaderAnchor = document.querySelector(
      'header nav[aria-label="Secondary Navigation"]'
    );

    expect(globalNavAnchor?.querySelectorAll('#lnsp-superpowers-trigger')).toHaveLength(1);
    expect(genericHeaderAnchor?.querySelector('#lnsp-superpowers-trigger')).toBeNull();
  });

  it('does nothing when the header anchor is missing', () => {
    document.body.innerHTML = '<main><section>Sem cabecalho</section></main>';

    bindPostsHeaderDropdown(onExtract, document);

    expect(document.querySelector('#lnsp-superpowers-trigger')).toBeNull();
  });

  it('injects scoped styles once', () => {
    bindPostsHeaderDropdown(onExtract, document);
    bindPostsHeaderDropdown(onExtract, document);

    expect(document.querySelectorAll('#lnsp-superpowers-style')).toHaveLength(1);
  });
});
