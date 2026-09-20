"use client";
import type { AnchorHTMLAttributes } from "react";
import { trackAction, type ActionName } from "@/lib/analytics";
export function TrackedLink({
  eventName,
  contentId,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: ActionName;
  contentId: number;
}) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackAction(eventName, contentId);
        onClick?.(event);
      }}
    />
  );
}
