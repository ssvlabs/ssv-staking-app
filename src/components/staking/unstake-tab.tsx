import type { ComponentPropsWithoutRef, FC } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import { getNetworkConfigByChainId } from "@/lib/config";
import {
  useRequestUnstake,
  useWithdrawUnlocked,
} from "@/lib/contract-interactions/hooks/setter";
import {
  useAllowance,
  useApprove,
  useDecimals,
} from "@/lib/contract-interactions/hooks/token";
import { globals } from "@/lib/globals";
import { tx } from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";
import { MAX_PENDING_REQUESTS, STAKING_ASSETS } from "@/lib/staking/constants";
import { formatDuration, formatToken } from "@/lib/staking/format";
import { createUnstakeSchema } from "@/lib/staking/schemas";
import { cn } from "@/lib/utils";
import { useCooldownLabel } from "@/hooks/use-cooldown-label";
import { useNowEpoch } from "@/hooks/use-now-epoch";
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
  const { address, chainId } = useAccount();
  const network = getNetworkConfigByChainId(chainId);
  const nowEpoch = useNowEpoch();
  const modal = useTransactionModal();

  const { data: cssvBalance, refetch: refetchBalance } = useBalance({
    address,
    token: network.contracts.cSSVToken,
    query: { enabled: !!address },
  });
  const { data: cssvAllowance, refetch: refetchAllowance } = useAllowance(
    { owner: address!, spender: network.contracts.Setter },
    { contract: network.contracts.cSSVToken, enabled: !!address }
  );
  const { data: ssvDecimals } = useDecimals({
    contract: network.contracts.SSVToken,
  });
  const { cooldownLabel } = useCooldownLabel();
  const { requests: withdrawalRequests, refetch: refetchRequests } =
    useWithdrawalRequests();

  const stakedBalance = cssvBalance?.value ?? 0n;
  const receiptDecimals = cssvBalance?.decimals ?? 18;
  const tokenDecimals = Number(ssvDecimals ?? receiptDecimals);
  const allowance = (cssvAllowance as bigint) ?? 0n;

  const requestUnstake = useRequestUnstake();
  const withdrawUnlocked = useWithdrawUnlocked();
  const approveCssv = useApprove({ contract: network.contracts.cSSVToken });

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

  const schema = useMemo(
    () =>
      createUnstakeSchema({
        balance: stakedBalance,
        decimals: receiptDecimals,
      }),
    [stakedBalance, receiptDecimals]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
    mode: "onChange",
  });

  const handleDone = () => {
    refetchBalance();
    refetchAllowance();
    refetchRequests();
  };

  const submit = form.handleSubmit(({ amount }) => {
    const needsApproval = allowance < amount;
    const label = `Unstake ${formatToken(amount, receiptDecimals)} cSSV`;

    useTransactionModal.state.open({
      transactions: [
        ...(needsApproval
          ? [
              tx({
                write: approveCssv.write,
                params: {
                  args: {
                    spender: network.contracts.Setter,
                    amount: globals.MAX_WEI_AMOUNT,
                  },
                },
                label: "Approve cSSV",
              }),
            ]
          : []),
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

  const handleWithdraw = () => {
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
            <div className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-brand-100 bg-brand-50 px-5 py-4">
              <div className="flex flex-col">
                <span className="font-dm-sans text-[20px] font-medium text-ink-900">
                  {formatToken(totalUnlockedAmount, tokenDecimals)} SSV
                </span>
              </div>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={modal.isOpen}
                className="hover:bg-brand-700 h-[36px] rounded-[6px] bg-brand-600 px-4 text-[14px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          )}

          {lockedRequests.map((request) => {
            const countdownSeconds = Math.max(
              0,
              request.unlockTime - nowEpoch
            );
            return (
              <div
                key={request.id}
                className="flex w-full items-center justify-between gap-4 rounded-[12px] bg-surface-50 px-5 py-4"
              >
                <div className="flex flex-col">
                  <span className="font-dm-sans text-[20px] font-medium text-gray-300">
                    {formatToken(request.amount, tokenDecimals)} SSV
                  </span>
                </div>
                <div className="flex h-[36px] items-center justify-center rounded-[4px] border border-surface-100 bg-gray-300 px-4 py-0 text-[14px] font-semibold text-gray-600">
                  Withdrawable in {formatDuration(countdownSeconds)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <TokenInputCard
          balanceLabel={`Wallet Balance: ${formatToken(stakedBalance, receiptDecimals)}`}
          iconSrc={STAKING_ASSETS.ssvSmall}
          symbol="cSSV"
          amount={form.watch("amount")}
          onAmountChange={(v) =>
            form.setValue("amount", v, { shouldValidate: true })
          }
          onMax={() =>
            form.setValue(
              "amount",
              formatUnits(stakedBalance, receiptDecimals),
              { shouldValidate: true }
            )
          }
          isConnected={isConnected}
          showMax={false}
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
