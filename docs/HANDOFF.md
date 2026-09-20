# Current checkpoint — 2026-09-20 12:43 KST, three-row production repair and source smoke verified

Goal: continue Roadways improvement after user ㄱㄱㄱ. The exact three-row production repair is complete and the reviewed source bundle builds against the configured environment. No push/deployment was run. Current production rows 229054/3000221/3337617 re-read successfully; undated count is 283. Local production-DB smoke returned HTTP200 with dates/venues for all three; 3000221 is noindex because ended.

Fresh validation: `pnpm build` PASS (27 static pages); prior 38 tests/lint/typecheck/diff, HTTP32 and browser13 remain PASS. Smoke server on port3021 was ownership-checked and stopped. Before-image and after verification are in `.goal-harness/private/`; no sync/backfill for remaining283, no public cache refresh, no push/deploy, no account/analytics/ad actions. User `STATUS.md` and `ddd/` preserved.

Single next step: separate explicit release action (stage/commit/push and deployment decision). Build artifacts from local production DB remain local evidence only.

# Previous checkpoint — 2026-09-20 10:34 KST, production parity and local repair proposal verified

Goal: user ㄱㄱㄱ continuation of ddd improvement; verify same production data and prepare release evidence. Local slice COMPLETE; production repair/push/deployment NOT_RUN. Main/remote observed f2c717b6201a2671d420ffee101aab7feb29be86; changes uncommitted. See docs/roadways/improvement-20260920/CONTINUATION_REPORT.md for current results; original COMPLETION_REPORT.md is historical first-phase proof.

Completed: SELECT-only864 festival snapshot, protected8 public/local HTTP+canonical+robots parity (Gangwon mismatch resolved with real data), 286 undated records identified. TourAPI10 bounded GETs returned no usable target details; official MCST/Seoul/Hwaseong sources support three reviewed repairs. New fetchFestivalDetail guard rejects empty/mismatched/identity-only/whitespace/unknown-only responses before importer upsert. Detail source-link wording clarified; private snapshots and env variants ignored. New snapshot/parity/read/repair simulation/check scripts added; roadways-local supports fixture/snapshot/repaired datasets. data-repair-plan.json + repair-simulation.json describe exactly229054/3000221/3337617, preserving URLs/editorial/index/raw/sync fields. Local repaired.db changed only3/864 rows, leaving861 identical. No remote mutation.

Fresh validation:38/38 tests, lint/typecheck/diff check, final isolated build27 static pages PASS; HTTP32 parity/repair assertions +12sampled routes200; browser13 checks (Seoul page2=15, repaired dates/venues,360/390/1280 no overflow). Browser blocked all external requests; images/fonts absent in screenshots, not real ads/CMP proof. Independent Luna read-only review passed after identity-only regression fix. Spark failed Unknown model; same bounded lane retried once with Luna max. User STATUS.md SHA256 equals .goal-harness/STATUS.preexisting.md; ddd untouched.

Recovery: .goal-harness/private/production-20260920.json (SHA256 c5360dbcc292b35a64d3ecd9c1cf061770a5ab33f1b35c15306436058adadc63), parity.db unchanged, repaired.db local only; original local.db193 and synthetic test-data.db265 retained. .next is a local repaired-data build and must not be deployed. Original task backup preexisting.patch/STATUS.preexisting.md retained. Own browser roadways-parity closed; localhost3020 server PID79456 stopped after verifying its next-start command and roadways-local parent PID75044. Preserve unrelated services.

Risks: public229054 cache contains details missing from DB; do not release dynamic detail blindly. Remaining283 undated rows after proposed3-row repair are outside verified repair scope. Individual optional-field deletion/invalid date semantics are not solved by empty-response guard. Actual accounts/CMP/GSC/rights and Vercel integration remain unverified. No full CI test/build workflow currently enforces local checks. No stage/commit/push, deploy/Vercel/account changes, sync/backfill, notifications, ad clicks, or live analytics events.

Production repair checkpoint 2026-09-20 12:34 KST: user replied ㄱㄱ. Fresh exact before comparison passed; conditional transaction updated exactly content_id 229054, 3000221, 3337617. Before-image `.goal-harness/private/production-repair-before-2026-09-20T03-34-16.152Z.json`, after verification `production-repair-after.json`. Re-read confirms dates/status/venues/source links; undated count 286 -> 283. No other tables changed. Public cache has not been refreshed because code push/deployment were not authorized; do not claim public page parity after this DB write.

Release-readiness checkpoint 2026-09-20 12:43 KST: `pnpm build` with configured environment passed (27 static pages). A local port3021 server reading the current production DB returned HTTP200 for all three repaired details, with dates/venues present; 229054 and3337617 indexable, 3000221 ended/noindex. Server was stopped after ownership verification. No public cache refresh, push or deployment.

Single next step: decide separately whether to stage/commit/push the reviewed code bundle and deploy it. Before any deployment, build from source against an approved environment and recheck public detail/list routes. Never git add -A; exclude user STATUS.md/ddd/private DBs/env/backup patches. Do not run sync/backfill for the remaining 283 rows.

# Historical checkpoint — 2026-09-20 09:51 KST, local improvements complete

Goal: implement ddd RW-00..14 locally and submit an evidence-backed report. Main f2c717b; changes are uncommitted. Date/query/pagination, monthly archives, sourced schedule/program places, copy/privacy, ad lifecycle, minimal analytics hooks, importer editorial/URL preservation, schema and font fixes implemented. Final evidence: 37/37 tests, lint/typecheck/diff check, isolated production build27 static pages, HTTP25 assertions, protected8+additional4 all200, browser13 assertions and360/390/1280 screenshots. Korean slug/Location-header regressions found during verification are repaired. See docs/roadways/improvement-20260920/COMPLETION_REPORT.md and changed-files.json for complete RW/T dispositions, exact files and limitations.

User STATUS.md matches its original SHA256; ddd unchanged. Backup: .goal-harness/preexisting.patch and STATUS.preexisting.md. Original local.db193 rows was read-only; test-data.db265 rows includes72 synthetic rows, including two protected IDs absent locally. Current .next is a fixture build: do not deploy it. Owned localhost:3020 and roadways-check browser stopped; unrelated services preserved. No push/deploy, sync/backfill, production DB/account changes, messages, ad clicks or live analytics events. An early dummy ad loader request escaped the first glob; final browser used full external blocking except verified font and a mock loader.

Risks: production data parity (notably Gangwon index vs local1-item noindex under existing threshold), legacy missing date search fields, actual AdSense/CMP/consent/GSC, image rights and operator retention remain unverified. Dynamic detail requests increase DB reads; monitor only after a separately authorized release. Rollback only task files/diff; retain STATUS.md/ddd/local.db and original user work. No data/account rollback needed. Single next step: review this local change bundle and arrange a separately scoped same-production-data read comparison/release decision. No remaining authorized local implementation work.

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
