## 2025-05-15 - [Data Processing and Formatting Optimization]
**Learning:** In applications handling large datasets in the frontend (like an expense tracker), repeated instantiation of `new Date()` objects and `Intl.NumberFormat` instances (via `.toLocaleString()`) inside loops for sorting, filtering, and formatting creates significant overhead. Reusing a hoisted `Intl.NumberFormat` and utilizing the fact that `YYYY-MM-DD` dates can be compared lexicographically as strings provides a major performance boost without sacrificing readability.

**Action:** Always hoist expensive utility dependencies like `Intl.NumberFormat` and prefer string-based comparisons/manipulations for ISO-formatted dates in performance-critical loops.
