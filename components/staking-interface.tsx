"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { getNetworkConfigByChainId } from "@/lib/config";
import { STAKING_ASSETS } from "@/lib/staking/constants";
import { STAKING_COPY } from "@/lib/staking/copy";
import { addCssvToMetamask } from "@/lib/staking/metamask";
import {
  buildApprovalAndActionSteps,
  buildSingleStep
} from "@/lib/staking/tx-steps";
import { useAprMetric } from "@/lib/staking/use-apr-metric";
import { useStakeFlows } from "@/lib/staking/use-stake-flows";
import { useStakingData } from "@/lib/staking/use-staking-data";
import StakeTabs from "@/components/staking/stake-tabs";
import { StakingBalances } from "@/components/staking/staking-balances";
import { StakingHeader } from "@/components/staking/staking-header";
import { TxFlowFooter } from "@/components/staking/tx-flow-footer";
import { TxFlowModal } from "@/components/staking/tx-flow-modal";
import { TxStepList } from "@/components/staking/tx-step-list";

const { ssvLarge, ssvMedium, ssvSmall, ethIcon, metamaskIcon, calculatorIcon } =
  STAKING_ASSETS;

export default function StakingInterface() {
  const { address, chainId, isConnected } = useAccount();
  const activeNetwork = getNetworkConfigByChainId(chainId);
  const { openConnectModal } = useConnectModal();
  const multiWithdrawEnabled = true;
  const { aprValue, potentialAprValue, refreshApr } = useAprMetric(chainId);
  const {
    ssvBalanceFormatted,
    ssvBalanceValue,
    stakedBalanceValue,
    claimableValue,
    totalStakedValue,
    tokenDecimals,
    receiptDecimals,
    cooldownDurationSeconds,
    cooldownLabel,
    ssvAllowanceValue,
    cssvAllowanceValue,
    withdrawalRequests,
    refreshAll,
    refetchSsvAllowance,
    refetchCssvAllowance
  } = useStakingData({ address });
  const handleAnyTxConfirmed = useCallback(() => {
    refreshAll();
    void refreshApr();
  }, [refreshAll, refreshApr]);

  const {
    activeTab,
    setActiveTab,
    amount,
    setAmount,
    handleMax,
    nowEpoch,
    stakeAmount,
    hasPending,
    isUnlocked,
    pendingAmountLabel,
    pendingCountdownLabel,
    isActionDisabled,
    isClaimDisabled,
    isWithdrawActionDisabled,
    selectedWithdrawalIds,
    toggleWithdrawalSelection,
    stakeFlowOpen,
    unstakeFlowOpen,
    withdrawFlowOpen,
    claimFlowOpen,
    stakeFlowNeedsApproval,
    unstakeFlowNeedsApproval,
    approvalStatus,
    stakeStatus,
    unstakeApprovalStatus,
    unstakeStatus,
    withdrawStatus,
    claimStatus,
    approvalHash,
    stakeHash,
    unstakeApprovalHash,
    unstakeHash,
    withdrawHash,
    claimHash,
    approvalRowLabel,
    stakeRowLabel,
    unstakeApprovalRowLabel,
    unstakeRowLabel,
    withdrawRowLabel,
    claimRowLabel,
    stakeFlowComplete,
    stakeFlowHasError,
    unstakeFlowComplete,
    unstakeFlowHasError,
    withdrawFlowComplete,
    withdrawFlowHasError,
    claimFlowComplete,
    claimFlowHasError,
    isStakeFlowBusy,
    isUnstakeFlowBusy,
    isWithdrawFlowBusy,
    isClaimFlowBusy,
    stakeRetryDisabled,
    unstakeRetryDisabled,
    withdrawRetryDisabled,
    claimRetryDisabled,
    stakeBalanceLabel,
    unstakeBalanceLabel,
    handleStakeFlow,
    handleRequestUnstake,
    handleWithdrawSelected,
    handleWithdrawUnlocked,
    handleClaim,
    retryApproval,
    retryStake,
    retryUnstakeApproval,
    retryUnstake,
    retryWithdraw,
    retryClaim,
    closeStakeFlow,
    closeUnstakeFlow,
    closeWithdrawFlow,
    closeClaimFlow
  } = useStakeFlows({
    isConnected,
    openConnectModal,
    ssvBalanceFormatted,
    ssvBalanceValue,
    stakedBalanceValue,
    claimableValue,
    ssvAllowanceValue,
    cssvAllowanceValue,
    withdrawalRequests,
    tokenDecimals,
    receiptDecimals,
    multiWithdrawEnabled,
    onAnyTxConfirmed: handleAnyTxConfirmed,
    onSsvApprovalConfirmed: refetchSsvAllowance,
    onCssvApprovalConfirmed: refetchCssvAllowance
  });

  const stakeSteps = buildApprovalAndActionSteps(
    stakeFlowNeedsApproval,
    {
      status: approvalStatus,
      label: approvalRowLabel,
      hash: approvalHash,
      onRetry: retryApproval,
      disabled: stakeRetryDisabled
    },
    {
      status: stakeStatus,
      label: stakeRowLabel,
      hash: stakeHash,
      onRetry: retryStake,
      disabled: stakeRetryDisabled
    },
    {
      action: STAKING_COPY.actions.stake
    }
  );

  const unstakeSteps = buildApprovalAndActionSteps(
    unstakeFlowNeedsApproval,
    {
      status: unstakeApprovalStatus,
      label: unstakeApprovalRowLabel,
      hash: unstakeApprovalHash,
      onRetry: retryUnstakeApproval,
      disabled: unstakeRetryDisabled
    },
    {
      status: unstakeStatus,
      label: unstakeRowLabel,
      hash: unstakeHash,
      onRetry: retryUnstake,
      disabled: unstakeRetryDisabled
    },
    {
      action: STAKING_COPY.actions.unstake
    }
  );

  const withdrawSteps = buildSingleStep(
    {
      status: withdrawStatus,
      label: withdrawRowLabel,
      hash: withdrawHash,
      onRetry: retryWithdraw,
      disabled: withdrawRetryDisabled
    },
    STAKING_COPY.actions.withdraw
  );

  const claimSteps = buildSingleStep(
    {
      status: claimStatus,
      label: claimRowLabel,
      hash: claimHash,
      onRetry: retryClaim,
      disabled: claimRetryDisabled
    },
    STAKING_COPY.actions.claim
  );

  const handleAddCssvToMetamask = async () => {
    await addCssvToMetamask({
      tokenAddress: activeNetwork.contracts.cSSVToken,
      decimals: receiptDecimals,
      image: ssvSmall,
      onError: (message) => toast.error(message)
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[648px] flex-col gap-6 pb-6">
      <StakingHeader
        aprValue={aprValue}
        potentialAprValue={potentialAprValue}
        totalStakedValue={totalStakedValue}
        tokenDecimals={tokenDecimals}
        ssvSmall={ssvSmall}
        calculatorIcon={calculatorIcon}
      />
      <StakingBalances
        ssvBalanceValue={ssvBalanceValue}
        stakedBalanceValue={stakedBalanceValue}
        claimableValue={claimableValue}
        tokenDecimals={tokenDecimals}
        receiptDecimals={receiptDecimals}
        ssvLarge={ssvLarge}
        ssvSmall={ssvSmall}
        ethIcon={ethIcon}
      />
      <StakeTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        amount={amount}
        onAmountChange={setAmount}
        onMax={handleMax}
        stakeBalanceLabel={stakeBalanceLabel}
        unstakeBalanceLabel={unstakeBalanceLabel}
        ssvMedium={ssvMedium}
        ssvSmall={ssvSmall}
        tokenDecimals={tokenDecimals}
        receiptDecimals={receiptDecimals}
        stakeAmount={stakeAmount}
        cooldownDurationSeconds={cooldownDurationSeconds}
        cooldownLabel={cooldownLabel}
        isConnected={isConnected}
        isActionDisabled={isActionDisabled}
        isStakeFlowBusy={isStakeFlowBusy}
        isUnstakeFlowBusy={isUnstakeFlowBusy}
        onWithdrawUnlocked={handleWithdrawUnlocked}
        onRequestUnstake={handleRequestUnstake}
        onStake={handleStakeFlow}
        withdrawalRequests={withdrawalRequests}
        nowEpoch={nowEpoch}
        isWithdrawFlowBusy={isWithdrawFlowBusy}
        claimableValue={claimableValue}
        ethIcon={ethIcon}
        isClaimDisabled={isClaimDisabled}
        isClaimFlowBusy={isClaimFlowBusy}
        onClaim={handleClaim}
        faucetUrl={activeNetwork.faucetUrl}
        ssvBalanceValue={ssvBalanceValue}
        stakedBalanceValue={stakedBalanceValue}
      />
      {/* <section className="rounded-[16px] bg-surface-25 p-6">
        <p className="font-dm-sans text-[18px] font-semibold text-ink-500">
          FAQ
        </p>
        <div className="mt-4 space-y-3">
          {STAKING_FAQ.map((item) => (
            <div key={item.id} className="rounded-[12px] bg-surface-100 p-5">
              <Faq question={item.question} answer={item.answer} />
            </div>
          ))}
        </div>
      </section> */}

      <TxFlowModal
        title={STAKING_COPY.modals.stake}
        isOpen={stakeFlowOpen}
        onClose={closeStakeFlow}
      >
        <TxStepList steps={stakeSteps} />
        {stakeFlowComplete && !stakeFlowHasError ? (
          <div className="flex w-full justify-center">
            <button
              className="mt-4 inline-flex h-[40px] items-center gap-2 rounded-[12px] bg-brand-50 px-5 text-[14px] font-semibold text-brand-600"
              onClick={handleAddCssvToMetamask}
              type="button"
            >
              <span className="truncate">
                {STAKING_COPY.buttons.addToMetamask}
              </span>
              <Image
                alt=""
                className="size-4"
                src={metamaskIcon}
                width={16}
                height={16}
              />
            </button>
          </div>
        ) : null}
        {stakeFlowComplete && !stakeFlowHasError ? (
          <TxFlowFooter onClose={closeStakeFlow} />
        ) : null}
      </TxFlowModal>

      <TxFlowModal
        title={STAKING_COPY.modals.unstake}
        isOpen={unstakeFlowOpen}
        onClose={closeUnstakeFlow}
      >
        <TxStepList steps={unstakeSteps} />
        {unstakeFlowComplete && !unstakeFlowHasError ? (
          <TxFlowFooter onClose={closeUnstakeFlow} />
        ) : null}
      </TxFlowModal>

      <TxFlowModal
        title={STAKING_COPY.modals.withdraw}
        isOpen={withdrawFlowOpen}
        onClose={closeWithdrawFlow}
      >
        <TxStepList steps={withdrawSteps} />
        {withdrawFlowComplete && !withdrawFlowHasError ? (
          <TxFlowFooter onClose={closeWithdrawFlow} />
        ) : null}
      </TxFlowModal>

      <TxFlowModal
        title={STAKING_COPY.modals.claim}
        isOpen={claimFlowOpen}
        onClose={closeClaimFlow}
      >
        <TxStepList steps={claimSteps} />
        {claimFlowComplete && !claimFlowHasError ? (
          <TxFlowFooter onClose={closeClaimFlow} />
        ) : null}
      </TxFlowModal>
    </div>
  );
}
