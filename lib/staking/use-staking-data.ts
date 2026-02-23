"use client";

import { useCallback, useMemo } from "react";
import { useBalance, useReadContract } from "wagmi";

import { ERC20ABI } from "@/lib/abis";
import { CONFIG } from "@/lib/config";
import { WithdrawalRequest } from "@/lib/staking/types";
import { useStakingStats } from "@/hooks/use-staking-stats";

type UseStakingDataOptions = {
  address?: `0x${string}`;
};

export function useStakingData({ address }: UseStakingDataOptions) {
  const {
    claimableEth,
    stakedBalance,
    pendingUnstake,
    totalStaked,
    cooldownDuration
  } = useStakingStats();

  const { data: ssvBalance, refetch: refetchSsvBalance } = useBalance({
    address,
    token: CONFIG.contracts.SSVToken,
    query: { enabled: Boolean(address) }
  });

  const { data: cssvBalance, refetch: refetchCssvBalance } = useBalance({
    address,
    token: CONFIG.contracts.cSSVToken,
    query: { enabled: Boolean(address) }
  });

  const { data: ssvDecimals } = useReadContract({
    address: CONFIG.contracts.SSVToken,
    abi: ERC20ABI,
    functionName: "decimals",
    query: { enabled: true }
  });

  const { data: cssvDecimals } = useReadContract({
    address: CONFIG.contracts.cSSVToken,
    abi: ERC20ABI,
    functionName: "decimals",
    query: { enabled: true }
  });

  const { refetch: refetchClaimable } = claimableEth;
  const { refetch: refetchStaked } = stakedBalance;
  const { refetch: refetchPending } = pendingUnstake;
  const { refetch: refetchTotalStaked } = totalStaked;

  const { data: ssvAllowance, refetch: refetchSsvAllowance } = useReadContract({
    address: CONFIG.contracts.SSVToken,
    abi: ERC20ABI,
    functionName: "allowance",
    args: address ? [address, CONFIG.contracts.Staking] : undefined,
    query: { enabled: Boolean(address) }
  });

  const { data: cssvAllowance, refetch: refetchCssvAllowance } =
    useReadContract({
      address: CONFIG.contracts.cSSVToken,
      abi: ERC20ABI,
      functionName: "allowance",
      args: address ? [address, CONFIG.contracts.Staking] : undefined,
      query: { enabled: Boolean(address) }
    });

  const withdrawalRequests: WithdrawalRequest[] = useMemo(() => {
    const data = pendingUnstake.data;
    if (!data) return [];
    const requests: WithdrawalRequest[] = [];
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && "amount" in data[0]) {
      // Hoodi format: {amount, unlockTime}[]
      for (let index = 0; index < data.length; index += 1) {
        const entry = data[index] as { amount: bigint; unlockTime: bigint };
        if (entry.amount <= 0n) continue;
        requests.push({
          id: String(index),
          amount: entry.amount,
          unlockTime: Number(entry.unlockTime)
        });
      }
    } else {
      // Stage format: [uint256[], uint256[]]
      const [amounts = [], unlockTimes = []] = data as [bigint[], bigint[]];
      const count = Math.min(amounts.length, unlockTimes.length);
      for (let index = 0; index < count; index += 1) {
        const amount = amounts[index] ?? 0n;
        const unlockTime = unlockTimes[index] ?? 0n;
        if (amount <= 0n) continue;
        requests.push({
          id: String(index),
          amount,
          unlockTime: Number(unlockTime)
        });
      }
    }
    return requests;
  }, [pendingUnstake.data]);

  const claimableValue = (claimableEth.data as bigint | undefined) ?? 0n;
  const ssvBalanceValue = ssvBalance?.value;
  const stakedBalanceValue = cssvBalance?.value;
  const totalStakedValue = totalStaked.data as bigint | undefined;

  console.log('🔍 cSSV Balance Debug:', {
    raw: cssvBalance?.value,
    formatted: stakedBalanceValue?.toString(),
    address: address,
    isLoading: cssvBalance === undefined,
    token: CONFIG.contracts.cSSVToken
  });

  const tokenDecimals = Number(
    ssvBalance?.decimals ?? (ssvDecimals as number | undefined) ?? 18
  );
  const receiptDecimals = Number(
    (cssvDecimals as number | undefined) ?? tokenDecimals
  );

  const cooldownDurationSeconds = Number(
    (cooldownDuration.data as bigint | undefined) ?? 0n
  );
  const cooldownDays = cooldownDurationSeconds
    ? Math.ceil(cooldownDurationSeconds / 86400)
    : 0;
  const cooldownLabel = `${cooldownDays || 7} days`;

  const ssvAllowanceValue = (ssvAllowance as bigint | undefined) ?? 0n;
  const cssvAllowanceValue = (cssvAllowance as bigint | undefined) ?? 0n;

  const refreshAll = useCallback(() => {
    refetchSsvBalance();
    refetchCssvBalance();
    refetchClaimable();
    refetchStaked();
    refetchPending();
    refetchSsvAllowance();
    refetchCssvAllowance();
    refetchTotalStaked();
  }, [
    refetchSsvBalance,
    refetchCssvBalance,
    refetchClaimable,
    refetchStaked,
    refetchPending,
    refetchSsvAllowance,
    refetchCssvAllowance,
    refetchTotalStaked
  ]);

  return {
    ssvBalance,
    ssvBalanceFormatted: ssvBalance?.formatted,
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
  };
}

