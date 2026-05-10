# Status | 마지막: 2026-05-10
## 현재 작업
- 메인/PLAN/주요 정적 페이지의 가독성 정비 및 깨진 문구 복구 완료.
- AdSense 자동광고 스크립트 정합성 정비 후 다음은 배포 반영 점검.

## 최근 변경 (최근 5개만)
- 2026-05-10: AutoAds에서 page-level ads 강제 푸시 제거(검수 리스크 완화).
- 2026-05-10: `/weekend`/`/about`/`/about/curator`/`/contact`/`/privacy`/`/terms`/`/data-policy` 텍스트 및 태그 정리.
- 2026-05-10: `app/page.tsx` 본문 구조 재설계 및 `prose-body` 기반 가독성 적용.
- 2026-05-10: `/plan` 페이지를 실행형 최적화 대시보드 형태로 재편집.
- 2026-05-10: 지역/테마/월별/주말 페이지에 `prose-body` 적용.

## TODO
- [ ] 도메인 라우팅 정상화 후 `https://roadways.kr` 접근 점검
- [ ] 배포 후 `pnpm run build` 및 `pnpm run lint`/`typecheck` 실행
- [ ] /sitemap.xml /feed.xml /robots.txt 실서비스 응답 확인
- [ ] FAQ/상세 페이지 콘텐츠 문체 통일, CTA·광고 밀도 최적화

## 결정사항
- WordPress가 아닌 Next.js 앱 구조이므로 플러그인/테마 최적화는 코드 단위로 처리.
- 깨진 인코딩 문자열은 UI/가독성 관점에서 파일 단위 재작성 방식으로 정리.

## 주의
- 도메인 직접 점검은 현재 환경에서 `roadways.kr`이 여전히 404 응답 가능성이 높음.
- 타입/린트 검증은 배포 전후로 재실행 필요.

## 실수 기록
- 동일 파일을 반복 재작성할 경우 기존 문자열 손상 패턴이 남을 수 있어, 텍스트는 한 번에 정리해 치환하도록 운영.
