## 2024-07-25 - Avoid Unintended Dependency Commits

**Learning:** Running `npm install` to add a testing library like Playwright can create `package.json` and `package-lock.json` files. If these files are not part of the required changes, they must be removed before submitting the code for review. Committing them is considered an out-of-scope modification that will block approval.

**Action:** After using `npm` or any other package manager for one-off testing or verification, I must always check for and remove any generated dependency files (`package.json`, `package-lock.json`, `node_modules`) before finalizing my changes. I will use `git status` or `list_files` to ensure only the intended files are part of the commit.
