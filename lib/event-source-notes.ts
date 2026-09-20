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
