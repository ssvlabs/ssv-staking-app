import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "bg-transparent outline-none placeholder:text-[var(--color-ink-400)] disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
