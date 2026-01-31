## 2024-05-23 - [XSS in Print Features via String Concatenation]
**Vulnerability:** Cross-Site Scripting (XSS) in dynamically generated HTML for print windows.
**Learning:** Even when the main application UI uses safe methods like `.textContent`, auxiliary features like "Print" often rely on manual HTML string construction using template literals. These manual constructions bypass the browser's automatic escaping, leading to XSS if user-provided data is included.
**Prevention:** Always use a `sanitizeHTML` utility function to escape HTML entities when building HTML strings from user input. Alternatively, use a temporary DOM element to build the structure safely before extracting the HTML.
