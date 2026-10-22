# 적용된 변경 (2026-10-22)

승인 범위: `PATCH_PLAN.md`의 0 + A + B. 운영자 정보는 "개인 운영"으로 표기. C(편집 콘텐츠)는 진행하지 않았다. 커밋·배포는 하지 않았다.

## 0. roadwayskr2 미커밋 작업 이식
- `D:\web\roadwayskr2`의 2026-10-01 diff 전체 + 신규 파일 11개를 이식했다 (IndexNow Bearer 인증·Rate limit, 허브 ISR 5분, CI 워크플로, `app/icon.svg` + Organization logo, sitemap DB 오류 전파, health 신선도 판정, 테스트 6종).
- **제외: CSP 헤더**. AdSense·GA4가 쓰는 도메인(`region1.google-analytics.com`, `googleads.g.doubleclick.net`, `fundingchoicesmessages.google.com` 등)이 빠져 있어 심사 중 광고·통계가 막힐 위험이 있다. 도입하려면 Report-Only로 먼저 검증해야 한다.

## A. 코드
| ID | 파일 | 변경 |
|---|---|---|
| A1 | about·curator·contact·privacy·terms·data-policy, `HubSourceGuide.tsx` | 공개 문구 "Roadways" → "여행고고" 통일. Person 스키마 이름 → "고고지기" |
| A2 | `lib/festival-quality.ts`(신규), `app/sitemap.ts`, 상세 `generateMetadata` | 소개+프로그램 본문 300자 미만 행사는 `noindex` + sitemap 제외 (페이지는 유지) |
| A3 | 상세 페이지 | "{지역}에서 함께 볼 만한 행사" 6건(같은 시군구 우선) + 지역 전체 보기 링크 |
| A4 | — | **보류**: 기존 InfoCards와 정보가 중복돼 템플릿 텍스트만 늘어남 |
| A5 | 상세 페이지 | breadcrumb(UI·JSON-LD) 홈 › {실제 시도} › 행사명 |
| A6 | 상세 `generateMetadata` | description 155자 컷(없으면 overview 사용), OG 이미지 크기 허위 선언 제거 |
| A7 | `components/ads/PageAds.tsx` | 쿠팡 배너는 `NEXT_PUBLIC_AFFILIATE_ENABLED=true`일 때만 노출(기본 꺼짐) |
| A8 | `app/layout.tsx` | 헤더 메뉴 "최근 소식" → "최근 업데이트"(실제 내용과 일치) |

## B. 신뢰 페이지 (본문, 공백 제외)
| 페이지 | 전 → 후 | 내용 |
|---|---|---|
| /about | 239 → 811자 | 운영 이유, 제공 기능, 데이터 흐름(매일 04시 동기화·종료/취소 제외·색인 기준), 한계(현장 답사 아님), 광고 원칙 |
| /about/curator | 210 → 466자 | 개인 운영 명시, 하는 일, 작성 기준(추정 금지·허위 방문 금지) |
| /contact | 113 → 401자 | 제보 양식, 처리 방식, 회신 기간(영업일 3일) |
| /privacy | 610 → 1,477자 | "운영자 확인 필요" 미완성 문구 제거, 보유 기간·파기, 처리 위탁·국외 이전 표, 쿠키/DART, 거부 방법, 이용자 권리, 보호책임자, 신고기관 |

## 검증
- `pnpm typecheck`, `pnpm lint` 통과 · `pnpm test` 66/66 통과(신규 `festival-quality.test.ts` 3건 포함)
- 로컬 합성 DB로 `pnpm build` 성공 → `next start`로 확인: 긴 소개 행사는 `index`, 짧은 소개 행사는 `noindex`, sitemap에는 짧은 행사 제외, 관련 행사 링크·지역 breadcrumb 렌더링, description 155자, 쿠팡 배너 비노출

## 사용자 확인 필요 (페이지에 적은 운영 약속)
- `hello@roadways.kr`, `privacy@roadways.kr` 메일함이 실제로 수신되는지
- 문의 메일 "회신 후 1년 보관 뒤 삭제", "영업일 3일 내 회신"을 실제로 지킬 수 있는지
- GA4 데이터 보관 기간을 14개월로 설정했는지 (GA4 관리 → 데이터 설정 → 데이터 보관)

---

## C. 편집 콘텐츠 (같은 날 추가 진행)

외부 AI API 없이 Claude Code가 직접 작성했다. 저장소 파일 기반이라 DB와 무관하고, 리뷰와 버전 관리가 된다.

| 구성 | 파일 |
|---|---|
| 글 12편 (본문 1,495~1,591자, 공백 제외) | `lib/guides/articles/*.ts` |
| 타입·레지스트리·품질 헬퍼 | `lib/guides/types.ts`, `lib/guides/index.ts` |
| 본문 렌더러 (내부 링크 `[텍스트](/경로)`만 허용) | `components/guides/GuideBody.tsx` |
| 목록 `/guides` (CollectionPage JSON-LD) · 상세 `/guides/[slug]` (Article + BreadcrumbList JSON-LD, 작성자 고고지기, 작성일, 요약, FAQ, 관련 글) | `app/guides/` |
| 노출 | 헤더 "가이드", 푸터 "나들이 가이드", 홈 "축제 나들이 가이드" 섹션, 축제 상세 하단 링크 2개, sitemap 13 URL(글별 실제 수정일 lastmod) |
| 품질 테스트 | `tests/guides.test.ts` — 1,500자 하한, 제목·설명 길이, 페르소나 금지 표현, 내부 링크 실존, 관련 글 실존 |

글 목록: 주말 일정 짜기, 취소·연기 확인 순서, 아이 동반 체크리스트, 대중교통·셔틀, 자가용 주차, 무료/유료 입장료 읽기, 비 예보 판단, 불꽃·야간 관람, 계절별 축제 흐름, 먹거리 예산, 부모님 동반, 축제 정보 페이지 읽는 법.

작성 원칙: 현장 방문 경험 주장 없음, 특정 축제 날짜·가격 같은 검증 불가 수치 없음, 사이트 실제 기능(카드 표시 규칙, 갱신 주기, 색인 기준)과 일치하는 설명만 씀.

### C 검증
- `pnpm typecheck` · `pnpm lint` 통과 · `pnpm test` 72/72 통과
- 로컬 빌드 후 확인: 가이드 12편 모두 200, Article/BreadcrumbList JSON-LD 있음, 내부 링크 깨짐 0건, sitemap에 가이드 13 URL, 홈·축제 상세에서 가이드로 연결됨, AdSense 스크립트는 가이드·홈에 로드되고 개인정보처리방침에는 로드되지 않음

### 진행하지 못한 것
- **C-3 대표 축제 큐레이터 코멘트**: 프로덕션 Turso DB 쓰기 권한이 필요하다(로컬에 자격증명 없음). 현장 경험 없이 쓰면 사실이 아닌 내용이 되므로, 운영자가 직접 다녀온 축제가 있을 때 진행하는 것을 권장한다.
- **C-4 과거 블로그 72편**: DB에 남아 있는지 확인이 필요하다.
