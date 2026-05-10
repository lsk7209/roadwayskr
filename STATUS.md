# Status | 마지막: 2026-05-10
## 현재 작업
GitHub 첫 커밋/푸시 준비
## 최근 변경 (최근 5개만)
- 05-10: 상세 페이지에 TourAPI `intro.program` 원문 프로그램 섹션 추가
- 05-10: 운영 Turso 스키마 적용 및 TourAPI 행사 193건 동기화 완료
- 05-10: `/api/health`와 `vercel.json` 6시간 점검 cron 추가
- 05-10: Vercel `roadwayskr` 운영 배포 및 AdSense 22/22 검증 완료
- 05-10: Git push 기반 자동 Vercel 배포 원칙 반영
## TODO
- [ ] Gabia DNS: `@ A 76.76.21.21`, `www CNAME cname.vercel-dns.com` 적용
- [ ] DNS 반영 후 `SITE_URL=https://gogotrip.kr`로 재설정 후 재배포
## 결정사항
- 브랜드: gogotrip.kr / 여행고고 유지
- 우선순위: 복원+실행 가능한 기준선 먼저 구축
- 라우팅: 외부 URL은 한글 유지, 내부 App Router 폴더는 Windows dev 안정성을 위해 ASCII 사용
- 데이터: KorService2 GW는 areacode 빈 값이 있어 lDongRegnCd로 17개 시도 매핑
- 배포: Vercel 직접 배포 금지, Git push 후 자동 Vercel 배포만 사용
- Vercel GitHub 연동: 사용자가 직접 처리, Codex는 명시 요청 전 연결/변경 금지
## 주의
- .env.local은 운영 Turso 기준이며 토큰 출력/커밋 금지
- 현재 운영 URL은 `https://roadwayskr.vercel.app`
- `gogotrip.kr` 현재 DNS는 `158.247.199.75`라 Vercel alias 활성화 전
- TOUR_API_SERVICE_KEY는 .env.local에만 보관, 출력/커밋 금지
- `pnpm build` 전에는 dev 서버를 종료하고 `.next`를 지워 캐시 충돌 방지
