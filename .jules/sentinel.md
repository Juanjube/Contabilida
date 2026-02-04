## 2026-02-04 - Hoisting and ReferenceErrors in Global Stubs
**Vulnerability:** Application crash due to missing global functions (`window.getBillIncomes`, etc.) and `ReferenceError` when calling utility functions like `formatNumberWithDots` before they are initialized.
**Learning:** Functions defined inside a `DOMContentLoaded` listener are not globally hoisted. If they are needed by global window-level stubs or other listeners, they must be hoisted to the top level of the script.
**Prevention:** Always place shared utility functions at the top level of `script.js` to ensure they are available during the entire lifecycle of the application, including initialization of other modules or event listeners.

## 2026-02-04 - XSS in Dynamic Window Document Writing
**Vulnerability:** High priority XSS in features that open new windows (e.g., printing) and build HTML content using string concatenation of user-provided data.
**Learning:** While the main UI might be safe (using `.textContent`), features that generate report-style HTML in new windows often bypass these protections by using `document.write()` or template literals.
**Prevention:** Always use a sanitization or escaping function (like `escapeHTML`) for EVERY user-controlled variable being concatenated into an HTML string, especially for report generation.
