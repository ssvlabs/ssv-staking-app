"use client";

import type { ReactNode } from "react";
import { Check, ExternalLink, X } from "lucide-react";

import { formatTxHash } from "@/lib/staking/format";
import { StepStatus } from "@/lib/staking/types";

export type TxStepRowProps = {
  status: StepStatus;
  label: string;
  hash: `0x${string}` | null;
  idleLabel: string;
  onRetry?: () => void;
  detail?: ReactNode;
  disabled?: boolean;
};

const EXPLORER_BASE_URL = "https://hoodi.etherscan.io/tx/";

const StepIndicator = ({ status }: { status: StepStatus }) => {
  if (status === "confirmed") {
    return (
      <div className="flex size-[28px] items-center justify-center rounded-full border border-[var(--color-success-600)] bg-[var(--color-success-500)]">
        <Check className="size-[14px] text-white" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex size-[28px] items-center justify-center rounded-full bg-[var(--color-danger-500)]">
        <X className="size-[12px] text-white" />
      </div>
    );
  }
  if (status === "waiting" || status === "submitted") {
    return (
      <div className="relative size-[28px]">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border-strong)] opacity-60" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-brand-500)] border-r-[var(--color-brand-500)] animate-spin" />
      </div>
    );
  }
  return (
    <div className="size-[28px] rounded-full border-4 border-[var(--color-border-strong)] opacity-60" />
  );
};

export function TxStepRow({
  status,
  label,
  hash,
  idleLabel,
  onRetry,
  detail,
  disabled
}: TxStepRowProps) {
  const isError = status === "error";

  const renderAction = () => {
    if (status === "waiting") {
      return (
        <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-brand-100)] px-[16px] text-[14px] font-semibold text-[var(--color-brand-500)]">
          Waiting...
        </div>
      );
    }
    if (status === "error") {
      return (
        <button
          className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-brand-600)] px-[16px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-ink-400)] disabled:opacity-100"
          disabled={disabled}
          onClick={onRetry}
          type="button"
        >
          Try Again
        </button>
      );
    }
    if (hash) {
      return (
        <a
          className="flex h-[40px] items-center gap-[4px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface-100)] pl-[16px] pr-[12px] text-[14px] font-normal text-[var(--color-ink-700)]"
          href={`${EXPLORER_BASE_URL}${hash}`}
          rel="noreferrer"
          target="_blank"
        >
          <span className="truncate font-mono tracking-[-0.4px]">
            {formatTxHash(hash)}
          </span>
          <ExternalLink className="size-[14px]" />
        </a>
      );
    }
    return (
      <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-border)] px-[16px] text-[14px] font-semibold text-[var(--color-ink-400)]">
        {idleLabel}
      </div>
    );
  };

  return (
    <div
      className={`flex w-full gap-3 rounded-[12px] bg-[var(--color-surface-50)] p-5 ${
        isError ? "items-start" : "items-center"
      }`}
    >
      {isError ? (
        <div className="flex items-center py-[6px]">
          <StepIndicator status={status} />
        </div>
      ) : (
        <StepIndicator status={status} />
      )}
      {isError ? (
        <div className="flex flex-1 flex-col justify-center py-[8px]">
          <p className="text-[16px] font-medium leading-[24px] text-[var(--color-ink-900)]">
            {label}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <p className="text-[16px] font-medium leading-[24px] text-[var(--color-ink-900)]">
            {label}
          </p>
          {detail}
        </div>
      )}
      {renderAction()}
    </div>
  );
}
