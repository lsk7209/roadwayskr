# Status | 마지막: 2026-05-10
## 현재 작업
AEO/GEO 정적 인덱스 파일 추가 완료
## 최근 변경 (최근 5개만)
- 05-10: `public/llms.txt`, `public/llms-full.txt`, `public/ai-index.json` 추가
- 05-10: 네이버/다음 제출용 `/feed.xml` RSS 라우트 추가
- 05-10: GitHub Actions secrets 3개 등록 및 워크플로우 활성 상태 확인
- 05-10: Git push 기반 자동 Vercel 배포 원칙 반영
- 05-10: `packageManager=pnpm@10.33.0` 및 Actions pnpm 10 고정
## TODO
- [ ] Gabia DNS: `@ A 76.76.21.21`, `www CNAME cname.vercel-dns.com` 적용
- [ ] DNS 반영 후 `SITE_URL=https://gogotrip.kr`로 재설정 및 재배포
## 결정사항
- 배포: Codex는 Vercel 직접 배포 금지, Git push 후 사용자가 연결한 Vercel 자동 배포만 사용
- CI: GitHub Actions secrets로 Turso/TourAPI 값을 주입하고 `.env.local`은 로컬 전용 유지
- 라우팅: 외부 URL은 한글, 내부 App Router 폴더는 Windows 안정성을 위해 ASCII 사용
## 주의
- `.env.local`에는 운영 Turso 키와 TourAPI 키가 있으므로 출력/커밋 금지
- GitHub secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TOUR_API_SERVICE_KEY`
- `gogotrip.kr` 현재 DNS는 이전 IP라 Vercel alias 활성 전 DNS 변경 필요
