# Status | 마지막: 2026-05-11
## 현재 작업
- T2 + T3(LCP priority) 전체 완료. 배포됨.

## 최근 변경 (최근 5개만)
- 2026-05-11: [T3] LCP priority — 모든 목록 페이지 첫 번째 카드 preload 적용.
- 2026-05-11: [T2-1~5] CollectionPage/BreadcrumbList JSON-LD, IndexNow API, 축제 OG 이미지, 브랜드명 통일.
- 2026-05-11: `app/opengraph-image.tsx` 동적 OG 이미지 생성 추가.
- 2026-05-11: `about/page.tsx` title/H1 "About" → "서비스 소개" 수정.
- 2026-05-11: RSS XML 론 서로게이트 필터 추가 (네이버 Search Advisor 오류 수정).

## TODO
- [ ] Vercel 환경변수 INDEXNOW_KEY 설정 + public/{key}.txt 배포 → IndexNow 활성화
- [ ] Google Rich Results Test로 BreadcrumbList/CollectionPage 확인
- [ ] 네이버 Search Advisor /feed.xml 재검증 확인

## 결정사항
- JSON-LD 빌더: `components/seo/JsonLd.tsx`에 buildCollectionPageLd / buildBreadcrumbListLd 추가.
- OG 이미지: 사이트 기본(`app/opengraph-image.tsx`) + 축제별(`app/festivals/.../opengraph-image.tsx`).
- IndexNow: POST /api/indexnow → Naver + Bing 동시 핑 (INDEXNOW_KEY 환경변수 필요).

## 주의
- IndexNow 사용 전 INDEXNOW_KEY 환경변수 + public/{key}.txt 파일 배포 필요.
- Sitemap Index 분할은 현재 45K 제한 임박 아니므로 보류.
- 타입/린트 검증은 Stop hook이 자동 처리 (Claude 직접 실행 금지).
