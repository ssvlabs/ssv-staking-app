import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "bg-transparent outline-none placeholder:text-ink-400 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
