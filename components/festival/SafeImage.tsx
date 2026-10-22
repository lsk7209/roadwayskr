"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** 이미지 로드 실패 시 빈 칸 대신 안내 문구를 보여준다(원인 미확인 상태 그대로 표시). */
export function SafeImage({ alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center text-sm text-[var(--color-muted)]"
      >
        이미지를 불러오지 못했습니다
      </div>
    );
  }
  return <Image alt={alt} {...props} onError={() => setFailed(true)} />;
}
