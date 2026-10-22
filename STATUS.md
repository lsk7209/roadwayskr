# Status | 마지막: 2026-10-22
## 현재 작업
- 프로젝트 종합 검토 후 P0~P2 아키텍처·성능·보안·SEO·브랜딩·CI 개선 적용 및 검증 완료.

## 최근 변경 (최근 5개만)
- 2026-10-22: 편집 가이드 12편 + `/guides` 라우트(Article JSON-LD, sitemap, 헤더·푸터·홈·축제 상세 연결), `tests/guides.test.ts` 품질 테스트.
- 2026-10-22: AdSense 재진단·개선 — roadwayskr2 작업 이식(CSP 제외), 얇은 상세 noindex(300자 게이트), 관련 행사 블록, 지역 breadcrumb, 신뢰 페이지 4종 보강, 쿠팡 배너 env 스위치. `docs/adsense/2026-10-22/` 참고.
- 2026-10-01: `/`, `/blog`, `/regions` 허브 페이지 5분 ISR(`revalidate = 300`) 전환 및 `/blog`의 `currentFestivalCondition()` 필터 일원화.
- 2026-10-01: `app/icon.svg` 생성 및 `Organization` JSON-LD 로고 URL(`/icon.svg`) 수정으로 404 해소, `next.config.ts` CSP 헤더 추가 및 팬텀 의존성 제거.
- 2026-10-01: `/api/indexnow` IP 기반 Rate Limiting(분당 5회) 추가, `sync-tourapi.yml`에 `INDEXNOW_KEY` 연동, 미사용 `lib/indexnow.ts` 정리, GitHub Actions `ci.yml` 추가.
- 2026-09-20: 프로덕션 DB 3건(229054, 3000221, 3337617) 일자/장소 정합성 보정 및 `fetchFestivalDetail` 빈 응답 가드 추가.
- 2026-09-08: 취소/종료 행사가 현재 진행 목록·지역·테마·RSS·사이트맵에 노출되지 않도록 `currentFestivalCondition` 일원화.

## TODO
- [x] Vercel 환경변수 `INDEXNOW_KEY=cf1bbae352df4a22a23cbf48bb08350d` 설정 완료 (`public/cf1bbae352df4a22a23cbf48bb08350d.txt` 및 `sync-tourapi.yml` 연동 완료)
- [ ] Google Rich Results Test로 BreadcrumbList/CollectionPage 확인
- [ ] 네이버 Search Advisor `/feed.xml` 재검증 확인

## 결정사항
- TourAPI 동기화: GitHub Actions(`.github/workflows/sync-tourapi.yml`)에서 매일 04:00 KST 증분 동기화 실행 및 변경 URL IndexNow 자동 핑.
- CI 검증: GitHub Actions(`.github/workflows/ci.yml`)에서 PR/Push 시 `typecheck`, `lint`, `test` 자동 실행.
- 허브 페이지 캐싱: `/`, `/blog`, `/regions`에 5분(`revalidate = 300`) ISR 적용으로 TTFB 및 Turso DB 읽기 비용 절감.
- 아이콘/스키마: Next.js App Router 파일 규약(`app/icon.svg`) 및 `Organization.logo` 연동으로 404 해소.
- IndexNow: `POST /api/indexnow` → Naver + Bing 동시 핑 (Bearer 인증 + 분당 5회 IP Rate Limit).

## 주의
- Sitemap Index 분할은 현재 45K 제한 임박 아니므로 보류.
