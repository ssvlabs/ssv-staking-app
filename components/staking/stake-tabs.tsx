"use client";

import { AlertTriangle } from "lucide-react";
import Image from "next/image";

import { TokenInputCard } from "@/components/staking/token-input-card";
import { InfoIcon } from "@/components/ui/info-icon";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { formatDuration, formatToken } from "@/lib/staking/format";
import { WithdrawalRequest } from "@/lib/staking/types";
import { formatEther } from "viem";

type StakeTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
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
  onWithdrawUnlocked: () => void;
  onRequestUnstake: () => void;
  onStake: () => void;
  withdrawalRequests: WithdrawalRequest[];
  nowEpoch: number;
  isWithdrawFlowBusy: boolean;
  claimableValue: bigint;
  ethIcon: string;
  isClaimDisabled: boolean;
  isClaimFlowBusy: boolean;
  onClaim: () => void;
};

function StakeTabs({
  activeTab,
  onTabChange,
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
  onWithdrawUnlocked,
  onRequestUnstake,
  onStake,
  withdrawalRequests,
  nowEpoch,
  isWithdrawFlowBusy,
  claimableValue,
  ethIcon,
  isClaimDisabled,
  isClaimFlowBusy,
  onClaim,
}: StakeTabsProps) {
  const tabButtonClass = (value: string) =>
    `flex-1 rounded-[8px] px-4 py-2 text-[16px] font-semibold transition ${
      activeTab === value
        ? "bg-[#fdfefe] text-[#34455a] shadow-sm dark:bg-[#0b2a3c] dark:text-[#e6eaf7]"
        : "text-[#97a5ba]"
    }`;

  return (
    <section className="rounded-[16px] bg-surface-0 p-6">
      <Tabs defaultValue="stake" value={activeTab} onValueChange={onTabChange}>
        <div className="space-y-6">
          <TabsList className="flex rounded-[12px] border border-[#e6eaf7] bg-[#f4f7fa] p-1 dark:border-[#34455a] dark:bg-[#011627]">
            <TabsTrigger className={tabButtonClass("stake")} value="stake">
              Stake
            </TabsTrigger>
            <TabsTrigger className={tabButtonClass("unstake")} value="unstake">
              Unstake
            </TabsTrigger>
            <TabsTrigger className={tabButtonClass("claim")} value="claim">
              Claim
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
              <div className="flex items-center justify-between text-ink-700">
                <span>You Will Receive</span>
                <span className="font-semibold text-ink-900">
                  {formatToken(stakeAmount, receiptDecimals)} cSSV
                </span>
              </div>
              <div className="flex items-center justify-between text-ink-700">
                <span>Exchange Rate</span>
                <span className="font-semibold text-ink-900">
                  1 SSV = 1 cSSV
                </span>
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
              onClick={onStake}
              disabled={isActionDisabled || isStakeFlowBusy}
              isActivated={isStakeFlowBusy}
            >
              {isConnected ? "Stake" : "Connect Wallet"}
            </PrimaryActionButton>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-6">
            {withdrawalRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {(() => {
                  const unlockedRequests = withdrawalRequests.filter(
                    (request) => request.unlockTime <= nowEpoch
                  );
                  const lockedRequests = withdrawalRequests.filter(
                    (request) => request.unlockTime > nowEpoch
                  );

                  return (
                    <>
                      {unlockedRequests.length > 0 && (
                        <div className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-brand-100 bg-brand-50 px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-dm-sans text-[20px] font-medium text-ink-900">
                              {formatToken(
                                unlockedRequests.reduce(
                                  (sum, req) => sum + req.amount,
                                  0n
                                ),
                                tokenDecimals
                              )}{" "}
                              SSV
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={onWithdrawUnlocked}
                            disabled={isWithdrawFlowBusy}
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
                        const countdownLabel = formatDuration(countdownSeconds);
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
                              Withdrawable in {countdownLabel}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            ) : null}

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

            <div className="flex w-full items-center gap-3 rounded-[4px] border border-warning-400 bg-warning-bg px-4 py-3 text-[14px] text-ink-900">
              <AlertTriangle className="size-5 shrink-0 text-warning-400" />
              <p>
                You&apos;ll need to wait {cooldownLabel} before you can unstake
                your tokens. This cooldown starts when you request to unstake.
                Once it ends, you can withdraw during the unstake window.
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
          </TabsContent>

          <TabsContent value="claim" className="space-y-6">
            <div className="rounded-[12px] border border-surface-100 bg-surface-50 px-[24px] py-[16px] pr-[20px]">
              <div className="flex items-center justify-between">
                <span className="text-[28px] font-medium text-ink-900">
                  {formatEther(claimableValue)}
                </span>
                <div className="flex items-center gap-2">
                  <Image
                    alt=""
                    className="size-8"
                    src={ethIcon}
                    width={32}
                    height={32}
                  />
                  <span className="text-[28px] font-medium text-ink-900">
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

export default StakeTabs;
