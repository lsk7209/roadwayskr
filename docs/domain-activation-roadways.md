# Domain Activation Checklist (roadways.kr)

`https://roadways.kr` returns 404 in your environment today, which indicates a domain routing issue (DNS / domain attachment), not an app bug.

## 1) Confirm Vercel domain attachment
- Open project Settings → Domains.
- Domain list should include:
  - `roadways.kr`
  - `www.roadways.kr`
- Ensure this project is the only project handling these domains.

## 2) Apply DNS (권장: 네임서버 방식)
- **루트 네임서버를 Vercel로 교체**
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
- 또는 registrar A/CNAME 방식 사용 시,
  - `roadways.kr` → `76.76.21.21` (A, 필요 시 Vercel에서 권장 값 확인)
  - `www.roadways.kr` → `cname.vercel-dns.com` (CNAME)

현재 확인값(요청한 환경 기준):
- NS: `ns1.serverhostgroup.com`, `ns2.serverhostgroup.com`, `ns3.serverhostgroup.com`
- A: `216.150.1.1`
- 이 상태면 요청이 Vercel이 아닌 기존 LiteSpeed 서버로 갑니다.

## 3) 즉시 조치 순서
1. 네임서버 변경 또는 Vercel 네임서버 등록(위 2번 기준)
2. 레지스트라에서 TTL 반영 대기(10~40분 단위 확인, 최대 24~48시간)
3. Vercel 프로젝트 루트 도메인 상태가 `roadways.kr`에서 Active인지 확인
4. 아래 검사
   - `Resolve-DnsName roadways.kr`
   - `Resolve-DnsName www.roadways.kr`
   - `curl -I https://roadways.kr`
   - `curl -I https://www.roadways.kr`
   - `curl -I https://roadways.kr/sitemap.xml`
   - `curl -I https://roadways.kr/robots.txt`
   - `curl -I https://roadways.kr/feed.xml`

## 4) Vercel env 확인
- `SITE_URL=https://roadways.kr`
- `NAVER_VERIFICATION=ce71e583d5763935ec467df1eba2d290d9552ae0`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-MH1JSZH1XG`

## 5) 완료 기준
- `https://roadways.kr` HTTP 200 응답
- `robots.txt`에 `https://roadways.kr`가 sitemap/host로 노출
- `https://roadways.kr/sitemap.xml`에서 `<urlset>` 응답
- `https://roadways.kr/feed.xml`에서 `<rss version="2.0">` 응답
