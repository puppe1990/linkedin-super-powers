# Superpowers Header Dropdown Design

## Goal

Replace the current `Extrair posts` entry inside the LinkedIn `Eu` menu with a new `Superpowers` dropdown in the page header. The dropdown becomes the extension action hub. In this first version it contains one action, `Extrair posts`, which keeps the current extraction and results rendering flow.

## Scope

In scope:
- remove the extension action from the `Eu` menu binding
- add a `Superpowers` trigger in the LinkedIn header
- open and close a custom dropdown owned by the extension
- render an action list inside that dropdown
- wire the `Extrair posts` action to the existing extraction flow
- keep the existing extracted-posts results panel behavior
- add tests for the new header trigger and action flow

Out of scope:
- new extraction behavior
- new storage format
- additional Superpowers actions
- visual refactors unrelated to the new header dropdown

## Recommended Approach

### Option 1: Custom extension dropdown in the header

Add a small extension-owned trigger and menu near an existing stable LinkedIn header anchor. The menu contains actions and calls project-owned handlers.

Pros:
- easy to extend with more actions later
- avoids coupling to LinkedIn internal dropdown state
- reuses the current posts extraction and panel rendering

Cons:
- requires stable header anchoring logic

### Option 2: Reuse a LinkedIn native dropdown shell

Mount extension actions inside an existing LinkedIn dropdown pattern.

Pros:
- can look more native

Cons:
- much more fragile against DOM or class changes
- harder to reason about open/close state

### Option 3: Button that immediately extracts posts

Make `Superpowers` a direct-action button without a menu.

Pros:
- least code today

Cons:
- blocks the requested future multi-action direction

Recommendation: Option 1.

## UI Behavior

- A new header trigger labeled `Superpowers` is injected once.
- Clicking the trigger toggles the dropdown open and closed.
- The dropdown lists extension actions as clickable items.
- The first action is `Extrair posts`.
- Clicking `Extrair posts` runs the existing extraction controller.
- Extracted posts continue to render in the current results panel.
- Clicking outside the dropdown closes it.
- Rebinding through DOM mutations must not duplicate the trigger or listeners.

## Architecture

### New responsibilities

- `header dropdown module`
  - find a stable LinkedIn header anchor
  - inject the `Superpowers` trigger
  - manage dropdown open/close state
  - render action items
  - expose a binding entry point used by `src/content/index.ts`

### Reused responsibilities

- `posts/controller.ts`
  - still owns extract + persist + render flow

- `posts/dropdown.ts`
  - keeps ownership of the extracted-posts results panel
  - no longer owns the `Eu` menu action binding

### Integration flow

1. content bootstrap binds the notifications link
2. content bootstrap binds the `Superpowers` header dropdown
3. user clicks `Superpowers`
4. dropdown opens with `Extrair posts`
5. user clicks `Extrair posts`
6. existing posts controller extracts, saves, and renders results

## DOM Strategy

- Prefer robust selectors tied to header landmarks or navigation containers, not brittle generated classes.
- Guard all inject operations by fixed IDs or data attributes.
- Use event delegation only where it reduces listener duplication.
- Keep all extension CSS scoped by unique IDs or prefixed class names.

## Error Handling

- If no compatible header anchor is found, binding returns early without throwing.
- If the dropdown already exists, binding returns early.
- If extraction returns zero posts, existing empty-state rendering remains unchanged.
- Any thrown error message added during implementation must include the offending selector or value and expected shape.

## Testing

Add or update tests to cover:
- binding injects one `Superpowers` trigger into the header
- repeated binding does not duplicate the trigger
- clicking the trigger toggles the dropdown visibility
- dropdown renders the `Extrair posts` action
- clicking `Extrair posts` calls the extraction callback with the expected container
- existing results panel rendering still shows extracted posts

## Verification

- run the existing test command for the project
- confirm header binding tests pass
- confirm posts flow tests still pass

## Implementation Notes

- Keep functions between 4 and 20 lines by splitting selector, render, and event logic.
- Avoid introducing abstractions for future actions beyond a small explicit action list needed by this dropdown.
- Touch only the content bootstrap and posts UI modules needed for this change.
