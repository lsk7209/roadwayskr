# Status | 마지막: 2026-05-10
## 현재 작업
- 홈 화면을 Airbnb 스타일의 사진 중심 마켓플레이스 디자인으로 개편하고 운영 배포까지 완료.
- `roadways.kr`, `www.roadways.kr` 모두 Vercel 200 OK 확인.
- 운영 기준 AdSense/SEO 체크 32개 전부 통과.

## 최근 변경 (최근 5개만)
- 05-10: 홈 hero/search/행사 카드/FAQ를 Airbnb 톤으로 리디자인
- 05-10: 행사 카드 레이아웃을 세로형 photo-first 카드로 변경해 텍스트 잘림 해결
- 05-10: 전역 색상/그림자/배경 토큰을 흰 캔버스 + Rausch accent 기준으로 정리
- 05-10: Vercel 도메인 alias를 `roadwayskr` 최신 배포에 재연결
- 05-10: IndexNow 공개 키 파일 추가 및 운영 SEO 체크 통과

## TODO
- [ ] 실제 브라우저에서 운영 도메인 캐시 반영 상태를 한 번 더 육안 확인
- [ ] GSC/GA4 실데이터가 쌓이면 하락 페이지와 광고 UX 개선점 재점검

## 결정사항
- 홈 디자인: Airbnb식 흰 캔버스, 사진 중심 카드, 단일 Rausch CTA 톤으로 간다.
- 카드 구조: 가로 텍스트 패널 대신 세로형 카드로 모바일/데스크톱 안정성을 우선한다.

## 주의
- HostingKR 네임서버를 유지하므로 DNS 변경 직후 로컬 캐시가 LiteSpeed 404를 잠시 보일 수 있다.
