# Current project state — 2026-10-23

## Purpose and current work
Travel festival discovery site (여행고고). Resume entrypoint: this document; detailed continuation evidence: `.goal-harness/EVIDENCE.md`. `STATUS.md` retains the earlier project history and account TODOs.

The existing uncommitted “주말 편집부” redesign stages 1–2 are preserved. This continuation fixes home region searches losing the displayed weekend, adds a keyboard skip link, and allows hash navigation without an unnecessary Auto Ads document reload. Home search uses a native GET form consistent with the existing full-document ad navigation policy.

## Changed files in this continuation
- `components/home/HomeSearch.tsx`, `app/page.tsx`: pass the rendered weekend range into regional GET searches.
- `app/layout.tsx`: skip link and focusable main target.
- `components/ads/AdDocumentGuard.tsx`: history reload only when pathname or query differs from the ad document.
- `.goal-harness/`: goal, plan, executable browser check and evidence.

## Verification
Browser checks passed with synthetic local SQLite data: home, weekend, region, detail at 360/390/768/1440px; no horizontal overflow; search controls in first viewport; keyboard selection/submission and skip focus; selected period retained after refresh; back returns home; outside-weekend event excluded. Screenshots: `output/playwright/redesign-*.png` (ignored). Native tests: 79 passed; lint passed; isolated production build including type validation passed (44 static pages). Local verification scope complete.

## Risks and remaining work
- No physical-device or live production-data verification. User requested Git push for the existing OVH automatic deployment on 2026-10-23. GitHub publication is authorized; OVH deployment success is separate evidence.
- The home date display is informational; arbitrary date selection and detailed program tables are future work. Program tables and editorial recommendations require source data and validity periods.
- Dev static chunks use existing immutable headers; browser verification disables cache. Dummy AdSense test publisher emitted a script-attribute warning; no browser console errors in the final run. This is not ad-delivery verification.
- Existing account TODOs and dependency audit remain in `STATUS.md`.

## Next actions
1. Commit and push the verified redesign with the existing one local commit ahead of origin/main. Record CI separately from OVH deployment evidence.
2. Resume program/source presentation only with program-level evidence; retain unknown states.
3. Address dependency findings in a separately bounded audit.
