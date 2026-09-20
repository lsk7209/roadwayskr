"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function BackToList() {
  const [href, setHref] = useState("/regions");
  useEffect(() => {
    try {
      const value = sessionStorage.getItem("festival-list-return");
      if (
        value &&
        (value === "/" ||
          /^\/(?:regions|monthly|weekend|themes|blog)(?:\/|\?|$)/.test(value))
      )
        setHref(value);
    } catch {
      /* browser storage may be disabled */
    }
  }, []);
  return (
    <Link href={href} className="mb-4 inline-block text-sm underline">
      목록으로 돌아가기
    </Link>
  );
}
