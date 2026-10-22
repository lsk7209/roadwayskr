import type { CalendarEvent } from "./festival-dates";
// Editorial evidence is separate from imported DB fields. Matching the source
// period prevents a reused TourAPI ID inheriting a previous year's advice.
type SourceNote = {
  contentId: number;
  startDate: string;
  endDate: string;
  sourceUrl: string;
  checkedAt: string;
  label: string;
  scheduleText?: string;
  recurrence?: CalendarEvent["recurrence"];
  checkedFields: string;
  /**
   * 공식 공지로 확인한 개최일. 수집된 전체 기간(startDate~endDate)이 이보다 길 때
   * 상세 표시와 Event 구조화 데이터는 이 값을 사용한다(전체 기간 매일 운영 오해 방지).
   */
  officialOccurrence?: { startDate: string; endDate: string };
  programs?: {
    name: string;
    venue: string;
    address: string;
    time: string;
    notice?: string;
  }[];
};
export const EVENT_SOURCE_NOTES: SourceNote[] = [
  {
    // 기존 원자료 링크(no=182)는 2025년 제7회(2025-11-01) 공지였다. 원자료는 그대로 두고
    // 2026년 제8회 공지로 게시 링크만 교체한다.
    contentId: 2789700,
    startDate: "2026-10-31",
    endDate: "2026-12-31",
    sourceUrl: "https://www.pajucf.or.kr/business/02_3_view.php?no=430&page=",
    checkedAt: "2026-10-23",
    label: "파주문화재단 2026년 제8회 운정호수공원 불꽃축제 공지",
    checkedFields: "행사명·연도·회차·개최일·행사 운영 시간",
    officialOccurrence: { startDate: "2026-10-31", endDate: "2026-10-31" },
    scheduleText:
      "공식 공지 기준 제8회 불꽃축제는 2026년 10월 31일(토) 14:00~22:00 운영입니다. 이 시간은 행사 전체 운영 시간이며 불꽃쇼 시작 시각이 아닙니다. 불꽃쇼 세부 시각과 불빛정원 운영 기간·시간은 공지에 아직 없어 확인 중이며, 10월 31일 이후 기간을 불꽃쇼 날짜로 안내하지 않습니다.",
  },
  {
    contentId: 2434545,
    startDate: "2026-04-25",
    endDate: "2026-10-31",
    sourceUrl:
      "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_300000000014207",
    checkedAt: "2026-09-20",
    label: "제주관광공사 행사 안내",
    checkedFields: "운영 요일·시간",
    recurrence: { mode: "iso_weekdays", isoWeekdays: [5, 6] },
    scheduleText:
      "금·토 19:00~20:40. 7월 17일~8월 1일은 20:50까지 안내되어 있습니다. 기상 상황에 따라 취소·변경될 수 있습니다.",
  },
  {
    contentId: 2809535,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    sourceUrl: "https://namsanbongsu.kr/",
    checkedAt: "2026-09-20",
    label: "행사 공식 프로그램 안내",
    checkedFields: "프로그램별 장소·시간·취소 공지 범위",
    scheduleText:
      "장소별 프로그램과 시간을 확인해 주세요. 보신각의 9월~12월 초 취소 일정 공지가 있으므로 방문 날짜를 공식 안내에서 확인해야 합니다.",
    programs: [
      {
        name: "보신각 시민상설 타종행사",
        venue: "보신각",
        address: "서울 종로구 종로 54",
        time: "11:00~12:10, 월요일 휴무",
        notice:
          "9월~12월 초 취소 일정 공지 대상. 해당 날짜 운영 여부 확인 필요.",
      },
      {
        name: "남산 봉수대 봉화의식",
        venue: "남산봉수대",
        address: "서울 중구 예장동 8-1",
        time: "11:00~12:10, 월요일 휴무",
        notice: "기상·안전 사정에 따라 해당일 취소 가능.",
      },
      {
        name: "전통문화 공연",
        venue: "N서울타워 팔각정 광장",
        address: "",
        time: "15:00~15:40, 월요일 휴무",
        notice: "정확한 위치는 공식 행사장 안내에서 확인해 주세요.",
      },
    ],
  },
  {
    contentId: 3359644,
    startDate: "2026-09-19",
    endDate: "2026-09-19",
    sourceUrl:
      "https://www.nowon.kr/www/user/bbs/BD_selectBbs.do?q_bbsCode=1001&q_bbscttSn=20260819164642302&q_currPage=1&q_estnColumn1=11&q_rowPerPage=10&q_searchKeyTy=sj___1002&q_searchVal=&q_sortName=&q_sortOrder=",
    checkedAt: "2026-09-20",
    label: "노원구 행사 공식 공지",
    checkedFields: "행사 날짜·공식 공지 목적지",
    scheduleText:
      "이 공지는 2026년 9월 19일 행사에 대한 안내입니다. 다른 회차의 일정으로 적용하지 않습니다.",
  },
];

export function eventSourceNote(event: {
  contentId: number;
  startDate: string | null;
  endDate: string | null;
}) {
  return EVENT_SOURCE_NOTES.find(
    (n) =>
      n.contentId === event.contentId &&
      n.startDate === event.startDate &&
      n.endDate === event.endDate,
  );
}
