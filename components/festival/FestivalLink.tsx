"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
export function FestivalLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        try {
          sessionStorage.setItem(
            "festival-list-return",
            location.pathname + location.search,
          );
        } catch {
          /* optional navigation context */
        }
        props.onClick?.(event);
      }}
    />
  );
}
