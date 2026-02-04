## 2026-02-04 - [String-based Date Comparison]
**Learning:** In projects using 'YYYY-MM-DD' date formats, string comparison (`localeCompare` or `startsWith`) is significantly faster than instantiating `Date` objects for every comparison in sorting or filtering loops.
**Action:** Prefer string manipulation for date logic when the format allows lexicographical sorting.

## 2026-02-04 - [Intl.NumberFormat Reuse]
**Learning:** Calling `.toLocaleString()` repeatedly in loops is expensive due to repeated initialization of internationalization data.
**Action:** Hoist and reuse a single `Intl.NumberFormat` instance for consistent and performant numeric formatting.
