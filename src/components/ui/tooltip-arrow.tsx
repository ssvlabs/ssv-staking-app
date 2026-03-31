import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type TooltipArrowProps = SVGProps<SVGSVGElement>;

export function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  return (
    <svg
      viewBox="0 0 24 13"
      className={cn("h-[13px] w-[24px]", className)}
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 13L0 1h24L12 13Z" />
    </svg>
  );
}
