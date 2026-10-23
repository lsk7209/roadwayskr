# Redesign continuation evidence — 2026-10-23

## Scope and environment
Local changes only. SQLite fixture contains four explicitly synthetic rows: one weekend event per Seoul/Gyeonggi/Jeju and one Seoul event outside the weekend. No production DB reads/writes, hosting operations, sync, or deployment. Existing redesign changes preserved.

## Reproduction and repair
- Before: browser selected Seoul and submitted HomeSearch; URL had no dates, region showed two events including January 2027 outside the displayed October 24–25 weekend. Explicit date assertion failed with `REGRESSION: weekend range lost on region submission`.
- Repair: pass server `satIso`/`sunIso` to HomeSearch. Native GET form serializes hidden `from`/`to` only for a selected region; nationwide uses `/weekend`.
- Keyboard review: added skip link to focusable main. Raw anchor/history interaction initially lost focus; use Next Link for framework hash focus and guard reload only on a different pathname/query. Final keyboard checks pass.
- During diagnosis, browser reused old dev chunks due existing immutable cache headers. Final check disables cache via CDP. Earlier failing iterations are not final-state results.
- Temporary fixture creation initially failed because top-level await was incompatible with this CommonJS project; wrapping in async main resolved it. Fixture stayed isolated.

## Final browser check
Command: `npx.cmd --no-install @playwright/cli -s=roadways-resume run-code --filename .goal-harness/browser-check.js`
Result: exit 0, all executable assertions passed, 16 screenshots produced. Evidence log: `output/playwright/redesign-browser-check.log`.
- First Tab reaches visible skip link; Enter focuses main.
- Keyboard region choice, focus outline, Tab to submit, Enter to search.
- Seoul URL has `from=2026-10-24&to=2026-10-25`; period text matches; January fixture absent.
- Refresh preserves filter and results; Back returns home; nationwide search shows weekend results.
- Home/weekend/region/detail HTTP 200 and no horizontal overflow at 360,390,768,1440px.
- Home controls remain within 900px initial viewport; submit height at least 44px.
- Screenshots visually sampled: home 360px and detail 390px. Other layouts have automated measurements and screenshots; physical devices not tested.
- Final browser console: 0 errors; dummy AdSense script warning about `data-nscript`. No ad-delivery claim.

## Native checks
- `pnpm.cmd test`: exit 0, 79 passed / 0 failed (final rerun after source changes).
- `pnpm.cmd lint`: exit 0, no findings (final rerun).
- `pnpm.cmd typecheck`: exit 0 before the final small navigation adjustments; final build performs type validation again.
- `node scripts/roadways-local.mjs build`: exit 0; compilation, lint/type validation and 44 static pages passed. Isolated fixture URL overrides remote settings. Existing edge-runtime/static-generation advisory only.
- `git diff --check`: passed; line-ending warning only.

## Independent review and cost record
One read-only explorer, selectable `gpt-6-luna`, max reasoning. Two bounded reviews: original search routing, then final search/skip/ad-guard changes. No concrete remaining regressions reported. Main agent owns edits and verification. Spark and the older `gpt-5.6-luna` identifier were not selectable in this runtime. Token/cost: not measured. Elapsed: not measured precisely; repeated browser checks were driven by observed failures, stale cache and final repairs.

## Limitations
No new program-level data or invented editorial recommendations. No live production or physical-device verification. Recovery: revert the specific redesign commit; preserve earlier work and source data.

## Git publication — user request 2026-10-23
User states Git push triggers existing OVH automatic deployment and supplies `D:\server-ovhcloud\.env`. Inspected environment key names only: backup/healthcheck settings, no deployment connection configuration. GitHub repository hook listing returned no entries; this does not rule out server-side polling or another deployment integration. No server or hosting configuration changed.
`git fetch origin` succeeded; main is ahead by one existing commit, behind by zero. The existing local commit is `a544874` (Event schema and empty-state improvements), already included in the validated working tree. Publish it together with the reviewed redesign. Deployment destination/success remains unverified; execution boundary is Git push.
