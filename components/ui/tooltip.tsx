"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type TooltipProps = {
  content: string;
  className?: string;
  children: React.ReactNode;
};

export function Tooltip({ content, className, children }: TooltipProps) {
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ left: 0, top: 0 });

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left + rect.width / 2 + window.scrollX,
      top: rect.top + window.scrollY
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleUpdate = () => updatePosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);

  return (
    <span className={cn("inline-flex", className)}>
      <span
        ref={triggerRef}
        className="inline-flex"
        tabIndex={0}
        aria-label={content}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {children}
      </span>
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <span
              className="pointer-events-none absolute z-[70] -translate-x-1/2 -translate-y-[calc(100%+8px)] transition-opacity duration-150"
              style={{ left: coords.left, top: coords.top }}
            >
              <span className="relative flex flex-col items-center">
                <span className="w-max whitespace-nowrap rounded-[8px] bg-[var(--color-tooltip-bg)] px-4 py-3 text-[14px] font-medium leading-[20px] text-[var(--color-tooltip-text)]">
                  {content}
                </span>
                <svg
                  className="absolute -bottom-[6px] h-[13px] w-[24px]"
                  viewBox="0 0 24 13"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 13L0 1h24L12 13Z"
                    fill="var(--color-tooltip-bg)"
                  />
                </svg>
              </span>
            </span>,
            document.body
          )
        : null}
    </span>
  );
}
