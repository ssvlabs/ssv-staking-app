import type { FC, ComponentPropsWithoutRef } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/machines/transaction-machine";

export type StepIndicatorProps = {
  status: Status;
};

type StepIndicatorFC = FC<
  Omit<ComponentPropsWithoutRef<"div">, keyof StepIndicatorProps> &
    StepIndicatorProps
>;

export const StepIndicator: StepIndicatorFC = ({
  status,
  className,
  ...props
}) => {
  if (status === "mined") {
    return (
      <div
        className={cn(
          "flex size-[28px] items-center justify-center rounded-full border border-success-600 bg-success-500",
          className,
        )}
        {...props}
      >
        <Check className="size-[14px] text-white" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div
        className={cn(
          "flex size-[28px] items-center justify-center rounded-full bg-danger-500",
          className,
        )}
        {...props}
      >
        <X className="size-[12px] text-white" />
      </div>
    );
  }
  if (status === "initiated" || status === "confirmed") {
    return (
      <div className={cn("relative size-[28px]", className)} {...props}>
        <div className="absolute inset-0 rounded-full border-4 border-border-strong opacity-60" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-brand-500 border-t-brand-500" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "size-[28px] rounded-full border-4 border-border-strong opacity-60",
        className,
      )}
      {...props}
    />
  );
};

StepIndicator.displayName = "StepIndicator";
