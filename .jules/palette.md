## 2026-02-02 - [Standardizing Accessible Action Buttons]
**Learning:** Icon-only actions implemented as `<i>` tags are inaccessible and lack feedback. Wrapping them in semantic `<button>` elements with `aria-label` and `confirm()` improves both A11y and safety. Using a helper function reduces redundancy and keeps the patch under line limits.
**Action:** Use a `createDeleteButton` helper to standardize trash icons and use Bootstrap utility classes (`btn btn-link p-0`) to avoid custom CSS bloat.
