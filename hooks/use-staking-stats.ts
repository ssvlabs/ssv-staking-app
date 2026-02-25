import { useAccount, useReadContract } from "wagmi";

import { getViewsAbiByChainId } from "@/lib/abis";
import { getNetworkConfigByChainId } from "@/lib/config";

export function useStakingStats(options?: { enabled?: boolean }) {
  const { address, chainId } = useAccount();
  const network = getNetworkConfigByChainId(chainId);
  const viewsAbi = getViewsAbiByChainId(chainId);
  const enabled = options?.enabled ?? true;
  const addressEnabled = enabled && Boolean(address);
  type PendingUnstakeStruct = readonly { amount: bigint; unlockTime: bigint }[];
  type PendingUnstakeTuple = readonly [readonly bigint[], readonly bigint[]];
  type PendingUnstakeReturn = PendingUnstakeStruct | PendingUnstakeTuple;

  const claimableEth = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "previewClaimableEth",
    args: address ? [address] : undefined,
    query: { enabled: addressEnabled }
  });

  const stakedBalance = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "stakedBalanceOf",
    args: address ? [address] : undefined,
    query: { enabled: addressEnabled }
  });

  const pendingUnstake = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "pendingUnstake",
    args: address ? [address] : undefined,
    query: {
      enabled: addressEnabled,
      select: (data) => data as PendingUnstakeReturn
    }
  });

  const totalStaked = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "totalStaked",
    query: { enabled }
  });

  const cooldownDuration = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "cooldownDuration",
    query: { enabled }
  });

  const stakingEthPoolBalance = useReadContract({
    address: network.contracts.Views,
    abi: viewsAbi,
    functionName: "stakingEthPoolBalance",
    query: { enabled, refetchInterval: 30000 }
  });

  return {
    claimableEth,
    stakedBalance,
    pendingUnstake,
    totalStaked,
    cooldownDuration,
    stakingEthPoolBalance
  };
}
