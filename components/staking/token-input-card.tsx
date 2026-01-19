"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TokenInputCardProps = {
  balanceLabel: string;
  iconSrc: string;
  symbol: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onMax: () => void;
  showMax?: boolean;
  isConnected: boolean;
};

export function TokenInputCard({
  balanceLabel,
  iconSrc,
  symbol,
  amount,
  onAmountChange,
  onMax,
  showMax = true,
  isConnected
}: TokenInputCardProps) {
  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-100)] px-6 py-4">
      <div className="flex items-center justify-between">
        <Input
          className="w-full text-[28px] font-medium text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)]"
          placeholder="0.0"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          disabled={!isConnected}
        />
        <div className="flex items-center gap-3">
          <span
            className={
              symbol === "cSSV"
                ? "flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c8de6_0%,#3e75e2_100%)] p-[6px]"
                : "flex size-8 items-center justify-center"
            }
          >
            <img
              alt={symbol}
              className={symbol === "cSSV" ? "size-5" : "size-8"}
              src={iconSrc}
            />
          </span>
          <span className="text-[28px] font-medium text-[var(--color-ink-900)]">
            {symbol}
          </span>
        </div>
      </div>
      <div className="my-4 h-px w-full bg-[var(--color-border)]" />
      <div className="flex items-center justify-between text-[16px] text-[var(--color-ink-400)]">
        <span>{balanceLabel}</span>
        {showMax ? (
          <Button
            className="text-[16px] font-medium text-[var(--color-staking-primary-500)]"
            onClick={onMax}
            disabled={!isConnected}
          >
            MAX
          </Button>
        ) : null}
      </div>
    </div>
  );
}
