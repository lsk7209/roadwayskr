# Status | 마지막: 2026-05-10
## 현재 작업
사이트 기본 도메인을 `roadways.kr`로 정렬 완료
## 최근 변경 (최근 5개만)
- 05-10: canonical, sitemap, robots, RSS, AI 인덱스 기본 도메인을 `roadways.kr`로 변경
- 05-10: `naver-site-verification` 메타 태그와 GA4 `G-MH1JSZH1XG` 추가
- 05-10: `public/docs/*.md` 주요 페이지 Markdown 미러 추가
- 05-10: `public/llms.txt`, `public/llms-full.txt`, `public/ai-index.json` 추가
- 05-10: 네이버/다음 제출용 `/feed.xml` RSS 라우트 추가
## TODO
- [ ] `roadways.kr` DNS/Vercel 도메인 연결: 현재 `158.247.212.123`에서 404
- [ ] Vercel 환경변수 `SITE_URL=https://roadways.kr` 확인
## 결정사항
- 배포: Codex는 Vercel 직접 배포 금지, Git push 후 사용자가 연결한 Vercel 자동 배포만 사용
- CI: GitHub Actions secrets로 Turso/TourAPI 값을 주입하고 `.env.local`은 로컬 전용 유지
- 라우팅: 외부 URL은 한글, 내부 App Router 폴더는 Windows 안정성을 위해 ASCII 사용
## 주의
- `.env.local`에는 운영 Turso 키와 TourAPI 키가 있으므로 출력/커밋 금지
- GitHub secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TOUR_API_SERVICE_KEY`
- 네이버 확인 URL `https://roadways.kr`는 DNS/Vercel 연결 전까지 앱 메타를 읽을 수 없음
