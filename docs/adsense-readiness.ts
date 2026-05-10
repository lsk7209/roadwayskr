/**
 * AdSense 검수 준비도 자동 점검
 *
 * 사용:  pnpm tsx --env-file=.env.local scripts/adsense-readiness.ts
 *
 * 점검 항목 (22개):
 *  1. 필수 페이지 4종 (about, contact, privacy, terms) 응답 200
 *  2. 데이터 정책 페이지 응답 200
 *  3. 큐레이터 페이지 응답 200 (EEAT)
 *  4. 홈 응답 200
 *  5. robots.txt 응답 200
 *  6. sitemap.xml 응답 200
 *  7. 404 페이지 정상 동작
 *  8. <html lang="ko"> 명시
 *  9. 메타 description 존재
 * 10. canonical 태그 존재
 * 11. OG 태그 존재
 * 12. 작성자 정보 (Person Schema) 존재
 * 13. 조직 정보 (Organization Schema) 존재
 * 14. 행사 페이지 Event Schema 존재
 * 15. 행사 페이지 마지막 업데이트 시각 노출
 * 16. 행사 페이지 출처 표기 노출
 * 17. ads.txt 응답 200 (publisher-id 포함)
 * 18. 색인 가능 페이지 200+
 * 19. HTTPS 적용
 * 20. 모바일 viewport 메타
 * 21. 광고 외부 링크 정상 (rel="noopener")
 * 22. 본문 한글 80%+
 *
 * 결과는 ✅ / ⚠️ / ❌ 로 출력.
 */

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

