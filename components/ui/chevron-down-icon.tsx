import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type ChevronDownIconProps = SVGProps<SVGSVGElement>;

export function ChevronDownIcon({ className, ...props }: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-[12px]", className)}
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
