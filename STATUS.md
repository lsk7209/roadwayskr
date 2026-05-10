# Status | 마지막: 2026-05-11
## 현재 작업
- 개발 검토 완료. RSS 수정·About title·OG 이미지 추가 배포됨.
- 다음: CollectionPage + BreadcrumbList JSON-LD 추가 (Step 4).

## 최근 변경 (최근 5개만)
- 2026-05-11: `app/opengraph-image.tsx` 동적 OG 이미지 생성 추가.
- 2026-05-11: 축제 상세 OG 이미지 폴백 추가 (`/opengraph-image`).
- 2026-05-11: `about/page.tsx` title/H1 "About" → "서비스 소개" 수정.
- 2026-05-11: RSS XML 론 서로게이트 필터 추가 (네이버 Search Advisor 오류 수정).
- 2026-05-11: 전체 페이지 가독성 정비 + AutoAds page-level ads 제거 배포.

## TODO
- [ ] 네이버 Search Advisor에서 `/feed.xml` 재검증 확인
- [ ] CollectionPage JSON-LD 추가: regions/[areaSlug], themes/[themeSlug], monthly 페이지
- [ ] BreadcrumbList JSON-LD 추가: 축제 상세 페이지
- [ ] Google Rich Results Test로 Event 스키마 리치 스니펫 확인

## 결정사항
- OG 이미지: `app/opengraph-image.tsx`로 동적 생성 (static 파일 불필요).
- WordPress가 아닌 Next.js 앱 구조이므로 플러그인/테마 최적화는 코드 단위로 처리.

## 주의
- Sitemap Index 분할은 현재 45K 제한 임박 아니므로 보류.
- 타입/린트 검증은 Stop hook이 자동 처리 (Claude 직접 실행 금지).
