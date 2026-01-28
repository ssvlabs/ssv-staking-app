"use client";

import type { ButtonHTMLAttributes } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PrimaryActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
    ? "opacity-cta-pattern-activated"
    : isDisabled
      ? "opacity-cta-pattern-disabled"
      : "opacity-cta-pattern";

  return (
    <Button
      className={cn(
        "relative h-[60px] w-full overflow-hidden rounded-[8px] bg-cta-bg text-[14px] font-semibold text-cta-text shadow-primary transition",
        "hover:bg-cta-bg-hover active:bg-cta-bg-active",
        "disabled:bg-cta-bg-disabled disabled:text-cta-text-disabled disabled:opacity-100 disabled:shadow-none",
        "data-[activated=true]:bg-cta-bg-activated data-[activated=true]:text-cta-text-activated data-[activated=true]:shadow-none",
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
        <Image
          alt=""
          src="/figma/ssv-button-bg.svg"
          className="size-full"
          width={672}
          height={232}
        />
      </span>
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
