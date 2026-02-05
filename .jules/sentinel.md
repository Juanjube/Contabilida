## 2025-05-15 - Stored XSS in Print Features
**Vulnerability:** User-controlled data (descriptions, categories, quantities) from `localStorage` was concatenated directly into HTML strings for the printing functionality, then rendered using `document.write`.
**Learning:** Even in static frontend applications, `localStorage` must be treated as an untrusted input source. Relying on form validation (`type="number"`) is insufficient as `localStorage` can be directly manipulated via the console or other scripts.
**Prevention:** Always sanitize data when building HTML strings manually using a robust `escapeHTML` utility. Alternatively, populate a hidden DOM element using `.textContent` and use its `.outerHTML` or clone it for printing.
