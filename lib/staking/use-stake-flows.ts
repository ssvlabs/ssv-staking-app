"use client";

import * as React from "react";
import { toast } from "sonner";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ERC20ABI, StakingABI } from "@/lib/abis";
import { CONFIG } from "@/lib/config";
import { useInterval } from "@/hooks/use-interval";
import { CLAIMABLE_DECIMALS } from "@/lib/staking/constants";
import { formatDuration, formatToken, safeParse } from "@/lib/staking/format";
import { StepStatus, WithdrawalRequest } from "@/lib/staking/types";

type UseStakeFlowsOptions = {
  isConnected: boolean;
  openConnectModal?: () => void;
  ssvBalanceFormatted?: string;
  ssvBalanceValue?: bigint;
  stakedBalanceValue?: bigint;
  claimableValue: bigint;
  ssvAllowanceValue: bigint;
  cssvAllowanceValue: bigint;
  withdrawalRequests: WithdrawalRequest[];
  tokenDecimals: number;
  receiptDecimals: number;
  multiWithdrawEnabled: boolean;
  onAnyTxConfirmed?: () => void;
  onSsvApprovalConfirmed?: () => void;
  onCssvApprovalConfirmed?: () => void;
};

export function useStakeFlows({
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
  onAnyTxConfirmed,
  onSsvApprovalConfirmed,
  onCssvApprovalConfirmed
}: UseStakeFlowsOptions) {
  const [activeTab, setActiveTab] = React.useState("stake");
  const [amount, setAmount] = React.useState("");
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>();
  const [txLabel, setTxLabel] = React.useState<string | null>(null);
  const [toastId, setToastId] = React.useState<string | number | null>(null);
  const [stakeFlowOpen, setStakeFlowOpen] = React.useState(false);
  const [nowEpoch, setNowEpoch] = React.useState(() =>
    Math.floor(Date.now() / 1000)
  );
  const [stakeFlowAmount, setStakeFlowAmount] = React.useState<bigint>(0n);
  const [stakeFlowNeedsApproval, setStakeFlowNeedsApproval] =
    React.useState(false);
  const [unstakeFlowOpen, setUnstakeFlowOpen] = React.useState(false);
  const [unstakeFlowAmount, setUnstakeFlowAmount] = React.useState<bigint>(0n);
  const [unstakeFlowNeedsApproval, setUnstakeFlowNeedsApproval] =
    React.useState(false);
  const [withdrawFlowOpen, setWithdrawFlowOpen] = React.useState(false);
  const [withdrawFlowAmount, setWithdrawFlowAmount] =
    React.useState<bigint>(0n);
  const [withdrawFlowIds, setWithdrawFlowIds] = React.useState<string[]>([]);
  const [claimFlowOpen, setClaimFlowOpen] = React.useState(false);
  const [claimFlowAmount, setClaimFlowAmount] = React.useState<bigint>(0n);
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = React.useState<
    string[]
  >([]);
  const [approvalStatus, setApprovalStatus] =
    React.useState<StepStatus>("idle");
  const [stakeStatus, setStakeStatus] = React.useState<StepStatus>("idle");
  const [unstakeApprovalStatus, setUnstakeApprovalStatus] =
    React.useState<StepStatus>("idle");
  const [unstakeStatus, setUnstakeStatus] =
    React.useState<StepStatus>("idle");
  const [withdrawStatus, setWithdrawStatus] =
    React.useState<StepStatus>("idle");
  const [claimStatus, setClaimStatus] = React.useState<StepStatus>("idle");
  const [approvalHash, setApprovalHash] = React.useState<`0x${string}` | null>(
    null
  );
  const [stakeHash, setStakeHash] = React.useState<`0x${string}` | null>(null);
  const [unstakeApprovalHash, setUnstakeApprovalHash] = React.useState<
    `0x${string}` | null
  >(null);
  const [unstakeHash, setUnstakeHash] = React.useState<`0x${string}` | null>(
    null
  );
  const [withdrawHash, setWithdrawHash] = React.useState<`0x${string}` | null>(
    null
  );
  const [claimHash, setClaimHash] = React.useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) }
  });
  const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash ?? undefined,
    query: { enabled: Boolean(approvalHash) }
  });
  const { isSuccess: isStakeConfirmed } = useWaitForTransactionReceipt({
    hash: stakeHash ?? undefined,
    query: { enabled: Boolean(stakeHash) }
  });
  const { isSuccess: isUnstakeApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: unstakeApprovalHash ?? undefined,
      query: { enabled: Boolean(unstakeApprovalHash) }
    });
  const { isSuccess: isUnstakeConfirmed } = useWaitForTransactionReceipt({
    hash: unstakeHash ?? undefined,
    query: { enabled: Boolean(unstakeHash) }
  });
  const { isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({
    hash: withdrawHash ?? undefined,
    query: { enabled: Boolean(withdrawHash) }
  });
  const { isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash ?? undefined,
    query: { enabled: Boolean(claimHash) }
  });

  const primaryPending = withdrawalRequests[0];
  const pendingAmount = primaryPending?.amount ?? 0n;
  const unlockTimeSeconds = primaryPending?.unlockTime ?? 0;
  const hasPending = Boolean(primaryPending);
  const isCooldown = hasPending && unlockTimeSeconds > nowEpoch;
  const isUnlocked = hasPending && unlockTimeSeconds <= nowEpoch;
  const cooldownSeconds = isCooldown
    ? Math.max(0, unlockTimeSeconds - nowEpoch)
    : 0;

  const stakeAmount = safeParse(amount, tokenDecimals);
  const unstakeAmount = safeParse(amount, receiptDecimals);
  const actionAmount = activeTab === "unstake" ? unstakeAmount : stakeAmount;

  const isActionDisabled = isConnected && actionAmount === 0n;
  const isClaimDisabled = isConnected && claimableValue === 0n;
  const pendingAmountLabel = formatToken(pendingAmount, receiptDecimals);
  const pendingCountdownLabel = formatDuration(cooldownSeconds);
  const selectedWithdrawals = withdrawalRequests.filter((request) =>
    selectedWithdrawalIds.includes(request.id)
  );
  const selectedWithdrawable = selectedWithdrawals.filter(
    (request) => request.unlockTime <= nowEpoch
  );
  const selectedWithdrawAmount = selectedWithdrawable.reduce(
    (total, request) => total + request.amount,
    0n
  );
  const isWithdrawActionDisabled =
    isConnected && selectedWithdrawable.length === 0;

  const sendTransaction = React.useCallback(
    async (label: string, config: Parameters<typeof writeContractAsync>[0]) => {
      if (!writeContractAsync) return undefined;
      let pendingToast: string | number | null = null;
      try {
        pendingToast = toast.loading("Transaction pending...");
        setToastId(pendingToast);
        setTxLabel(label);
        const hash = await writeContractAsync(config);
        setTxHash(hash);
        return hash;
      } catch (error) {
        if (pendingToast) toast.dismiss(pendingToast);
        const message =
          (error as { shortMessage?: string; details?: string })?.shortMessage ||
          (error as { cause?: { shortMessage?: string } })?.cause?.shortMessage ||
          (error as { message?: string })?.message ||
          "Transaction failed";
        console.error("Transaction error:", error);
        toast.error(`${label} failed: ${message}`);
        setTxLabel(null);
        setToastId(null);
        setTxHash(undefined);
        return undefined;
      }
    },
    [writeContractAsync]
  );

  const startStakeTransaction = React.useCallback(
    async (amountToStake: bigint) => {
      setStakeStatus("waiting");
      const hash = await sendTransaction("Stake", {
        address: CONFIG.contracts.Staking,
        abi: StakingABI,
        functionName: "stake",
        args: [amountToStake]
      });
      if (!hash) {
        setStakeStatus("error");
        return;
      }
      setStakeHash(hash);
      setStakeStatus("submitted");
    },
    [sendTransaction]
  );

  const startApprovalTransaction = React.useCallback(
    async (amountToApprove: bigint) => {
      setApprovalStatus("waiting");
      const hash = await sendTransaction("Approve SSV", {
        address: CONFIG.contracts.SSVToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [CONFIG.contracts.Staking, amountToApprove]
      });
      if (!hash) {
        setApprovalStatus("error");
        return;
      }
      setApprovalHash(hash);
      setApprovalStatus("submitted");
    },
    [sendTransaction]
  );

  const startUnstakeTransaction = React.useCallback(
    async (amountToUnstake: bigint) => {
      setUnstakeStatus("waiting");
      const hash = await sendTransaction("Request Unstake", {
        address: CONFIG.contracts.Staking,
        abi: StakingABI,
        functionName: "requestUnstake",
        args: [amountToUnstake]
      });
      if (!hash) {
        setUnstakeStatus("error");
        return;
      }
      setUnstakeHash(hash);
      setUnstakeStatus("submitted");
    },
    [sendTransaction]
  );

  const startUnstakeApprovalTransaction = React.useCallback(
    async (amountToApprove: bigint) => {
      setUnstakeApprovalStatus("waiting");
      const hash = await sendTransaction("Approve cSSV", {
        address: CONFIG.contracts.cSSVToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [CONFIG.contracts.Staking, amountToApprove]
      });
      if (!hash) {
        setUnstakeApprovalStatus("error");
        return;
      }
      setUnstakeApprovalHash(hash);
      setUnstakeApprovalStatus("submitted");
    },
    [sendTransaction]
  );

  const startWithdrawTransaction = React.useCallback(
    async () => {
      setWithdrawStatus("waiting");
      const hash = await sendTransaction("Withdraw", {
        address: CONFIG.contracts.Staking,
        abi: StakingABI,
        functionName: "withdrawUnlocked"
      });
      if (!hash) {
        setWithdrawStatus("error");
        return;
      }
      setWithdrawHash(hash);
      setWithdrawStatus("submitted");
    },
    [sendTransaction]
  );

  const startClaimTransaction = React.useCallback(async () => {
    setClaimStatus("waiting");
    const hash = await sendTransaction("Claim Rewards", {
      address: CONFIG.contracts.Staking,
      abi: StakingABI,
      functionName: "claimEthRewards"
    });
    if (!hash) {
      setClaimStatus("error");
      return;
    }
    setClaimHash(hash);
    setClaimStatus("submitted");
  }, [sendTransaction]);

  const handleStakeFlow = React.useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    const balanceValue = ssvBalanceValue ?? 0n;
    if (stakeAmount === 0n) {
      toast.error("Enter an amount to stake.");
      return;
    }
    if (stakeAmount > balanceValue) {
      toast.error("Insufficient SSV balance.");
      return;
    }

    const requiresApproval = ssvAllowanceValue < stakeAmount;
    setStakeFlowOpen(true);
    setStakeFlowAmount(stakeAmount);
    setStakeFlowNeedsApproval(requiresApproval);
    setApprovalHash(null);
    setStakeHash(null);
    setApprovalStatus(requiresApproval ? "waiting" : "idle");
    setStakeStatus(requiresApproval ? "idle" : "waiting");

    if (requiresApproval) {
      await startApprovalTransaction(stakeAmount);
    } else {
      await startStakeTransaction(stakeAmount);
    }
  }, [
    isConnected,
    openConnectModal,
    ssvBalanceValue,
    stakeAmount,
    ssvAllowanceValue,
    startApprovalTransaction,
    startStakeTransaction
  ]);

  const handleRequestUnstake = React.useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (unstakeAmount === 0n) {
      toast.error("Enter an amount to unstake.");
      return;
    }
    if (unstakeAmount > (stakedBalanceValue ?? 0n)) {
      toast.error("Insufficient cSSV balance.");
      return;
    }
    if (!multiWithdrawEnabled && withdrawalRequests.length > 0) {
      toast.error("Unstake request already active.");
      return;
    }

    const requiresApproval = cssvAllowanceValue < unstakeAmount;
    setUnstakeFlowOpen(true);
    setUnstakeFlowAmount(unstakeAmount);
    setUnstakeFlowNeedsApproval(requiresApproval);
    setUnstakeApprovalHash(null);
    setUnstakeHash(null);
    setUnstakeApprovalStatus(requiresApproval ? "waiting" : "idle");
    setUnstakeStatus(requiresApproval ? "idle" : "waiting");

    if (requiresApproval) {
      await startUnstakeApprovalTransaction(unstakeAmount);
    } else {
      await startUnstakeTransaction(unstakeAmount);
    }
  }, [
    isConnected,
    openConnectModal,
    unstakeAmount,
    stakedBalanceValue,
    multiWithdrawEnabled,
    withdrawalRequests.length,
    cssvAllowanceValue,
    startUnstakeApprovalTransaction,
    startUnstakeTransaction
  ]);

  const handleWithdrawSelected = React.useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!selectedWithdrawable.length) {
      toast.error("Select withdrawable requests.");
      return;
    }
    const ids = selectedWithdrawable.map((request) => request.id);
    setWithdrawFlowOpen(true);
    setWithdrawFlowAmount(selectedWithdrawAmount);
    setWithdrawFlowIds(ids);
    setWithdrawHash(null);
    setWithdrawStatus("waiting");
    await startWithdrawTransaction();
  }, [
    isConnected,
    openConnectModal,
    selectedWithdrawable,
    selectedWithdrawAmount,
    startWithdrawTransaction
  ]);

  const handleWithdrawUnlocked = React.useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!primaryPending) {
      toast.error("No withdrawal request.");
      return;
    }
    if (primaryPending.unlockTime > nowEpoch) {
      toast.error("Cooldown not finished.");
      return;
    }
    const ids = [primaryPending.id];
    setWithdrawFlowOpen(true);
    setWithdrawFlowAmount(primaryPending.amount);
    setWithdrawFlowIds(ids);
    setWithdrawHash(null);
    setWithdrawStatus("waiting");
    await startWithdrawTransaction();
  }, [
    isConnected,
    openConnectModal,
    primaryPending,
    nowEpoch,
    startWithdrawTransaction
  ]);

  const handleClaim = React.useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (claimableValue === 0n) {
      toast.error("Nothing to claim.");
      return;
    }
    setClaimFlowOpen(true);
    setClaimFlowAmount(claimableValue);
    setClaimHash(null);
    setClaimStatus("waiting");
    await startClaimTransaction();
  }, [isConnected, openConnectModal, claimableValue, startClaimTransaction]);

  const handleMax = React.useCallback(() => {
    if (!ssvBalanceFormatted) return;
    setAmount(ssvBalanceFormatted);
  }, [ssvBalanceFormatted]);

  const retryApproval = React.useCallback(async () => {
    if (stakeFlowAmount === 0n) return;
    setApprovalHash(null);
    await startApprovalTransaction(stakeFlowAmount);
  }, [stakeFlowAmount, startApprovalTransaction]);

  const retryStake = React.useCallback(async () => {
    if (stakeFlowAmount === 0n) return;
    setStakeHash(null);
    await startStakeTransaction(stakeFlowAmount);
  }, [stakeFlowAmount, startStakeTransaction]);

  const retryUnstakeApproval = React.useCallback(async () => {
    if (unstakeFlowAmount === 0n) return;
    setUnstakeApprovalHash(null);
    await startUnstakeApprovalTransaction(unstakeFlowAmount);
  }, [startUnstakeApprovalTransaction, unstakeFlowAmount]);

  const retryUnstake = React.useCallback(async () => {
    if (unstakeFlowAmount === 0n) return;
    setUnstakeHash(null);
    await startUnstakeTransaction(unstakeFlowAmount);
  }, [startUnstakeTransaction, unstakeFlowAmount]);

  const retryWithdraw = React.useCallback(async () => {
    if (!withdrawFlowIds.length) return;
    setWithdrawHash(null);
    await startWithdrawTransaction();
  }, [startWithdrawTransaction, withdrawFlowIds.length]);

  const retryClaim = React.useCallback(async () => {
    if (claimFlowAmount === 0n) return;
    setClaimHash(null);
    await startClaimTransaction();
  }, [claimFlowAmount, startClaimTransaction]);

  const toggleWithdrawalSelection = React.useCallback(
    (request: WithdrawalRequest) => {
      if (request.unlockTime > nowEpoch) return;
      setSelectedWithdrawalIds((prev) => {
        if (prev.includes(request.id)) {
          return prev.filter((id) => id !== request.id);
        }
        return [...prev, request.id];
      });
    },
    [nowEpoch]
  );

  React.useEffect(() => {
    if (!isConfirmed || !txLabel) return;
    if (toastId) toast.dismiss(toastId);
    toast.success(`${txLabel} confirmed`);
    setTxHash(undefined);
    setTxLabel(null);
    setToastId(null);
    onAnyTxConfirmed?.();
  }, [isConfirmed, txLabel, toastId, onAnyTxConfirmed]);

  React.useEffect(() => {
    if (!isApprovalConfirmed || !approvalHash) return;
    if (approvalStatus !== "confirmed") {
      setApprovalStatus("confirmed");
      onSsvApprovalConfirmed?.();
    }
    if (stakeFlowNeedsApproval && stakeStatus === "idle" && stakeFlowAmount > 0n) {
      void startStakeTransaction(stakeFlowAmount);
    }
  }, [
    isApprovalConfirmed,
    approvalHash,
    approvalStatus,
    onSsvApprovalConfirmed,
    stakeFlowAmount,
    stakeFlowNeedsApproval,
    stakeStatus,
    startStakeTransaction
  ]);

  React.useEffect(() => {
    if (!isStakeConfirmed || !stakeHash) return;
    if (stakeStatus !== "confirmed") {
      setStakeStatus("confirmed");
    }
  }, [isStakeConfirmed, stakeHash, stakeStatus]);

  React.useEffect(() => {
    if (!isUnstakeApprovalConfirmed || !unstakeApprovalHash) return;
    if (unstakeApprovalStatus !== "confirmed") {
      setUnstakeApprovalStatus("confirmed");
      onCssvApprovalConfirmed?.();
    }
    if (
      unstakeFlowNeedsApproval &&
      unstakeStatus === "idle" &&
      unstakeFlowAmount > 0n
    ) {
      void startUnstakeTransaction(unstakeFlowAmount);
    }
  }, [
    isUnstakeApprovalConfirmed,
    unstakeApprovalHash,
    unstakeApprovalStatus,
    onCssvApprovalConfirmed,
    unstakeFlowAmount,
    unstakeFlowNeedsApproval,
    unstakeStatus,
    startUnstakeTransaction
  ]);

  React.useEffect(() => {
    if (!isUnstakeConfirmed || !unstakeHash) return;
    if (unstakeStatus !== "confirmed") {
      setUnstakeStatus("confirmed");
    }
  }, [isUnstakeConfirmed, unstakeHash, unstakeStatus]);

  React.useEffect(() => {
    if (!isWithdrawConfirmed || !withdrawHash) return;
    if (withdrawStatus !== "confirmed") {
      setWithdrawStatus("confirmed");
      setSelectedWithdrawalIds((prev) =>
        prev.filter((id) => !withdrawFlowIds.includes(id))
      );
    }
  }, [isWithdrawConfirmed, withdrawHash, withdrawStatus, withdrawFlowIds]);

  React.useEffect(() => {
    if (!isClaimConfirmed || !claimHash) return;
    if (claimStatus !== "confirmed") {
      setClaimStatus("confirmed");
    }
  }, [isClaimConfirmed, claimHash, claimStatus]);

  useInterval(() => {
    setNowEpoch(Math.floor(Date.now() / 1000));
  }, 1000);

  React.useEffect(() => {
    setSelectedWithdrawalIds((prev) =>
      prev.filter((id) =>
        withdrawalRequests.some((request) => request.id === id)
      )
    );
  }, [withdrawalRequests]);

  React.useEffect(() => {
    if (!multiWithdrawEnabled && activeTab === "withdraw") {
      setActiveTab("unstake");
    }
  }, [multiWithdrawEnabled, activeTab]);

  React.useEffect(() => {
    if (!multiWithdrawEnabled) {
      setSelectedWithdrawalIds([]);
    }
  }, [multiWithdrawEnabled]);

  const isStakeFlowBusy =
    approvalStatus === "waiting" ||
    approvalStatus === "submitted" ||
    stakeStatus === "waiting" ||
    stakeStatus === "submitted";
  const stakeFlowAmountLabel =
    stakeFlowAmount > 0n
      ? formatToken(stakeFlowAmount, tokenDecimals)
      : "--";
  const stakeFlowHasError =
    approvalStatus === "error" || stakeStatus === "error";
  const stakeFlowComplete = stakeFlowNeedsApproval
    ? approvalStatus === "confirmed" && stakeStatus === "confirmed"
    : stakeStatus === "confirmed";
  const approvalRowLabel =
    approvalStatus === "confirmed"
      ? `Approved ${stakeFlowAmountLabel} SSV`
      : `Approve ${stakeFlowAmountLabel} SSV`;
  const stakeRowLabel =
    stakeStatus === "confirmed"
      ? `Staked ${stakeFlowAmountLabel} SSV`
      : `Stake ${stakeFlowAmountLabel} SSV`;
  const isUnstakeFlowBusy =
    unstakeApprovalStatus === "waiting" ||
    unstakeApprovalStatus === "submitted" ||
    unstakeStatus === "waiting" ||
    unstakeStatus === "submitted";
  const unstakeFlowAmountLabel =
    unstakeFlowAmount > 0n
      ? formatToken(unstakeFlowAmount, receiptDecimals)
      : "--";
  const unstakeFlowHasError =
    unstakeApprovalStatus === "error" || unstakeStatus === "error";
  const unstakeFlowComplete = unstakeFlowNeedsApproval
    ? unstakeApprovalStatus === "confirmed" && unstakeStatus === "confirmed"
    : unstakeStatus === "confirmed";
  const unstakeApprovalRowLabel =
    unstakeApprovalStatus === "confirmed"
      ? `Approved ${unstakeFlowAmountLabel} cSSV`
      : `Approve ${unstakeFlowAmountLabel} cSSV`;
  const unstakeRowLabel =
    unstakeStatus === "confirmed"
      ? `Unstaked ${unstakeFlowAmountLabel} SSV`
      : `Unstake ${unstakeFlowAmountLabel} SSV`;
  const isWithdrawFlowBusy =
    withdrawStatus === "waiting" || withdrawStatus === "submitted";
  const withdrawFlowAmountLabel =
    withdrawFlowAmount > 0n
      ? formatToken(withdrawFlowAmount, tokenDecimals)
      : "--";
  const withdrawFlowHasError = withdrawStatus === "error";
  const withdrawFlowComplete = withdrawStatus === "confirmed";
  const withdrawRowLabel =
    withdrawStatus === "confirmed"
      ? `Withdrawn ${withdrawFlowAmountLabel} SSV`
      : `Withdraw ${withdrawFlowAmountLabel} SSV`;
  const isClaimFlowBusy =
    claimStatus === "waiting" || claimStatus === "submitted";
  const claimFlowAmountLabel =
    claimFlowAmount > 0n
      ? formatToken(claimFlowAmount, CLAIMABLE_DECIMALS, 5)
      : "--";
  const claimFlowHasError = claimStatus === "error";
  const claimFlowComplete = claimStatus === "confirmed";
  const claimRowLabel =
    claimStatus === "confirmed"
      ? `Claimed ${claimFlowAmountLabel} ETH`
      : `Claim ${claimFlowAmountLabel} ETH`;
  const stakeRetryDisabled = isStakeFlowBusy || stakeFlowAmount === 0n;
  const unstakeRetryDisabled = isUnstakeFlowBusy || unstakeFlowAmount === 0n;
  const withdrawRetryDisabled =
    isWithdrawFlowBusy || withdrawFlowAmount === 0n;
  const claimRetryDisabled = isClaimFlowBusy || claimFlowAmount === 0n;
  const stakeBalanceLabel = `Wallet Balance: ${formatToken(
    ssvBalanceValue,
    tokenDecimals
  )}`;
  const unstakeBalanceLabel = `Wallet Balance: ${formatToken(
    stakedBalanceValue,
    receiptDecimals
  )}`;

  return {
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
    closeStakeFlow: () => setStakeFlowOpen(false),
    closeUnstakeFlow: () => setUnstakeFlowOpen(false),
    closeWithdrawFlow: () => setWithdrawFlowOpen(false),
    closeClaimFlow: () => setClaimFlowOpen(false)
  };
}
