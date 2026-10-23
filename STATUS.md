# Status | 마지막: 2026-10-23
> 현재 상태 정본은 `PROJECT_STATE.md`, 이번 재개 작업의 검증 근거는 `.goal-harness/EVIDENCE.md`입니다. 아래는 이전 이력과 계정 TODO를 보존합니다.
## 현재 작업
- 2026-10-23 "주말 편집부" 리디자인 1~2단계 로컬 구현 완료(미커밋·미배포). 설계서 `roadways_redesign_concept_20261023.md`, 브리프 `roadways_master_brief_20261022.md`(Downloads). 변경: 색상 토큰(`globals.css`), 헤더, 홈 히어로+`HomeSearch`, `FestivalListCard` 스타일, `FestivalRow`(주말 목록), `InfoCards`→"가기 전에, 이것만" 패널. 검증: tsc·lint·test 79 통과, 데스크톱 스크린샷 확인(임시 SQLite). 모바일 실기기·키보드 미확인.
- 2026-10-22 AdSense 개선 작업 종료. 커밋 `af54bcc` main push 완료(Vercel 자동 배포). 남은 일은 아래 TODO의 계정 작업.

## 최근 변경 (최근 5개만)
- 2026-10-22: 편집 가이드 12편 + `/guides` 라우트(Article JSON-LD, sitemap, 헤더·푸터·홈·축제 상세 연결), `tests/guides.test.ts` 품질 테스트.
- 2026-10-22: AdSense 재진단·개선 — roadwayskr2 작업 이식(CSP 제외), 얇은 상세 noindex(300자 게이트), 관련 행사 블록, 지역 breadcrumb, 신뢰 페이지 4종 보강, 쿠팡 배너 env 스위치. `docs/adsense/2026-10-22/` 참고.
- 2026-10-01: `/`, `/blog`, `/regions` 허브 페이지 5분 ISR(`revalidate = 300`) 전환 및 `/blog`의 `currentFestivalCondition()` 필터 일원화.
- 2026-10-01: `app/icon.svg` 생성 및 `Organization` JSON-LD 로고 URL(`/icon.svg`) 수정으로 404 해소, `next.config.ts` CSP 헤더 추가 및 팬텀 의존성 제거.
- 2026-10-01: `/api/indexnow` IP 기반 Rate Limiting(분당 5회) 추가, `sync-tourapi.yml`에 `INDEXNOW_KEY` 연동, 미사용 `lib/indexnow.ts` 정리, GitHub Actions `ci.yml` 추가.
- 2026-09-20: 프로덕션 DB 3건(229054, 3000221, 3337617) 일자/장소 정합성 보정 및 `fetchFestivalDetail` 빈 응답 가드 추가.
- 2026-09-08: 취소/종료 행사가 현재 진행 목록·지역·테마·RSS·사이트맵에 노출되지 않도록 `currentFestivalCondition` 일원화.

## TODO
- [x] 리디자인 360/390/768/1440px 브라우저·키보드 검증 및 주말+지역 검색 수정(로컬 가상 데이터). 실기기·커밋·push·배포는 미수행.
- [ ] 리디자인 3단계: 날짜별 프로그램 표·출처 패널(프로그램 단위 데이터 필요), 홈 편집 추천(대상 기간·유효기간 데이터 필요)
- [ ] 마스터 브리프 데이터·SEO 항목 대조(운정 공식 링크 연도, 지역 매핑, page=2 canonical, OG)
- [ ] Vercel 배포 성공 및 `/guides` 정상 노출 확인
- [ ] GSC에 `/guides`·가이드 12편 색인 요청
- [ ] `hello@`·`privacy@roadways.kr` 수신 확인, GA4 데이터 보관 14개월 설정
- [ ] 색인 2~4주 후 AdSense 심사 신청
- [ ] Dependabot 취약점 35건(치명 3·높음 20) 정리
- [ ] (보류) 대표 축제 큐레이터 코멘트 — DB 쓰기 권한·실제 방문 경험 필요
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
