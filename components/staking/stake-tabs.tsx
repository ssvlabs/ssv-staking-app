"use client";
import { AlertTriangle, Check } from "lucide-react";

import { InfoIcon } from "@/components/ui/info-icon";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { TokenInputCard } from "@/components/staking/token-input-card";
import { CLAIMABLE_DECIMALS } from "@/lib/staking/constants";
import { formatDuration, formatToken } from "@/lib/staking/format";
import { WithdrawalRequest } from "@/lib/staking/types";

type StakeTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  multiWithdrawEnabled: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onMax: () => void;
  stakeBalanceLabel: string;
  unstakeBalanceLabel: string;
  ssvMedium: string;
  ssvSmall: string;
  tokenDecimals: number;
  receiptDecimals: number;
  stakeAmount: bigint;
  cooldownDurationSeconds: number;
  cooldownLabel: string;
  isConnected: boolean;
  isActionDisabled: boolean;
  isStakeFlowBusy: boolean;
  isUnstakeFlowBusy: boolean;
  hasPending: boolean;
  isUnlocked: boolean;
  pendingAmountLabel: string;
  pendingCountdownLabel: string;
  onWithdrawUnlocked: () => void;
  onRequestUnstake: () => void;
  onStake: () => void;
  withdrawalRequests: WithdrawalRequest[];
  nowEpoch: number;
  selectedWithdrawalIds: string[];
  onToggleWithdrawalSelection: (request: WithdrawalRequest) => void;
  isWithdrawActionDisabled: boolean;
  isWithdrawFlowBusy: boolean;
  onWithdrawSelected: () => void;
  claimableValue: bigint;
  ethIcon: string;
  isClaimDisabled: boolean;
  isClaimFlowBusy: boolean;
  onClaim: () => void;
};

