# Task: Roll back to stable state

## Objective
Revert the codebase to the state of commit `982986c`, where the login functionality was working and the UI was stable, even if the OCR API keys were not yet correctly handled.

## Checklist
- [x] Reset the local repository to commit `982986c`
- [x] Verify `next.config.mjs` is back to a stable state
- [x] Ensure `app/page.tsx` is restored to its stable version
- [x] Force push the clean state to the repository
- [x] Reset the local repository to commit `982986c`
- [x] Verify `next.config.mjs` is back to a stable state
- [x] Ensure `app/page.tsx` is restored to its stable version
- [x] Force push the clean state to the repository

## Vercel Migration (In Progress)
- [-] Check for `sitemap.xml` presence (Missing in public/ checking for dynamic)
- [ ] Verify SEO critical components (Redirects, Robot.txt)
- [ ] Guide user through Vercel Import & Env Var setup
- [/] Verify new deployment URL
