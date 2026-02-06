## 2026-02-06 - [Accessibility: Semantic buttons for floating icons]
**Learning:** In this vanilla JS project, interactive floating icons were implemented using div elements, making them inaccessible to keyboard users and screen readers. Converting them to <button> elements is the most robust fix, but it requires resetting default browser button styles (border, padding, background) to preserve the original floating design.
**Action:** Always prefer semantic <button> for any clickable icon and include explicit CSS resets to maintain the intended floating or icon-only visual style.
