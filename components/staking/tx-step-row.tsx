"use client";

import type { ReactNode } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import { useAccount } from "wagmi";

import { getNetworkConfigByChainId } from "@/lib/config";
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

const StepIndicator = ({ status }: { status: StepStatus }) => {
  if (status === "confirmed") {
    return (
      <div className="flex size-[28px] items-center justify-center rounded-full border border-success-600 bg-success-500">
        <Check className="size-[14px] text-white" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex size-[28px] items-center justify-center rounded-full bg-danger-500">
        <X className="size-[12px] text-white" />
      </div>
    );
  }
  if (status === "waiting" || status === "submitted") {
    return (
      <div className="relative size-[28px]">
        <div className="absolute inset-0 rounded-full border-4 border-border-strong opacity-60" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-brand-500 border-t-brand-500" />
      </div>
    );
  }
  return (
    <div className="size-[28px] rounded-full border-4 border-border-strong opacity-60" />
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
  const { chainId } = useAccount();
  const explorerBaseUrl = getNetworkConfigByChainId(chainId).blockExplorer.txBaseUrl;
  const isError = status === "error";

  const renderAction = () => {
    if (status === "waiting") {
      return (
        <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-brand-100 px-[16px] text-[14px] font-semibold text-brand-500">
          Waiting...
        </div>
      );
    }
    if (status === "error") {
      return (
        <button
          className="flex h-[40px] items-center justify-center rounded-[8px] bg-brand-600 px-[16px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-400 disabled:opacity-100"
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
          className="flex h-[40px] items-center gap-[4px] rounded-[8px] border border-border bg-surface-100 pl-[16px] pr-[12px] text-[14px] font-normal text-ink-700"
          href={`${explorerBaseUrl}${hash}`}
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
      <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-border px-[16px] text-[14px] font-semibold text-ink-400">
        {idleLabel}
      </div>
    );
  };

  return (
    <div
      className={`flex w-full gap-3 rounded-[12px] bg-surface-50 p-5 ${
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
          <p className="text-[16px] font-medium leading-[24px] text-ink-900">
            {label}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <p className="text-[16px] font-medium leading-[24px] text-ink-900">
            {label}
          </p>
          {detail}
        </div>
      )}
      {renderAction()}
    </div>
  );
}
