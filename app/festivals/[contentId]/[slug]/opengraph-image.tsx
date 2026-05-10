import { ImageResponse } from "next/og";
import { db, festivals } from "@/db";
import { eq } from "drizzle-orm";

export const runtime = "edge";
export const alt = "축제 정보 - 여행고고";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ contentId: string; slug: string }>;
}

export default async function Image({ params }: Props) {
  const { contentId } = await params;
  const rows = await db
    .select({
      title: festivals.title,
      startDate: festivals.startDate,
      endDate: festivals.endDate,
      address: festivals.address,
    })
    .from(festivals)
    .where(eq(festivals.contentId, Number(contentId)))
    .limit(1);

  const f = rows[0];
  const title = f?.title ?? "축제 정보";
  const period =
    f?.startDate && f?.endDate ? `${f.startDate} ~ ${f.endDate}` : "";
  const location = f?.address?.slice(0, 20) ?? "";

  return new ImageResponse(
    <div
      style={{
        background: "#faf7f2",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px 72px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "#e8622a",
        }}
      />
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#e8622a",
          letterSpacing: "0.05em",
          marginBottom: 32,
        }}
      >
        여행고고 · 전국 축제 큐레이션
      </div>
      <div
        style={{
          fontSize: title.length > 20 ? 52 : 64,
          fontWeight: 800,
          color: "#1a1a1a",
          letterSpacing: "-1px",
          lineHeight: 1.2,
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {period && (
          <div style={{ fontSize: 26, color: "#555", fontWeight: 500 }}>
            {period}
          </div>
        )}
        {location && (
          <div style={{ fontSize: 22, color: "#888" }}>{location}</div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 72,
          fontSize: 20,
          color: "#bbb",
        }}
      >
        roadways.kr
      </div>
    </div>,
    { ...size },
  );
}
