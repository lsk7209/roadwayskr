import { z } from "zod";

/**
 * TourAPI 4.0 응답 구조 (KorService2)
 *
 * 주의: TourAPI는 빈 값일 때 키가 아예 누락됨. 모든 필드가 optional이라고 가정해야 함.
 * 또한 contentTypeId=15(축제) 응답에만 포함되는 필드와 공통 필드가 섞여 있음.
 */

// 모든 응답을 감싸는 wrapper
export const TourApiEnvelope = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z
      .object({
        items: z.union([z.string(), z.object({ item: z.unknown() })]).optional(),
        numOfRows: z.number().or(z.string()).optional(),
        pageNo: z.number().or(z.string()).optional(),
        totalCount: z.number().or(z.string()).optional(),
      })
      .optional(),
  }),
});

// 축제 검색(searchFestival2) 단일 항목
export const FestivalRaw = z
  .object({
    contentid: z.string(),
    contenttypeid: z.string().optional(),
    title: z.string(),
    addr1: z.string().optional(),
    addr2: z.string().optional(),
    areacode: z.string().optional(),
    sigungucode: z.string().optional(),
    lDongRegnCd: z.string().optional(),
    lDongSignguCd: z.string().optional(),
    cat1: z.string().optional(),
    cat2: z.string().optional(),
    cat3: z.string().optional(),
    eventstartdate: z.string().optional(),
    eventenddate: z.string().optional(),
    firstimage: z.string().optional(),
    firstimage2: z.string().optional(),
    mapx: z.string().optional(),
    mapy: z.string().optional(),
    tel: z.string().optional(),
    modifiedtime: z.string().optional(),
    createdtime: z.string().optional(),
  })
  .passthrough(); // 알 수 없는 필드는 통과

export type FestivalRaw = z.infer<typeof FestivalRaw>;

// detailIntro2 응답 (contentTypeId=15)
export const FestivalIntroRaw = z
  .object({
    contentid: z.string(),
    contenttypeid: z.string(),
    eventstartdate: z.string().optional(),
    eventenddate: z.string().optional(),
    eventplace: z.string().optional(),
    sponsor1: z.string().optional(),
    sponsor1tel: z.string().optional(),
    sponsor2: z.string().optional(),
    sponsor2tel: z.string().optional(),
    playtime: z.string().optional(),
    usetimefestival: z.string().optional(),
    agelimit: z.string().optional(),
    placeinfo: z.string().optional(),
    program: z.string().optional(),
    subevent: z.string().optional(),
    discountinfofestival: z.string().optional(),
    spendtimefestival: z.string().optional(),
    festivalgrade: z.string().optional(),
  })
  .passthrough();

// detailCommon2 응답
export const FestivalCommonRaw = z
  .object({
    contentid: z.string(),
    contenttypeid: z.string().optional(),
    title: z.string().optional(),
    overview: z.string().optional(),
    homepage: z.string().optional(),
    firstimage: z.string().optional(),
    firstimage2: z.string().optional(),
    addr1: z.string().optional(),
    addr2: z.string().optional(),
    areacode: z.string().optional(),
    sigungucode: z.string().optional(),
    lDongRegnCd: z.string().optional(),
    lDongSignguCd: z.string().optional(),
    mapx: z.string().optional(),
    mapy: z.string().optional(),
    zipcode: z.string().optional(),
    tel: z.string().optional(),
    telname: z.string().optional(),
  })
  .passthrough();

export type FestivalIntroRaw = z.infer<typeof FestivalIntroRaw>;
export type FestivalCommonRaw = z.infer<typeof FestivalCommonRaw>;
