import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "여행고고 - 전국 축제·행사 큐레이션";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#faf7f2",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* 상단 강조 바 */}
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
      {/* 메인 텍스트 */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: "#1a1a1a",
          letterSpacing: "-2px",
        }}
      >
        여행고고
      </div>
      <div
        style={{
          fontSize: 34,
          color: "#555",
          marginTop: 20,
          letterSpacing: "-0.5px",
        }}
      >
        전국 축제·행사 큐레이션
      </div>
      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          fontSize: 22,
          color: "#999",
        }}
      >
        roadways.kr
      </div>
    </div>,
    { ...size },
  );
}
