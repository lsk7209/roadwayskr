# 적용된 변경사항 — AdSense [AUTO] 항목

일시: 2026-09-13. `PATCH_PLAN.md`의 [AUTO] 항목 중 사용자가 "전체 자동 승인"한 항목만 실행. [REVIEW]/[MANUAL] 8개 항목은 실행하지 않았다.

## 실행됨

### W2. Privacy Policy 쿠키/DoubleClick DART 문구 추가
- 파일: `app/privacy/page.tsx`
- 내용: "4. 제3자 제공" 섹션에 Google 쿠키(DART) 사용 고지 및 Google 광고 설정 링크 추가, 쿠키 차단 방법 안내 문장 추가
- `LAST_UPDATED`를 2026-05-10 → 2026-09-13으로 갱신
- 검증: `pnpm test` 26/26 통과, 로컬 dev 서버에서 `/privacy` 200 응답 및 신규 문구 렌더링 확인

## 실행 안 됨 (REVIEW/MANUAL — 별도 승인 필요)

`PATCH_PLAN.md` 참고. 커밋은 하지 않았습니다 — diff 확인 후 사용자가 직접 커밋 여부를 결정하세요.
