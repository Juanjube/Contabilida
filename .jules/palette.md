## 2026-01-31 - [Accessibility of icon-only buttons]
**Learning:** Icon-only interactive elements must use semantic `<button>` tags and `aria-label` attributes to be accessible. Relying on `<i>` tags with `title` or `div` tags with `role="button"` often results in poor keyboard navigation and screen reader support. Removing `outline` on focus for these buttons is a common regression that must be avoided.
**Action:** Always wrap icons in `<button>` with `aria-label`. Use a CSS reset class to maintain visual style while preserving accessibility features like focus rings.

## 2026-01-31 - [Safety for destructive actions]
**Learning:** Destructive actions like deleting data should always have a confirmation step to prevent accidental loss. This is especially important in applications where data is stored locally and might not be easily recoverable.
**Action:** Implement `confirm()` or a modal dialog for all delete operations.
