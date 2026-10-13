# Fresh Work Log

## Most Recent Actions
- Added Resources designs v2.0.1 (animated journey + card grid) and v2.0.2 (sidebar timeline + stage shelves) with 100 sample artifacts (`assets/sangam/resources_*.js|css`, check: `node scripts/check_resources_data.mjs`).
- Checked for vulnerabilities (`npm audit fix` applied to fix a moderate `postcss` issue).
- Fixed HTML file truncation and fully restored correct "About" footer links across all variants.
- Enforced Vite dev server to run on port 3000.
- Restarted Vite server (`npm run dev -- --force`) to clear caching issues.
- Added port mapping rules to `AGENTS.md`.

## System Status
- Server is healthy and running on port 3000.
- `index.html` redirects securely to `variants/homepage_v5_special.html`.
