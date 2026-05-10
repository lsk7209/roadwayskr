# Status | 마지막: 2026-05-11
## 현재 작업
- T2 전체 적용 완료. Vercel 배포 후 검증 단계.

## 최근 변경 (최근 5개만)
- 2026-05-11: [T2-1~5] CollectionPage/BreadcrumbList JSON-LD, IndexNow API, 축제 OG 이미지, 브랜드명 통일.
- 2026-05-11: `app/opengraph-image.tsx` 동적 OG 이미지 생성 추가.
- 2026-05-11: `about/page.tsx` title/H1 "About" → "서비스 소개" 수정.
- 2026-05-11: RSS XML 론 서로게이트 필터 추가 (네이버 Search Advisor 오류 수정).
- 2026-05-11: 전체 페이지 가독성 정비 + AutoAds page-level ads 제거 배포.

## TODO
- [ ] Vercel 배포 후 Google Rich Results Test로 CollectionPage/BreadcrumbList 확인
- [ ] 네이버 Search Advisor에서 `/feed.xml` 재검증 확인
- [ ] IndexNow: INDEXNOW_KEY 환경변수 Vercel에 설정 + 키 파일 public/{key}.txt 배포
- [ ] T3 가이드: LCP 이미지 priority, 이미지 사이트맵

## 결정사항
- OG 이미지: `app/opengraph-image.tsx`(사이트 기본) + `app/festivals/.../opengraph-image.tsx`(축제별 동적).
- JSON-LD 빌더: `components/seo/JsonLd.tsx`에 buildCollectionPageLd / buildBreadcrumbListLd 추가.
- IndexNow: POST /api/indexnow → Naver + Bing 동시 핑 (INDEXNOW_KEY 환경변수 필요).

## 주의
- IndexNow 사용 전 INDEXNOW_KEY 환경변수 + public/{key}.txt 파일 배포 필요.
- Sitemap Index 분할은 현재 45K 제한 임박 아니므로 보류.
- 타입/린트 검증은 Stop hook이 자동 처리 (Claude 직접 실행 금지).
