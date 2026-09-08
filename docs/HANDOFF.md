# Current checkpoint — 2026-09-08 cancelled-event discovery LOCAL

- Goal: continue the DAU-ranked non-READY AdSense quality workflow by keeping cancelled events out of every surface described as current/ongoing; no approval prediction or account mutation.
- Source gate: isolated clone `D:/web/_worktrees/roadways/cancelled-current-20260908` is based on canonical remote `main` commit `4e65239deca9047f00cacafc48eea52663119a1b`. The stale, unrelated-history, dirty primary checkout remains untouched.
- Defect: homepage/weekend used `currentFestivalCondition`, but region/theme counts and lists, RSS, and sitemap used weaker filters. A cancelled future-dated event could be counted/listed and advertised in RSS/sitemap even though its detail metadata is `noindex`.
- Repair: all current-discovery queries reuse the canonical Asia/Seoul-aware condition: indexable, status ongoing/upcoming, and end date today or later. Existing area/theme/month-overlap predicates remain composed with it, including directly visited monthly pages.
- Intended files: seven runtime discovery files, `tests/current-festivals.test.ts`, `tests/ended-festival-indexing.test.ts`, and this handoff.
- Tests-first: new surface-wiring test failed on regions before repair. Final full test suite 9/9, TypeScript, scoped ESLint, and diff check pass.
- Validation gap: local full build compiled and typechecked, then failed during page-data collection only because this isolated clone has no `TURSO_DATABASE_URL`. No production credential was copied or fabricated. Same-SHA hosted build is the release gate.
- Side effects: dependency install only in the isolated clone. No DB read/write, sync, content publication, account/CMP, AdSense submission, indexing notification, or direct Vercel mutation.
- Rollback: revert the focused release commit; no data/account rollback required.
- Single next step: independent actual-diff review, exact-file commit/push, then same-SHA hosted build and public region/theme/feed/sitemap verification.

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
