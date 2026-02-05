## 2026-02-05 - XSS in Print-to-Window Feature
**Vulnerability:** User-controlled data from `localStorage` was concatenated into an HTML string and written to a new window using `document.write()`, allowing for execution of arbitrary scripts.
**Learning:** In a static frontend application without a template engine, manual sanitization is required when using sinks like `document.write()` or `innerHTML`. Even if the main UI uses `textContent`, the reporting/printing features might use more dangerous methods.
**Prevention:** Implement a central `escapeHTML` utility and ensure all dynamic content in generated HTML strings is passed through it. Complement this with a strict Content Security Policy (CSP).
