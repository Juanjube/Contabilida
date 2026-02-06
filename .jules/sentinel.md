## 2023-10-27 - [Scope management in security patches]
**Vulnerability:** XSS in dynamic HTML generation.
**Learning:** Even if the application is broken due to missing core functions, a security patch should strictly focus on the security fix to maintain a clean audit trail and adhere to line-count constraints. Architectural restorations should be handled separately.
**Prevention:** Use a separate task or PR for general bug fixes or refactoring, even if they seem minor or necessary for full verification.
