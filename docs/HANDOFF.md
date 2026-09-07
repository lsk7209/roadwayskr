# Current checkpoint — 2026-09-07 Roadways current-event discovery

Goal: original ten-site AdSense quality improvement; this site slice corrects expired events promoted on the homepage. Approval is not guaranteed or claimed.

Local change: app/page.tsx uses lib/current-festivals.ts to restrict latest discoveries to ongoing/upcoming, indexable records ending today or later in Asia/Seoul. Missing dates, cancelled/ended and stale statuses are excluded; archives and DB rows remain unchanged. tests/current-festivals.test.ts executes the actual Drizzle predicate against in-memory libSQL and verifies homepage wiring.

Evidence: initial query test, tsc --noEmit and scoped ESLint passed. Dependency restore pnpm install --frozen-lockfile --ignore-scripts succeeded without extra manifest/lock changes. Follow-up full checks/build/runtime remain pending. Public homepage sample still includes May2026 Miryang event and undated2025 K-rice, confirming before-state, not deployment.

Release risk: primary local b4d12f3 vs origin bb9fc1711da0875af56cec9303eeb6a42965b33d has unrelated histories (45/3; fetched force update). No merge/reset/rebase/force-push. Preserve pre-existing dirty detail route/sitemap/package/lock and untracked .omc, public verification txt, ended-festival test. Full release-surface reconciliation is required before commit/push.

Side effects: local source/test/docs and dependency directory only. No production DB writes, sync/backfill, indexing request, AdSense submission, Git push or Vercel mutation. Original homepage recoverable from local HEAD/origin (identical before task); rollback only the task diff, never unrelated work.

Final local checkpoint: independent Terra review found weekend cancellation gap; app/page.tsx and app/weekend/page.tsx now also compose the same predicate with their existing date-overlap filters.8/8 tests, typecheck, scoped ESLint and full1062page build pass. Build used existing .env.local and includes unrelated pre-existing working changes; not exact-release proof.

Runtime: actual browser home and /weekend200 at390/1280, no horizontal overflow. Latest section8cards and no prior expired Miryang/2025K-rice entries. External ad/analytics requests blocked; not actual serving/CMP proof.

Release method independently reviewed: alternate Git index built from exact remote bb9fc17 plus only five task files; commit parent is remote, no existing branch/index/worktree transition. Normal nonforce push requires unchanged remote parent; hosting exactSHA build and live proof still required. Primary old branch remains untouched and must not later be pushed over the remote.

Next step: construct/review task-only remote-parent commit and normal Git-connected release, then live validation. Dashboard harness: .goal-harness/adsense-top10-improvement-20260907/roadways/.
