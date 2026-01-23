## 2024-05-20 - Initial codebase analysis
**Learning:** The table filtering logic in `script.js` is triggered on every `input` event for certain filters, causing a performance bottleneck.
**Action:** Apply a debounce function to the event listeners to reduce the frequency of table updates.
