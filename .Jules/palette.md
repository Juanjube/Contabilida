## 2026-02-01 - [Accessibility for interactive elements]
**Learning:** Non-semantic interactive elements (divs, icons) are invisible to screen readers and keyboard users. Converting them to buttons with aria-labels is a high-impact, low-risk micro-UX win.
**Action:** Always check for non-focusable icons used as buttons and wrap them in semantic <button> tags with appropriate ARIA labels.
