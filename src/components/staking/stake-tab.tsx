import type { ComponentPropsWithoutRef, FC } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { useStake } from "@/lib/contract-interactions/hooks/setter";
import {
  useAllowance,
  useApprove,
} from "@/lib/contract-interactions/hooks/token";
import { globals } from "@/lib/globals";
import { tx } from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";
import {
  MINIMAL_STAKING_AMOUNT,
  STAKING_ASSETS,
} from "@/lib/staking/constants";
import { formatToken } from "@/lib/staking/format";
import { createStakeSchema } from "@/lib/staking/schemas";
import { cn } from "@/lib/utils";
import { useCooldownLabel } from "@/hooks/use-cooldown-label";
import { useNetworkConfig } from "@/hooks/use-network-config";
import { useStakingData } from "@/hooks/use-staking-data";
import { InfoIcon } from "@/components/ui/info-icon";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Tooltip } from "@/components/ui/tooltip";
import { TokenInputCard } from "@/components/staking/token-input-card";

export type StakeTabProps = {
  isConnected: boolean;
  onConnectWallet: () => void;
};

type StakeTabFC = FC<
  Omit<ComponentPropsWithoutRef<"form">, keyof StakeTabProps> & StakeTabProps
>;

export const StakeTab: StakeTabFC = ({
  isConnected,
  onConnectWallet,
  className,
  ...props
}) => {
  const { address } = useAccount();
  const network = useNetworkConfig();
  const { ssvBalance, refetchSsvBalance, tokenDecimals } = useStakingData();

  const { data: ssvAllowance, refetch: refetchAllowance } = useAllowance(
    { owner: address!, spender: network.contracts.Setter },
    { contract: network.contracts.SSVToken, enabled: !!address }
  );

  const { cooldownDurationSeconds, cooldownLabel } = useCooldownLabel();

  const balance = ssvBalance?.value ?? 0n;
  const allowance = (ssvAllowance as bigint) ?? 0n;

  const stake = useStake();
  const approveSsv = useApprove({ contract: network.contracts.SSVToken });
  const modal = useTransactionModal();

  const form = useForm({
    defaultValues: { amount: "" },
    mode: "onChange",
    resolver: zodResolver(
      useMemo(
        () => createStakeSchema({ balance, decimals: tokenDecimals }),
        [balance, tokenDecimals]
      )
    ),
  });

  const rawAmount = form.watch("amount");
  const parsedAmount = useMemo(() => {
    try {
      return parseUnits(rawAmount.replace(/,/g, ""), tokenDecimals);
    } catch {
      return 0n;
    }
  }, [rawAmount, tokenDecimals]);

  const isBelowMinimum =
    isConnected && parsedAmount > 0n && parsedAmount < MINIMAL_STAKING_AMOUNT;
  const minimalStakeLabel = formatUnits(MINIMAL_STAKING_AMOUNT, tokenDecimals);
  const isInsufficient =
    isConnected && parsedAmount > 0n && parsedAmount > balance;

  const submit = form.handleSubmit(({ amount }) => {
    const needsApproval = allowance < amount;
    const label = `Stake ${formatToken(amount, tokenDecimals)} SSV`;

    useTransactionModal.state.open({
      transactions: [
        ...(needsApproval
          ? [
              tx({
                write: approveSsv.write,
                params: {
                  args: {
                    spender: network.contracts.Setter,
                    amount: globals.MAX_WEI_AMOUNT,
                  },
                },
                label: "Approve SSV",
              }),
            ]
          : []),
        tx({ write: stake.write, params: { args: { amount } }, label }),
      ],
      header: "Stake SSV",
      addTokenToWallet: {
        decimals: 18,
        tokenAddress: network.contracts.cSSVToken,
        tokenName: "cSSV",
      },
      onDone: () => {
        refetchSsvBalance();
        refetchAllowance();
      },
    });
  });

  const handleMax = () => {
    form.setValue("amount", formatUnits(balance, tokenDecimals), {
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={submit} className={cn("space-y-6", className)} {...props}>
      <TokenInputCard
        balanceLabel={`Wallet Balance: ${formatToken(balance, tokenDecimals)}`}
        iconSrc={STAKING_ASSETS.ssvMedium}
        symbol="SSV"
        amount={rawAmount}
        onAmountChange={(v) =>
          form.setValue("amount", v, { shouldValidate: true })
        }
        onMax={handleMax}
        isConnected={isConnected}
        error={form.formState.errors.amount?.message}
      />

      {isInsufficient && (
        <div className="flex w-full items-center justify-between gap-3 rounded-[4px] border border-danger-500 bg-danger-bg px-4 py-3 text-[14px] text-ink-900">
          <p>
            Insufficient SSV balance. There is not enough SSV in your wallet.
          </p>
          {network.faucetUrl ? (
            <a
              href={network.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-700 shrink-0 font-semibold text-brand-600 no-underline"
            >
              Need SSV?
            </a>
          ) : null}
        </div>
      )}

      {isBelowMinimum && (
        <div className="flex w-full items-center gap-3 rounded-[4px] border border-warning-400 bg-warning-bg px-4 py-3 text-[14px] text-ink-900">
          <p>Minimum stake amount is {minimalStakeLabel} SSV.</p>
        </div>
      )}

      <div className="space-y-3 text-[14px]">
        <div className="flex items-center justify-between text-ink-700">
          <span>You Will Receive</span>
          <span className="font-semibold text-ink-900">
            {formatToken(parsedAmount, tokenDecimals)} cSSV
          </span>
        </div>
        <div className="flex items-center justify-between text-ink-700">
          <span>Exchange Rate</span>
          <span className="font-semibold text-ink-900">1 SSV = 1 cSSV</span>
        </div>
        <div className="flex items-center justify-between text-ink-700">
          <span className="flex items-center gap-2">
            Unstake Cooldown
            <Tooltip content="Cooldown period after requesting an unstake before withdrawal is allowed.">
              <span className="inline-flex size-4 items-center justify-center">
                <InfoIcon className="size-4 text-ink-600" />
              </span>
            </Tooltip>
          </span>
          <span className="font-semibold text-ink-900">
            {cooldownDurationSeconds ? cooldownLabel : "--"}
          </span>
        </div>
      </div>

      <PrimaryActionButton
        className="font-dm-sans"
        type={isConnected ? "submit" : "button"}
        onClick={!isConnected ? onConnectWallet : undefined}
        disabled={isConnected && !form.formState.isValid}
        isActivated={modal.isOpen}
      >
        {isConnected ? "Stake" : "Connect Wallet"}
      </PrimaryActionButton>
    </form>
  );
};

StakeTab.displayName = "StakeTab";
