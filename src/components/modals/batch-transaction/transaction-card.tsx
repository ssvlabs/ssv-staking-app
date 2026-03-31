import type { FC, ComponentPropsWithoutRef } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkConfig } from "@/hooks/use-network-config";
import type { TransactionState } from "@/lib/machines/transaction-machine";
import { formatTxHash } from "@/lib/staking/format";
import { StepIndicator } from "./step-indicator";

export type TransactionCardProps = {
  tx: TransactionState;
  onRetry?: () => void;
};

type TransactionCardFC = FC<
  Omit<ComponentPropsWithoutRef<"div">, keyof TransactionCardProps> & TransactionCardProps
>;

export const TransactionCard: TransactionCardFC = ({ tx, onRetry, className, ...props }) => {
  const network = useNetworkConfig();
  const explorerBaseUrl = network.blockExplorer.txBaseUrl;

  const Label = tx.label;
  const isError = tx.status === "error";

  const renderAction = () => {
    if (tx.status === "initiated") {
      return (
        <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-brand-100 px-[16px] text-[14px] font-semibold text-brand-500">
          Waiting...
        </div>
      );
    }
    if (tx.status === "error") {
      return (
        <button
          className="flex h-[40px] items-center justify-center rounded-[8px] bg-brand-600 px-[16px] text-[14px] font-semibold text-white"
          onClick={onRetry}
          type="button"
        >
          Try Again
        </button>
      );
    }
    if (tx.hash) {
      return (
        <a
          className="flex h-[40px] items-center gap-[4px] rounded-[8px] border border-border bg-surface-100 pl-[16px] pr-[12px] text-[14px] font-normal text-ink-700"
          href={`${explorerBaseUrl}${tx.hash}`}
          rel="noreferrer"
          target="_blank"
        >
          <span className="truncate font-mono tracking-[-0.4px]">
            {formatTxHash(tx.hash)}
          </span>
          <ExternalLink className="size-[14px]" />
        </a>
      );
    }
    return (
      <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-border px-[16px] text-[14px] font-semibold text-ink-400">
        Pending
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 rounded-[12px] bg-surface-50 p-5",
        isError ? "items-start" : "items-center",
        className
      )}
      {...props}
    >
      {isError ? (
        <div className="flex items-center py-[6px]">
          <StepIndicator status={tx.status} />
        </div>
      ) : (
        <StepIndicator status={tx.status} />
      )}
      <div
        className={cn(
          "flex flex-1 flex-col",
          isError && "justify-center py-[8px]"
        )}
      >
        <p className="text-[16px] font-medium leading-[24px] text-ink-900">
          {typeof Label === "string" ? Label : <Label status={tx.status} />}
        </p>
      </div>
      {renderAction()}
    </div>
  );
};

TransactionCard.displayName = "TransactionCard";