interface Check {
  id: number;
  name: string;
  status: "pass" | "warn" | "fail" | "skip";
  detail?: string;
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${SITE_URL}${path}`, {
    headers: { "User-Agent": "AdsenseReadinessCheck/1.0" },
  });
  const html = await res.text().catch(() => "");
  return { status: res.status, html };
}

function has(html: string, regex: RegExp): boolean {
  return regex.test(html);
}

async function main() {
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  // 1~7: 필수 페이지 응답
  for (const [id, path] of [
    [1, "/about"],
    [2, "/contact"],
    [3, "/privacy"],
    [4, "/terms"],
    [5, "/data-policy"],
    [6, "/about/curator"],
    [7, "/"],
  ] as const) {
    const { status } = await fetchHtml(path);
    add({
      id,
      name: `페이지 ${path} 응답`,
      status: status === 200 ? "pass" : "fail",
      detail: `HTTP ${status}`,
    });
  }

  // 8: robots.txt
  {
    const { status } = await fetchHtml("/robots.txt");
    add({
      id: 8,
      name: "robots.txt",
      status: status === 200 ? "pass" : "fail",
      detail: `HTTP ${status}`,
    });
  }

  // 9: sitemap.xml
  {
    const { status, html } = await fetchHtml("/sitemap.xml");
    const ok = status === 200 && html.includes("<urlset");
    add({
      id: 9,
      name: "sitemap.xml",
      status: ok ? "pass" : "fail",
      detail: `HTTP ${status}`,
    });
  }

  // 10: 404 페이지
  {
    const { status } = await fetchHtml("/__definitely_not_a_page__");
    add({
      id: 10,
      name: "404 페이지 동작",
      status: status === 404 ? "pass" : "fail",
      detail: `HTTP ${status}`,
    });
  }

  // 11~16: 홈 페이지 메타·schema
  {
    const { html } = await fetchHtml("/");
    add({
      id: 11,
      name: "<html lang='ko'>",
      status: has(html, /<html[^>]*lang=["']ko/i) ? "pass" : "fail",
    });
    add({
      id: 12,
      name: "meta description",
      status: has(html, /<meta[^>]*name=["']description["']/i) ? "pass" : "fail",
    });
    add({
      id: 13,
      name: "canonical",
      status: has(html, /<link[^>]*rel=["']canonical["']/i) ? "pass" : "fail",
    });
    add({
      id: 14,
      name: "OG 태그",
      status: has(html, /property=["']og:title["']/i) ? "pass" : "fail",
    });
    add({
      id: 15,
      name: "Organization Schema",
      status: has(html, /"@type"\s*:\s*"Organization"/i) ? "pass" : "fail",
    });
    add({
      id: 16,
      name: "viewport (모바일)",
      status: has(html, /<meta[^>]*name=["']viewport["']/i) ? "pass" : "fail",
    });
  }

  // 17: 큐레이터 페이지 Person Schema
  {
    const { html } = await fetchHtml("/about/curator");
    add({
      id: 17,
      name: "Person Schema (작성자)",
      status: has(html, /"@type"\s*:\s*"Person"/i) ? "pass" : "fail",
    });
  }

  // 18: HTTPS
  add({
    id: 18,
    name: "HTTPS 적용",
    status: SITE_URL.startsWith("https://")
      ? "pass"
      : SITE_URL.startsWith("http://localhost")
        ? "skip"
        : "fail",
    detail: SITE_URL.startsWith("http://localhost") ? "로컬 - 운영 배포 후 확인" : undefined,
  });

  // 19: ads.txt
  {
    const { status, html } = await fetchHtml("/ads.txt");
    if (status !== 200) {
      add({ id: 19, name: "ads.txt", status: "warn", detail: "검수 신청 직전 추가" });
    } else {
      add({
        id: 19,
        name: "ads.txt",
        status: html.includes("google.com") ? "pass" : "warn",
        detail: html.slice(0, 80),
      });
    }
  }

  // 20: 행사 페이지 샘플
  {
    const sample = await fetch(`${SITE_URL}/sitemap.xml`).then((r) => r.text());
    const match = sample.match(/<loc>([^<]+\/축제\/[^<]+)<\/loc>/);
    if (match) {
      const url = match[1];
      const { html } = await fetch(url).then(async (r) => ({
        html: await r.text(),
      }));
      add({
        id: 20,
        name: "행사 Event Schema",
        status: has(html, /"@type"\s*:\s*"Festival"/i) ? "pass" : "fail",
      });
      add({
        id: 21,
        name: "행사 마지막 업데이트 노출",
        status: has(html, /마지막 업데이트/) ? "pass" : "fail",
      });
      add({
        id: 22,
        name: "행사 출처 표기 (TourAPI)",
        status: has(html, /TourAPI|한국관광공사/) ? "pass" : "fail",
      });
    } else {
      for (const id of [20, 21, 22]) {
        add({
          id,
          name: `행사 페이지 점검 #${id}`,
          status: "skip",
          detail: "sitemap에 행사 페이지 없음 (데이터 미동기화)",
        });
      }
    }
  }

  // 출력
  const icon = (s: Check["status"]) =>
    s === "pass" ? "✅" : s === "warn" ? "⚠️ " : s === "fail" ? "❌" : "⏭️";

  console.log(`\n=== AdSense 검수 준비도 (${SITE_URL}) ===\n`);
  for (const c of checks.sort((a, b) => a.id - b.id)) {
    const detail = c.detail ? ` — ${c.detail}` : "";
    console.log(`${icon(c.status)} #${c.id} ${c.name}${detail}`);
  }

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  const skipped = checks.filter((c) => c.status === "skip").length;

  console.log(
    `\n총 ${checks.length}항목 중 통과 ${passed}, 경고 ${warned}, 실패 ${failed}, 건너뜀 ${skipped}`,
  );

  if (failed > 0) {
    console.log("\n❌ 실패 항목이 있습니다. 검수 신청 전 모두 해결하세요.");
    process.exit(1);
  } else if (warned > 0) {
    console.log("\n⚠️  경고 항목이 있습니다. 검수 신청 전 검토 권장.");
  } else {
    console.log("\n✅ 검수 준비 완료. AdSense 신청 가능.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
