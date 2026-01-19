"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PrimaryActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActivated?: boolean;
};

export function PrimaryActionButton({
  className,
  children,
  isActivated,
  ...props
}: PrimaryActionButtonProps) {
  const isDisabled = Boolean(props.disabled);
  const patternOpacityClass = isActivated
    ? "opacity-[var(--cta-pattern-opacity-activated)]"
    : isDisabled
    ? "opacity-[var(--cta-pattern-opacity-disabled)]"
    : "opacity-[var(--cta-pattern-opacity)]";

  return (
    <Button
      className={cn(
        "relative h-[60px] w-full overflow-hidden rounded-[8px] bg-[var(--cta-bg)] text-[14px] font-semibold text-[var(--cta-text)] shadow-[var(--shadow-primary)] transition",
        "hover:bg-[var(--cta-bg-hover)] active:bg-[var(--cta-bg-active)]",
        "disabled:bg-[var(--cta-bg-disabled)] disabled:text-[var(--cta-text-disabled)] disabled:shadow-none disabled:opacity-100",
        "data-[activated=true]:bg-[var(--cta-bg-activated)] data-[activated=true]:text-[var(--cta-text-activated)] data-[activated=true]:shadow-none",
        className
      )}
      data-activated={isActivated ? "true" : undefined}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-[-39px] top-[-97px] h-[232px] w-[672px] transition",
          patternOpacityClass
        )}
        aria-hidden="true"
      >
        <img
          alt=""
          src="/figma/ssv-button-bg.svg"
          className="h-full w-full"
        />
      </span>
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
