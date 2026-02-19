"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ERC20ABI, StakingABI } from "@/lib/abis";
import { CONFIG } from "@/lib/config";
import { useMultisigTransactionModal } from "@/lib/multisig-modal";
import { CLAIMABLE_DECIMALS } from "@/lib/staking/constants";
import { formatDuration, formatToken, safeParse } from "@/lib/staking/format";
import { StepStatus, WithdrawalRequest } from "@/lib/staking/types";
import { useInterval } from "@/hooks/use-interval";

import { globals } from "../globals";

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
  isContractWallet?: boolean;
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
  isContractWallet,
  onAnyTxConfirmed,
  onSsvApprovalConfirmed,
  onCssvApprovalConfirmed
}: UseStakeFlowsOptions) {
  const [activeTab, setActiveTab] = useState("stake");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txLabel, setTxLabel] = useState<string | null>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [stakeFlowOpen, setStakeFlowOpen] = useState(false);
  const [nowEpoch, setNowEpoch] = useState(() => Math.floor(Date.now() / 1000));
  const [stakeFlowAmount, setStakeFlowAmount] = useState<bigint>(0n);
  const [stakeFlowNeedsApproval, setStakeFlowNeedsApproval] = useState(false);
  const [unstakeFlowOpen, setUnstakeFlowOpen] = useState(false);
  const [unstakeFlowAmount, setUnstakeFlowAmount] = useState<bigint>(0n);
  const [unstakeFlowNeedsApproval, setUnstakeFlowNeedsApproval] =
    useState(false);
  const [withdrawFlowOpen, setWithdrawFlowOpen] = useState(false);
  const [withdrawFlowAmount, setWithdrawFlowAmount] = useState<bigint>(0n);
  const [withdrawFlowIds, setWithdrawFlowIds] = useState<string[]>([]);
  const [claimFlowOpen, setClaimFlowOpen] = useState(false);
  const [claimFlowAmount, setClaimFlowAmount] = useState<bigint>(0n);
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState<string[]>(
    []
  );
  const [approvalStatus, setApprovalStatus] = useState<StepStatus>("idle");
  const [stakeStatus, setStakeStatus] = useState<StepStatus>("idle");
  const [unstakeApprovalStatus, setUnstakeApprovalStatus] =
    useState<StepStatus>("idle");
  const [unstakeStatus, setUnstakeStatus] = useState<StepStatus>("idle");
  const [withdrawStatus, setWithdrawStatus] = useState<StepStatus>("idle");
  const [claimStatus, setClaimStatus] = useState<StepStatus>("idle");
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | null>(null);
  const [stakeHash, setStakeHash] = useState<`0x${string}` | null>(null);
  const [unstakeApprovalHash, setUnstakeApprovalHash] = useState<
    `0x${string}` | null
  >(null);
  const [unstakeHash, setUnstakeHash] = useState<`0x${string}` | null>(null);
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);
  const [claimHash, setClaimHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { open: openMultisigModal, close: closeMultisigModal } =
    useMultisigTransactionModal();
  const isOrdinaryWallet = !isContractWallet;

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) && isOrdinaryWallet }
  });
  const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash ?? undefined,
    query: { enabled: Boolean(approvalHash) && isOrdinaryWallet }
  });
  const { isSuccess: isStakeConfirmed } = useWaitForTransactionReceipt({
    hash: stakeHash ?? undefined,
    query: { enabled: Boolean(stakeHash) && isOrdinaryWallet }
  });
  const { isSuccess: isUnstakeApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: unstakeApprovalHash ?? undefined,
      query: { enabled: Boolean(unstakeApprovalHash) && isOrdinaryWallet }
    });
  const { isSuccess: isUnstakeConfirmed } = useWaitForTransactionReceipt({
    hash: unstakeHash ?? undefined,
    query: { enabled: Boolean(unstakeHash) && isOrdinaryWallet }
  });
  const { isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({
    hash: withdrawHash ?? undefined,
    query: { enabled: Boolean(withdrawHash) && isOrdinaryWallet }
  });
  const { isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash ?? undefined,
    query: { enabled: Boolean(claimHash) && isOrdinaryWallet }
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

  const isActionDisabled =
    isConnected &&
    (actionAmount === 0n ||
      (activeTab === "stake" && stakeAmount > (ssvBalanceValue ?? 0n)) ||
      (activeTab === "unstake" && unstakeAmount > (stakedBalanceValue ?? 0n)));
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

  const sendTransaction = useCallback(
    async (label: string, config: Parameters<typeof writeContractAsync>[0]) => {
      if (!writeContractAsync) return undefined;
      let pendingToast: string | number | null = null;
      try {
        if (isContractWallet) {
          openMultisigModal();
          const hash = await writeContractAsync(config);
          return hash;
        }
        pendingToast = toast.loading("Transaction pending...");
        setToastId(pendingToast);
        setTxLabel(label);
        const hash = await writeContractAsync(config);
        setTxHash(hash);
        return hash;
      } catch (error) {
        if (pendingToast) toast.dismiss(pendingToast);
        if (isContractWallet) {
          closeMultisigModal();
        }
        const message =
          (error as { shortMessage?: string; details?: string })
            ?.shortMessage ||
          (error as { cause?: { shortMessage?: string } })?.cause
            ?.shortMessage ||
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
    [
      writeContractAsync,
      isContractWallet,
      openMultisigModal,
      closeMultisigModal
    ]
  );

  const startStakeTransaction = useCallback(
    async (amountToStake: bigint) => {
      if (isContractWallet) {
        await sendTransaction("Stake", {
          address: CONFIG.contracts.Staking,
          abi: StakingABI,
          functionName: "stake",
          args: [amountToStake]
        });
        return;
      }
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
    [sendTransaction, isContractWallet]
  );

  const startApprovalTransaction = useCallback(async () => {
    if (isContractWallet) {
      await sendTransaction("Approve SSV", {
        address: CONFIG.contracts.SSVToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [CONFIG.contracts.Staking, globals.MAX_WEI_AMOUNT]
      });
      return;
    }
    setApprovalStatus("waiting");
    const hash = await sendTransaction("Approve SSV", {
      address: CONFIG.contracts.SSVToken,
      abi: ERC20ABI,
      functionName: "approve",
      args: [CONFIG.contracts.Staking, globals.MAX_WEI_AMOUNT]
    });
    if (!hash) {
      setApprovalStatus("error");
      return;
    }
    setApprovalHash(hash);
    setApprovalStatus("submitted");
  }, [sendTransaction, isContractWallet]);

  const startUnstakeTransaction = useCallback(
    async (amountToUnstake: bigint) => {
      if (isContractWallet) {
        await sendTransaction("Request Unstake", {
          address: CONFIG.contracts.Staking,
          abi: StakingABI,
          functionName: "requestUnstake",
          args: [amountToUnstake]
        });
        return;
      }
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
    [sendTransaction, isContractWallet]
  );

  const startUnstakeApprovalTransaction = useCallback(async () => {
    if (isContractWallet) {
      await sendTransaction("Approve cSSV", {
        address: CONFIG.contracts.cSSVToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [CONFIG.contracts.Staking, globals.MAX_WEI_AMOUNT]
      });
      return;
    }
    setUnstakeApprovalStatus("waiting");
    const hash = await sendTransaction("Approve cSSV", {
      address: CONFIG.contracts.cSSVToken,
      abi: ERC20ABI,
      functionName: "approve",
      args: [CONFIG.contracts.Staking, globals.MAX_WEI_AMOUNT]
    });
    if (!hash) {
      setUnstakeApprovalStatus("error");
      return;
    }
    setUnstakeApprovalHash(hash);
    setUnstakeApprovalStatus("submitted");
  }, [sendTransaction, isContractWallet]);

  const startWithdrawTransaction = useCallback(async () => {
    if (isContractWallet) {
      await sendTransaction("Withdraw", {
        address: CONFIG.contracts.Staking,
        abi: StakingABI,
        functionName: "withdrawUnlocked"
      });
      return;
    }
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
  }, [sendTransaction, isContractWallet]);

  const startClaimTransaction = useCallback(async () => {
    if (isContractWallet) {
      await sendTransaction("Claim Rewards", {
        address: CONFIG.contracts.Staking,
        abi: StakingABI,
        functionName: "claimEthRewards"
      });
      return;
    }
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
  }, [sendTransaction, isContractWallet]);

  const handleStakeFlow = useCallback(async () => {
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
    if (isContractWallet) {
      if (requiresApproval) {
        await startApprovalTransaction();
      } else {
        await startStakeTransaction(stakeAmount);
      }
      return;
    }
    setStakeFlowOpen(true);
    setStakeFlowAmount(stakeAmount);
    setStakeFlowNeedsApproval(requiresApproval);
    setApprovalHash(null);
    setStakeHash(null);
    setApprovalStatus(requiresApproval ? "waiting" : "idle");
    setStakeStatus(requiresApproval ? "idle" : "waiting");

    if (requiresApproval) {
      await startApprovalTransaction();
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
    startStakeTransaction,
    isContractWallet
  ]);

  const handleRequestUnstake = useCallback(async () => {
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
    if (isContractWallet) {
      if (requiresApproval) {
        await startUnstakeApprovalTransaction();
      } else {
        await startUnstakeTransaction(unstakeAmount);
      }
      return;
    }
    setUnstakeFlowOpen(true);
    setUnstakeFlowAmount(unstakeAmount);
    setUnstakeFlowNeedsApproval(requiresApproval);
    setUnstakeApprovalHash(null);
    setUnstakeHash(null);
    setUnstakeApprovalStatus(requiresApproval ? "waiting" : "idle");
    setUnstakeStatus(requiresApproval ? "idle" : "waiting");

    if (requiresApproval) {
      await startUnstakeApprovalTransaction();
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
    startUnstakeTransaction,
    isContractWallet
  ]);

  const handleWithdrawSelected = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!selectedWithdrawable.length) {
      toast.error("Select withdrawable requests.");
      return;
    }
    if (isContractWallet) {
      await startWithdrawTransaction();
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
    startWithdrawTransaction,
    isContractWallet
  ]);

  const handleWithdrawUnlocked = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    const unlockedRequests = withdrawalRequests.filter(
      (request) => request.unlockTime <= nowEpoch
    );
    if (unlockedRequests.length === 0) {
      toast.error("No unlocked withdrawal requests.");
      return;
    }
    if (isContractWallet) {
      await startWithdrawTransaction();
      return;
    }
    const ids = unlockedRequests.map((request) => request.id);
    const totalAmount = unlockedRequests.reduce(
      (sum, request) => sum + request.amount,
      0n
    );
    setWithdrawFlowOpen(true);
    setWithdrawFlowAmount(totalAmount);
    setWithdrawFlowIds(ids);
    setWithdrawHash(null);
    setWithdrawStatus("waiting");
    await startWithdrawTransaction();
  }, [
    isConnected,
    openConnectModal,
    withdrawalRequests,
    nowEpoch,
    startWithdrawTransaction,
    isContractWallet
  ]);

  const handleWithdrawSingle = useCallback(
    async (requestId: string) => {
      if (!isConnected) {
        openConnectModal?.();
        return;
      }
      const request = withdrawalRequests.find((r) => r.id === requestId);
      if (!request) {
        toast.error("Withdrawal request not found.");
        return;
      }
      if (request.unlockTime > nowEpoch) {
        toast.error("Cooldown not finished.");
        return;
      }
      const ids = [request.id];
      setWithdrawFlowOpen(true);
      setWithdrawFlowAmount(request.amount);
      setWithdrawFlowIds(ids);
      setWithdrawHash(null);
      setWithdrawStatus("waiting");
      await startWithdrawTransaction();
    },
    [
      isConnected,
      openConnectModal,
      withdrawalRequests,
      nowEpoch,
      startWithdrawTransaction
    ]
  );

  const handleClaim = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (claimableValue === 0n) {
      toast.error("Nothing to claim.");
      return;
    }
    if (isContractWallet) {
      await startClaimTransaction();
      return;
    }
    setClaimFlowOpen(true);
    setClaimFlowAmount(claimableValue);
    setClaimHash(null);
    setClaimStatus("waiting");
    await startClaimTransaction();
  }, [
    isConnected,
    openConnectModal,
    claimableValue,
    startClaimTransaction,
    isContractWallet
  ]);

  const handleMax = useCallback(() => {
    if (!ssvBalanceFormatted) return;
    setAmount(ssvBalanceFormatted);
  }, [ssvBalanceFormatted]);

  const retryApproval = useCallback(async () => {
    if (stakeFlowAmount === 0n) return;
    setApprovalHash(null);
    await startApprovalTransaction();
  }, [stakeFlowAmount, startApprovalTransaction]);

  const retryStake = useCallback(async () => {
    if (stakeFlowAmount === 0n) return;
    setStakeHash(null);
    await startStakeTransaction(stakeFlowAmount);
  }, [stakeFlowAmount, startStakeTransaction]);

  const retryUnstakeApproval = useCallback(async () => {
    if (unstakeFlowAmount === 0n) return;
    setUnstakeApprovalHash(null);
    await startUnstakeApprovalTransaction();
  }, [startUnstakeApprovalTransaction, unstakeFlowAmount]);

  const retryUnstake = useCallback(async () => {
    if (unstakeFlowAmount === 0n) return;
    setUnstakeHash(null);
    await startUnstakeTransaction(unstakeFlowAmount);
  }, [startUnstakeTransaction, unstakeFlowAmount]);

  const retryWithdraw = useCallback(async () => {
    if (!withdrawFlowIds.length) return;
    setWithdrawHash(null);
    await startWithdrawTransaction();
  }, [startWithdrawTransaction, withdrawFlowIds.length]);

  const retryClaim = useCallback(async () => {
    if (claimFlowAmount === 0n) return;
    setClaimHash(null);
    await startClaimTransaction();
  }, [claimFlowAmount, startClaimTransaction]);

  const toggleWithdrawalSelection = useCallback(
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

  useEffect(() => {
    if (!isConfirmed || !txLabel) return;
    if (toastId) toast.dismiss(toastId);
    toast.success(`${txLabel} confirmed`);
    if (isContractWallet) {
      closeMultisigModal();
    }
    setTxHash(undefined);
    setTxLabel(null);
    setToastId(null);
    onAnyTxConfirmed?.();
  }, [
    isConfirmed,
    txLabel,
    toastId,
    onAnyTxConfirmed,
    isContractWallet,
    closeMultisigModal
  ]);

  useEffect(() => {
    if (!isApprovalConfirmed || !approvalHash) return;
    if (approvalStatus !== "confirmed") {
      setApprovalStatus("confirmed");
      onSsvApprovalConfirmed?.();
    }
    if (isContractWallet) {
      closeMultisigModal();
    }
    if (
      stakeFlowNeedsApproval &&
      stakeStatus === "idle" &&
      stakeFlowAmount > 0n
    ) {
      void startStakeTransaction(stakeFlowAmount);
    }
  }, [
    isApprovalConfirmed,
    approvalHash,
    approvalStatus,
    onSsvApprovalConfirmed,
    isContractWallet,
    closeMultisigModal,
    stakeFlowAmount,
    stakeFlowNeedsApproval,
    stakeStatus,
    startStakeTransaction
  ]);

  useEffect(() => {
    if (!isStakeConfirmed || !stakeHash) return;
    if (stakeStatus !== "confirmed") {
      setStakeStatus("confirmed");
    }
    if (isContractWallet) {
      closeMultisigModal();
    }
  }, [
    isStakeConfirmed,
    stakeHash,
    stakeStatus,
    isContractWallet,
    closeMultisigModal
  ]);

  useEffect(() => {
    if (!isUnstakeApprovalConfirmed || !unstakeApprovalHash) return;
    if (unstakeApprovalStatus !== "confirmed") {
      setUnstakeApprovalStatus("confirmed");
      onCssvApprovalConfirmed?.();
    }
    if (isContractWallet) {
      closeMultisigModal();
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
    isContractWallet,
    closeMultisigModal,
    unstakeFlowAmount,
    unstakeFlowNeedsApproval,
    unstakeStatus,
    startUnstakeTransaction
  ]);

  useEffect(() => {
    if (!isUnstakeConfirmed || !unstakeHash) return;
    if (unstakeStatus !== "confirmed") {
      setUnstakeStatus("confirmed");
    }
    if (isContractWallet) {
      closeMultisigModal();
    }
  }, [
    isUnstakeConfirmed,
    unstakeHash,
    unstakeStatus,
    isContractWallet,
    closeMultisigModal
  ]);

  useEffect(() => {
    if (!isWithdrawConfirmed || !withdrawHash) return;
    if (withdrawStatus !== "confirmed") {
      setWithdrawStatus("confirmed");
      setSelectedWithdrawalIds((prev) =>
        prev.filter((id) => !withdrawFlowIds.includes(id))
      );
    }
    if (isContractWallet) {
      closeMultisigModal();
    }
  }, [
    isWithdrawConfirmed,
    withdrawHash,
    withdrawStatus,
    withdrawFlowIds,
    isContractWallet,
    closeMultisigModal
  ]);

  useEffect(() => {
    if (!isClaimConfirmed || !claimHash) return;

    const confettiSize = 0.03;

    confetti({
      particleCount: 300,
      spread: 250,
      origin: { y: 0.5 },
      shapes: [
        confetti.shapeFromPath({
          path: "M0 0 H20 V10 H0 Z",
          matrix: new DOMMatrix([
            confettiSize * 20,
            0,
            0,
            confettiSize * 20,
            -0.5 * 20,
            -0.25 * 20
          ])
        })
      ],
      colors: ["#FFDE7D", "#00B8A9", "#F8F3D4", "#F6416C"]
    });

    if (claimStatus !== "confirmed") {
      setClaimStatus("confirmed");
    }
    if (isContractWallet) {
      closeMultisigModal();
    }
  }, [
    isClaimConfirmed,
    claimHash,
    claimStatus,
    isContractWallet,
    closeMultisigModal
  ]);

  useInterval(() => {
    setNowEpoch(Math.floor(Date.now() / 1000));
  }, 1000);

  useEffect(() => {
    setSelectedWithdrawalIds((prev) =>
      prev.filter((id) =>
        withdrawalRequests.some((request) => request.id === id)
      )
    );
  }, [withdrawalRequests]);

  useEffect(() => {
    if (!multiWithdrawEnabled && activeTab === "withdraw") {
      setActiveTab("unstake");
    }
  }, [multiWithdrawEnabled, activeTab]);

  useEffect(() => {
    if (!multiWithdrawEnabled) {
      setSelectedWithdrawalIds([]);
    }
  }, [multiWithdrawEnabled]);

  const isStakeFlowBusy = isContractWallet
    ? false
    : approvalStatus === "waiting" ||
      approvalStatus === "submitted" ||
      stakeStatus === "waiting" ||
      stakeStatus === "submitted";
  const stakeFlowAmountLabel =
    stakeFlowAmount > 0n ? formatToken(stakeFlowAmount, tokenDecimals) : "--";
  const stakeFlowHasError =
    approvalStatus === "error" || stakeStatus === "error";
  const stakeFlowComplete = stakeFlowNeedsApproval
    ? approvalStatus === "confirmed" && stakeStatus === "confirmed"
    : stakeStatus === "confirmed";
  const approvalRowLabel =
    approvalStatus === "confirmed" ? `SSV Approved` : `Approve SSV`;
  const stakeRowLabel =
    stakeStatus === "confirmed"
      ? `Staked ${stakeFlowAmountLabel} SSV`
      : `Stake ${stakeFlowAmountLabel} SSV`;
  const isUnstakeFlowBusy = isContractWallet
    ? false
    : unstakeApprovalStatus === "waiting" ||
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
    unstakeApprovalStatus === "confirmed" ? `cSSV Approved` : `Approve cSSV`;
  const unstakeRowLabel =
    unstakeStatus === "confirmed"
      ? `Unstaked ${unstakeFlowAmountLabel} SSV`
      : `Unstake ${unstakeFlowAmountLabel} SSV`;
  const isWithdrawFlowBusy = isContractWallet
    ? false
    : withdrawStatus === "waiting" || withdrawStatus === "submitted";
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
  const isClaimFlowBusy = isContractWallet
    ? false
    : claimStatus === "waiting" || claimStatus === "submitted";
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
  const withdrawRetryDisabled = isWithdrawFlowBusy || withdrawFlowAmount === 0n;
  const claimRetryDisabled = isClaimFlowBusy || claimFlowAmount === 0n;
  const stakeBalanceLabel = `Wallet Balance: ${formatToken(
    ssvBalanceValue,
    tokenDecimals
  )}`;
  const unstakeBalanceLabel = `Wallet Balance: ${formatToken(
    stakedBalanceValue,
    receiptDecimals
  )}`;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAmount("");
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
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
    handleWithdrawSingle,
    handleClaim,
    retryApproval,
    retryStake,
    retryUnstakeApproval,
    retryUnstake,
    retryWithdraw,
    retryClaim,
    closeStakeFlow: () => { setStakeFlowOpen(false); setAmount(""); },
    closeUnstakeFlow: () => { setUnstakeFlowOpen(false); setAmount(""); },
    closeWithdrawFlow: () => setWithdrawFlowOpen(false),
    closeClaimFlow: () => setClaimFlowOpen(false)
  };
}
