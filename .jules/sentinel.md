## 2026-02-02 - Stored XSS in Dynamic Print Generation
**Vulnerability:** The application was vulnerable to Stored XSS because it used string interpolation to build HTML for printable popups using unsanitized user data from `localStorage`.
**Learning:** Even if the main UI uses safe methods like `textContent`, secondary features like "Print" views often use older, less secure patterns like `document.write()` with raw string concatenation.
**Prevention:** Always use a central `escapeHTML` utility when building HTML strings from user-controlled data, or preferably, use DOM APIs (`createElement`, `textContent`) even for printable views.