export function StakeTabs({
  activeTab,
  onTabChange,
  multiWithdrawEnabled,
  amount,
  onAmountChange,
  onMax,
  stakeBalanceLabel,
  unstakeBalanceLabel,
  ssvMedium,
  ssvSmall,
  tokenDecimals,
  receiptDecimals,
  stakeAmount,
  cooldownDurationSeconds,
  cooldownLabel,
  isConnected,
  isActionDisabled,
  isStakeFlowBusy,
  isUnstakeFlowBusy,
  hasPending,
  isUnlocked,
  pendingAmountLabel,
  pendingCountdownLabel,
  onWithdrawUnlocked,
  onRequestUnstake,
  onStake,
  withdrawalRequests,
  nowEpoch,
  selectedWithdrawalIds,
  onToggleWithdrawalSelection,
  isWithdrawActionDisabled,
  isWithdrawFlowBusy,
  onWithdrawSelected,
  claimableValue,
  ethIcon,
  isClaimDisabled,
  isClaimFlowBusy,
  onClaim
}: StakeTabsProps) {
  const tabButtonClass = (value: string) =>
    `flex-1 rounded-[8px] px-4 py-2 text-[16px] font-semibold transition ${
      activeTab === value
        ? "bg-[#fdfefe] text-[#34455a] shadow-sm dark:bg-[#0b2a3c] dark:text-[#e6eaf7]"
        : "text-[#97a5ba]"
    }`;

  return (
    <section className="rounded-[16px] bg-[var(--color-surface-0)] p-6">
      <Tabs defaultValue="stake" value={activeTab} onValueChange={onTabChange}>
        <div className="space-y-6">
          <TabsList className="flex rounded-[12px] border border-[#e6eaf7] bg-[#f4f7fa] p-1 dark:border-[#34455a] dark:bg-[#011627]">
            <TabsTrigger className={tabButtonClass("stake")} value="stake">
              Stake
            </TabsTrigger>
            <TabsTrigger
              className={tabButtonClass("unstake")}
              value="unstake"
            >
              Unstake
            </TabsTrigger>
            {multiWithdrawEnabled ? (
              <TabsTrigger
                className={tabButtonClass("withdraw")}
                value="withdraw"
              >
                Withdraw
              </TabsTrigger>
            ) : null}
            <TabsTrigger className={tabButtonClass("claim")} value="claim">
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-6">
            <TokenInputCard
              balanceLabel={stakeBalanceLabel}
              iconSrc={ssvMedium}
              symbol="SSV"
              amount={amount}
              onAmountChange={onAmountChange}
              onMax={onMax}
              isConnected={isConnected}
            />

            <div className="space-y-3 text-[14px]">
              <div className="flex items-center justify-between text-[var(--color-ink-700)]">
                <span>You Will Receive</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {formatToken(stakeAmount, receiptDecimals)} cSSV
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-ink-700)]">
                <span>Exchange Rate</span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  1 SSV = 1 cSSV
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-ink-700)]">
                <span className="flex items-center gap-2">
                  Unstake Cooldown
                  <Tooltip content="Cooldown period after requesting an unstake before withdrawal is allowed.">
                    <span className="inline-flex size-4 items-center justify-center">
                      <InfoIcon className="size-4 text-[var(--color-ink-600)]" />
                    </span>
                  </Tooltip>
                </span>
                <span className="font-semibold text-[var(--color-ink-900)]">
                  {cooldownDurationSeconds ? cooldownLabel : "--"}
                </span>
              </div>
            </div>

            <PrimaryActionButton
              className="font-dm-sans"
              onClick={onStake}
              disabled={isActionDisabled || isStakeFlowBusy}
              isActivated={isStakeFlowBusy}
            >
              {isConnected ? "Stake" : "Connect Wallet"}
            </PrimaryActionButton>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-6">
            {!multiWithdrawEnabled && hasPending ? (
              <>
                <div className="flex h-[80px] w-full items-center justify-between rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface-50)] px-6 py-5">
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className={
                        isUnlocked
                          ? "flex size-[28px] items-center justify-center rounded-[2px] bg-[var(--color-brand-600)]"
                          : "size-[28px] rounded-[2px] border border-[var(--color-border-strong)] bg-[var(--color-border)]"
                      }
                    >
                      {isUnlocked ? (
                        <Check className="size-4 text-white" />
                      ) : null}
                    </div>
                    <p
                      className={`flex-1 font-dm-sans text-[28px] font-medium leading-[32px] ${
                        isUnlocked
                          ? "text-[var(--color-ink-900)]"
                          : "text-[var(--color-ink-400)]"
                      }`}
                    >
                      {pendingAmountLabel} cSSV
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`flex h-[40px] items-center justify-center rounded-[2px] px-4 text-[14px] font-medium ${
                        isUnlocked
                          ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-600)]"
                          : "bg-[var(--color-success-bg)] text-[var(--color-success-500)]"
                      }`}
                    >
                      {isUnlocked ? "Withdrawable" : "Requested"}
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center gap-3 rounded-[4px] border border-[var(--color-warning-400)] bg-[var(--color-warning-bg)] px-4 py-3 text-[14px] text-[var(--color-ink-900)]">
                  <AlertTriangle className="size-5 shrink-0 text-[var(--color-warning-400)]" />
                  <p>
                    You&apos;ll need to wait {cooldownLabel} before you can
                    unstake your tokens. This cooldown starts when you request
                    to unstake. Once it ends, you can withdraw during the
                    unstake window.
                  </p>
                </div>

                <PrimaryActionButton
                  className="font-dm-sans"
                  onClick={onWithdrawUnlocked}
                  disabled={isConnected && (!isUnlocked || isWithdrawFlowBusy)}
                  isActivated={isWithdrawFlowBusy}
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : isUnlocked
                    ? "Withdraw"
                    : `Withdraw in ${pendingCountdownLabel}...`}
                </PrimaryActionButton>
              </>
            ) : (
              <>
                <TokenInputCard
                  balanceLabel={unstakeBalanceLabel}
                  iconSrc={ssvSmall}
                  symbol="cSSV"
                  amount={amount}
                  onAmountChange={onAmountChange}
                  onMax={onMax}
                  isConnected={isConnected}
                  showMax={false}
                />

                <div className="flex w-full items-center gap-3 rounded-[4px] border border-[var(--color-warning-400)] bg-[var(--color-warning-bg)] px-4 py-3 text-[14px] text-[var(--color-ink-900)]">
                  <AlertTriangle className="size-5 shrink-0 text-[var(--color-warning-400)]" />
                  <p>
                    You&apos;ll need to wait {cooldownLabel} before you can
                    unstake your tokens. This cooldown starts when you request
                    to unstake. Once it ends, you can withdraw during the
                    unstake window.
                  </p>
                </div>

                <PrimaryActionButton
                  className="font-dm-sans"
                  onClick={onRequestUnstake}
                  disabled={isActionDisabled || isUnstakeFlowBusy}
                  isActivated={isUnstakeFlowBusy}
                >
                  {isConnected ? "Request Unstake" : "Connect Wallet"}
                </PrimaryActionButton>
              </>
            )}
          </TabsContent>

          {multiWithdrawEnabled ? (
            <TabsContent value="withdraw" className="space-y-6">
              {withdrawalRequests.length ? (
                <>
                  <div className="flex flex-col gap-3">
                    {withdrawalRequests.map((request) => {
                      const isUnlocked = request.unlockTime <= nowEpoch;
                      const isSelected = selectedWithdrawalIds.includes(
                        request.id
                      );
                      const countdownSeconds = Math.max(
                        0,
                        request.unlockTime - nowEpoch
                      );
                      const countdownLabel = isUnlocked
                        ? "Ready to withdraw"
                        : `Unlocks in ${formatDuration(countdownSeconds)}`;
                      return (
                        <button
                          key={request.id}
                          type="button"
                          onClick={() => onToggleWithdrawalSelection(request)}
                          disabled={!isUnlocked}
                          className={`flex w-full items-center justify-between gap-4 rounded-[4px] border px-5 py-4 text-left transition ${
                            isUnlocked
                              ? "border-[var(--color-border)] bg-[var(--color-surface-50)]"
                              : "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-100)] opacity-70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-[28px] items-center justify-center rounded-[2px] ${
                                isSelected
                                  ? "bg-[var(--color-brand-600)]"
                                  : "border border-[var(--color-border-strong)] bg-[var(--color-surface-0)]"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="size-4 text-white" />
                              ) : null}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-dm-sans text-[20px] font-medium text-[var(--color-ink-900)]">
                                {formatToken(request.amount, tokenDecimals)} SSV
                              </span>
                              <span className="text-[14px] text-[var(--color-ink-400)]">
                                {countdownLabel}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`flex h-[32px] items-center justify-center rounded-[2px] px-4 text-[14px] font-medium ${
                              isUnlocked
                                ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-600)]"
                                : "bg-[var(--color-success-bg)] text-[var(--color-success-500)]"
                            }`}
                          >
                            {isUnlocked ? "Withdrawable" : "Requested"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <PrimaryActionButton
                    className="font-dm-sans"
                    onClick={onWithdrawSelected}
                    disabled={isWithdrawActionDisabled || isWithdrawFlowBusy}
                    isActivated={isWithdrawFlowBusy}
                  >
                    {isConnected ? "Withdraw Selected" : "Connect Wallet"}
                  </PrimaryActionButton>
                </>
              ) : (
                <>
                  <div className="flex min-h-[180px] items-center justify-center text-[14px] font-medium text-[var(--color-ink-400)]">
                    No withdrawal requests pending
                  </div>
                  <PrimaryActionButton
                    className="font-dm-sans"
                    onClick={onWithdrawSelected}
                    disabled={isConnected}
                  >
                    {isConnected ? "Withdraw" : "Connect Wallet"}
                  </PrimaryActionButton>
                </>
              )}
            </TabsContent>
          ) : null}

          <TabsContent value="claim" className="space-y-6">
            <div className="rounded-[12px] border border-[var(--color-surface-100)] bg-[var(--color-surface-50)] px-[24px] py-[16px] pr-[20px]">
              <div className="flex items-center justify-between">
                <span className="text-[28px] font-medium text-[var(--color-ink-900)]">
                  {formatToken(claimableValue, CLAIMABLE_DECIMALS, 4)}
                </span>
                <div className="flex items-center gap-2">
                  <img alt="" className="size-8" src={ethIcon} />
                  <span className="text-[28px] font-medium text-[var(--color-ink-900)]">
                    ETH
                  </span>
                </div>
              </div>
            </div>
            <PrimaryActionButton
              className="font-dm-sans"
              onClick={onClaim}
              disabled={isClaimDisabled || isClaimFlowBusy}
              isActivated={isClaimFlowBusy}
            >
              {isConnected ? "Claim All" : "Connect Wallet"}
            </PrimaryActionButton>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
