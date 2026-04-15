import type { ComponentPropsWithoutRef, FC } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { formatUnits } from "viem";

import {
  useRequestUnstake,
  useWithdrawUnlocked,
} from "@/lib/contract-interactions/hooks/setter";
import { tx } from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";
import { MAX_PENDING_REQUESTS, STAKING_ASSETS } from "@/lib/staking/constants";
import { formatDuration, formatToken } from "@/lib/staking/format";
import { createUnstakeSchema } from "@/lib/staking/schemas";
import { cn } from "@/lib/utils";
import { useCooldownLabel } from "@/hooks/use-cooldown-label";
import { useNowEpoch } from "@/hooks/use-now-epoch";
import { useStakingData } from "@/hooks/use-staking-data";
import { useWithdrawalRequests } from "@/hooks/use-withdrawal-requests";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { TokenInputCard } from "@/components/staking/token-input-card";

export type UnstakeTabProps = {
  isConnected: boolean;
  onConnectWallet: () => void;
};

type UnstakeTabFC = FC<
  Omit<ComponentPropsWithoutRef<"div">, keyof UnstakeTabProps> & UnstakeTabProps
>;

export const UnstakeTab: UnstakeTabFC = ({
  isConnected,
  onConnectWallet,
  className,
  ...props
}) => {
  const nowEpoch = useNowEpoch();
  const modal = useTransactionModal();
  const { cssvBalance, refetchCssvBalance, tokenDecimals } = useStakingData();

  const { cooldownLabel } = useCooldownLabel();
  const { requests: withdrawalRequests, refetch: refetchRequests } =
    useWithdrawalRequests();

  const stakedBalance = cssvBalance?.value ?? 0n;

  const requestUnstake = useRequestUnstake();
  const withdrawUnlocked = useWithdrawUnlocked();

  const isRequestLimitReached =
    withdrawalRequests.length >= MAX_PENDING_REQUESTS;

  const unlockedRequests = withdrawalRequests.filter(
    (r) => r.unlockTime <= nowEpoch
  );
  const lockedRequests = withdrawalRequests.filter(
    (r) => r.unlockTime > nowEpoch
  );
  const totalUnlockedAmount = unlockedRequests.reduce(
    (sum, r) => sum + r.amount,
    0n
  );

  const form = useForm({
    defaultValues: { amount: "" },
    mode: "onChange",
    resolver: zodResolver(
      useMemo(
        () =>
          createUnstakeSchema({
            balance: stakedBalance,
            decimals: tokenDecimals,
          }),
        [stakedBalance, tokenDecimals]
      )
    ),
  });

  const handleDone = () => {
    refetchCssvBalance();
    refetchRequests();
  };

  const unstake = form.handleSubmit(({ amount }) => {
    const label = `Unstake ${formatToken(amount, tokenDecimals)} cSSV`;

    useTransactionModal.state.open({
      transactions: [
        tx({
          write: requestUnstake.write,
          params: { args: { amount } },
          label,
        }),
      ],
      header: "Unstake cSSV",
      onDone: handleDone,
    });
  });

  const withdraw = () => {
    const amountLabel = formatToken(totalUnlockedAmount, tokenDecimals);
    useTransactionModal.state.open({
      transactions: [
        tx({
          write: withdrawUnlocked.write,
          label: `Withdraw ${amountLabel} SSV`,
        }),
      ],
      header: "Withdraw SSV",
      onDone: handleDone,
    });
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {withdrawalRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          {unlockedRequests.length > 0 && (
            <div className="flex w-full items-center justify-between rounded-[12px] border border-[#d1edfe] bg-[#e8f6fe]/50 p-5 dark:border-[#1ba5f8]/30 dark:bg-[#1ba5f8]/10">
              <span className="text-[24px] font-medium leading-[32px] text-[#0b2a3c] dark:text-[#fdfefe]">
                {formatToken(totalUnlockedAmount, tokenDecimals)} SSV
              </span>
              <button
                type="button"
                onClick={withdraw}
                disabled={modal.isOpen}
                className="rounded-[4px] bg-[#1ba5f8] px-4 py-1.5 text-[12px] font-medium leading-[20px] text-[#fdfefe] transition hover:bg-[#0d8fd8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          )}

          {lockedRequests.map((request) => {
            const countdownSeconds = Math.max(0, request.unlockTime - nowEpoch);
            return (
              <div
                key={request.id}
                className="flex w-full items-center justify-between rounded-[12px] border border-[#e6eaf7] bg-[#f9fbfc] p-5 dark:border-[#34455a] dark:bg-[#0b1620]"
              >
                <span className="flex-1 text-[24px] font-medium leading-[32px] text-[#97a5ba]">
                  {formatToken(request.amount, tokenDecimals)} SSV
                </span>
                <div className="flex h-[32px] w-[188px] items-center justify-center overflow-hidden rounded-[4px] bg-[#e6eaf7] dark:bg-[#34455a]">
                  <span className="text-[12px] font-medium leading-[20px] text-[#63768b] dark:text-[#97a5ba]">
                    Withdrawable in {formatDuration(countdownSeconds)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={unstake} className="space-y-6">
        <TokenInputCard
          balanceLabel={`Wallet Balance: ${formatToken(
            stakedBalance,
            tokenDecimals
          )}`}
          iconSrc={STAKING_ASSETS.ssvSmall}
          symbol="cSSV"
          amount={form.watch("amount")}
          onAmountChange={(v) =>
            form.setValue("amount", v, { shouldValidate: true })
          }
          onMax={() =>
            form.setValue("amount", formatUnits(stakedBalance, tokenDecimals), {
              shouldValidate: true,
            })
          }
          isConnected={isConnected}
          showMax
          error={form.formState.errors.amount?.message}
        />

        <div className="flex w-full items-center gap-3 rounded-[4px] border border-warning-400 bg-warning-bg px-4 py-3 text-[14px] text-ink-900">
          <AlertTriangle className="size-5 shrink-0 text-warning-400" />
          <p>
            You&apos;ll need to wait {cooldownLabel} before you can unstake your
            tokens. This cooldown starts when you request to unstake. Once it
            ends, you can withdraw during the unstake window.
          </p>
        </div>

        {isRequestLimitReached && (
          <div className="flex w-full items-center gap-3 rounded-[4px] border border-warning-400 bg-warning-bg px-4 py-3 text-[14px] text-ink-900">
            <AlertTriangle className="size-5 shrink-0 text-warning-400" />
            <p>
              Max pending unstake requests reached ({MAX_PENDING_REQUESTS}).
              Withdraw existing requests before creating a new one.
            </p>
          </div>
        )}

        <PrimaryActionButton
          className="font-dm-sans"
          type={isConnected ? "submit" : "button"}
          onClick={!isConnected ? onConnectWallet : undefined}
          disabled={
            isConnected && (!form.formState.isValid || isRequestLimitReached)
          }
          isActivated={modal.isOpen}
        >
          {isConnected ? "Request Unstake" : "Connect Wallet"}
        </PrimaryActionButton>
      </form>
    </div>
  );
};

UnstakeTab.displayName = "UnstakeTab";
