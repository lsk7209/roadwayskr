import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "여행고고는 전국 축제·행사 일정을 지역·테마·주말 기준으로 정리하는 개인 운영 큐레이션 사이트입니다. 데이터 출처와 갱신 방식, 한계를 안내합니다.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">서비스 소개</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        여행고고는 &ldquo;이번 주말 어디 갈까&rdquo;를 빨리 정할 수 있도록 전국
        축제·행사 일정을 지역, 테마, 날짜 기준으로 다시 정리하는 사이트입니다.
        개인이 운영합니다.
      </p>

      <h2>왜 만들었나요</h2>
      <p>
        축제 정보는 지자체 홈페이지, 관광공사 포털, SNS 공지에 흩어져 있고,
        이미 끝난 행사와 앞으로 열릴 행사가 한 목록에 섞여 있는 경우가 많습니다.
        여행고고는 지금 진행 중이거나 곧 열리는 행사만 남기고, 지역과 주말
        날짜로 바로 걸러 볼 수 있게 만드는 데 집중합니다.
      </p>

      <h2>무엇을 볼 수 있나요</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <Link className="underline" href="/weekend">
            이번 주말
          </Link>
          : 다가오는 토·일요일에 열리는 행사
        </li>
        <li>
          <Link className="underline" href="/regions">
            지역별
          </Link>
          : 17개 시도별 진행·예정 행사
        </li>
        <li>
          <Link className="underline" href="/themes">
            테마별
          </Link>
          : 꽃·불꽃·먹거리·전통문화 등 주제별 묶음
        </li>
        <li>
          행사 상세: 기간, 운영 시간, 입장료, 장소, 공식 안내 링크, 같은 지역의
          다른 행사
        </li>
      </ul>

      <h2>데이터는 어디서 오나요</h2>
      <p>
        기본 데이터는 한국관광공사 TourAPI(공공데이터포털)에서 받습니다. 매일
        새벽 4시(한국 시간)에 전날 이후 바뀐 행사를 자동으로 다시 받아 일정,
        장소, 소개 문구를 갱신합니다. 일부 행사는 주최 측 공식 공지와 일정을
        대조해 보정하고, 그 경우 상세 페이지에 대조일과 대상 항목을 따로
        표시합니다.
      </p>
      <p>
        종료되었거나 취소된 행사는 목록·지역·테마 페이지와 사이트맵에서 자동으로
        빠집니다. 행사가 3건 미만인 지역·월 조합 페이지와 소개 내용이 너무 짧은
        행사 페이지는 검색엔진 색인 대상에서 제외합니다.
      </p>

      <h2>알아두실 한계</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          현장을 직접 다녀와서 쓴 정보가 아닙니다. 행사 소개 문구는 원자료를
          옮겨 정리한 것입니다.
        </li>
        <li>
          갱신 주기 때문에 주최 측의 당일 변경·우천 취소가 늦게 반영될 수
          있습니다. 출발 전 공식 홈페이지나 주최 측 연락처로 다시 확인해 주세요.
        </li>
        <li>
          입장료·주차 정보가 원자료에 없으면 추정하지 않고 &ldquo;확인
          필요&rdquo;로 표시합니다.
        </li>
      </ul>

      <h2>광고와 운영비</h2>
      <p>
        사이트 운영비(호스팅·데이터베이스)는 광고 수익으로 충당할 계획입니다.
        광고는 개인정보처리방침·이용약관·문의·데이터 정책 페이지에는 노출하지
        않으며, 광고 여부와 관계없이 행사 정보의 정렬 순서는 바뀌지 않습니다.
      </p>

      <h2>더 알아보기</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <Link className="underline" href="/about/curator">
            운영자 소개
          </Link>
        </li>
        <li>
          <Link className="underline" href="/data-policy">
            데이터 정책
          </Link>
          : 표시 기준과 오류 신고 방법
        </li>
        <li>
          <Link className="underline" href="/contact">
            문의
          </Link>
          : 잘못된 정보 제보, 제휴 문의
        </li>
      </ul>
    </article>
  );
}
