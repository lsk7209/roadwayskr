# Status | 마지막: 2026-05-10
## 현재 작업
- /plan 페이지를 정식 메뉴 페이지로 전환했고 한글 중복 라우트는 제거했습니다.
- `roadways.kr` 404 원인은 Vercel 도메인 충돌 및 네임서버 미적용으로 확인했습니다.
- 한글 라우트, 사이트맵, 레이아웃, 주말 페이지 인코딩/문법 오류를 복구하고 검증했습니다.

## 최근 변경 (최근 5개만)
- 05-10: `middleware.ts` 한글 rewrite 매칭을 실제 경로 기준으로 수정
- 05-10: `app/sitemap.ts`, `app/layout.tsx`, `app/weekend/page.tsx` 문법/인코딩 오류 복구
- 05-10: `scripts/adsense-readiness.ts` 로컬 sitemap 절대 URL 검사 오탐 수정
- 05-10: `next.config.ts` 설정 위치와 주석 깨짐 정리
- 05-10: `pnpm typecheck`, `pnpm lint`, `pnpm build`, 로컬 readiness 검사 통과

## TODO
- [ ] `roadways.kr` 네임서버를 `ns1.vercel-dns.com`, `ns2.vercel-dns.com`로 변경
- [ ] Vercel에서 `roadways.kr`를 `roadwayskr`로 단일 할당(필요 시 `--force` 이동)
- [ ] DNS 반영 후 `curl -I https://roadways.kr`, `/robots.txt`, `/sitemap.xml`, `pnpm adsense:check` 재확인
- [ ] 운영 환경에 `INDEXNOW_KEY` 설정
- [ ] 남은 텍스트/메타/링크 인코딩 점검 후 페이지별 QA 리포트 정리

## 결정사항
- `/plan`은 더 이상 리다이렉트가 아니라 독립 페이지로 운영한다.
- 한글 라우트는 `middleware.ts` rewrite로 유지하고 legacy 중복 static route는 제거한다.

## 주의
- 현재 `roadways.kr`은 외부 조회 시 `LiteSpeed 404`가 계속 노출되어 SEO/광고 심사 진행은 보류한다.
