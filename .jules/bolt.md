## 2025-05-22 - Performance Hoisting and Debouncing
**Learning:** Hoisting expensive utility instances like `Intl.NumberFormat` and debouncing frequent input events significantly reduces CPU usage and improves UI responsiveness.
**Action:** Always reuse formatters and debounce 'input' events for real-time filtering.
