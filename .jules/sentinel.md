## 2026-02-01 - [XSS in Print Features]
**Vulnerability:** User-controlled data from `localStorage` was being used to build HTML strings via concatenation and then rendered into a new window using `document.write()`. This allowed for Cross-Site Scripting (XSS) if a user entered malicious payloads into expense descriptions or categories.
**Learning:** Even if the main application UI uses safe methods like `textContent` to render data, secondary features like "print" or "export" that generate HTML strings manually can re-introduce XSS vulnerabilities.
**Prevention:** Always sanitize or escape user-controlled data before inserting it into any HTML string, regardless of where it is rendered. Use a dedicated `escapeHTML` utility for these cases.
