# Domain Activation Checklist (roadways.kr)

`https://roadways.kr` returning 404 on your side is usually a domain/DNS issue, not an application bug.

## 1) Add domains in Vercel
- Open project settings in Vercel.
- Go to Settings -> Domains.
- Confirm ownership:
  - `roadways.kr`
  - `www.roadways.kr`
- This project currently appears as:
  - limsubs-projects/roadwayskr (linked)

## 2) Apply DNS records
- For root domain, check nameserver at registrar:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
- For subdomain, check registrar also points `www` via `CNAME` to Vercel DNS or your default project route.

Suggested default values (verify in your Vercel UI):
- roadways.kr -> 76.76.21.21 (A)
- www.roadways.kr -> cname.vercel-dns.com

현재 확인 결과:
- Vercel 도메인 상태에서 `roadways.kr`는 `roadwayskr`와 `klick-main-page`에 중복 등록되어 있음.
- DNS Nameserver가 `ns1.hosting.co.kr`, `ns2.hosting.co.kr`로 되어 있고 Vercel 설정값과 불일치.
- 응답은 현재 `LiteSpeed 404`로, 도메인 라우팅이 Vercel까지 도달하지 못한 상태.

권장 조치:
1) Vercel 도메인 충돌 정리(이 프로젝트로 강제 이동):
   - `vercel domains add roadways.kr --scope limsubs-projects --force`
   - `vercel domains add www.roadways.kr --scope limsubs-projects --force`
2) Registrar NS 변경:
   - `ns1.hosting.co.kr` → `ns1.vercel-dns.com`
   - `ns2.hosting.co.kr` → `ns2.vercel-dns.com`

## 3) Validate in order
1. Check DNS propagation
   - `Resolve-DnsName roadways.kr`
   - `Resolve-DnsName www.roadways.kr`
2. Confirm HTTPS reachability
   - `curl -I https://roadways.kr`
3. Confirm head contains naver meta tag and canonical
   - open source HTML and verify `naver-site-verification` and `https://roadways.kr/`
4. Check SEO files
   - `https://roadways.kr/sitemap.xml`
   - `https://roadways.kr/robots.txt`
   - `https://roadways.kr/feed.xml`

## 4) Vercel environment check
Set:
- SITE_URL=https://roadways.kr
- NAVER_VERIFICATION=ce71e583d5763935ec467df1eba2d290d9552ae0
- NEXT_PUBLIC_GA_MEASUREMENT_ID=G-MH1JSZH1XG

## 5) Completion criteria
- `https://roadways.kr` returns HTTP 200.
- response html contains naver verification meta.
- `robots.txt` includes https://roadways.kr sitemap and host.
