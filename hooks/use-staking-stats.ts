import { useAccount, useReadContract } from "wagmi";

import { ViewsABI } from "@/lib/abis";
import { CONFIG } from "@/lib/config";

export function useStakingStats(options?: { enabled?: boolean }) {
  const { address } = useAccount();
  const enabled = options?.enabled ?? true;
  const addressEnabled = enabled && Boolean(address);

  const claimableEth = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
    functionName: "previewClaimableEth",
    args: address ? [address] : undefined,
    query: { enabled: addressEnabled }
  });

  const stakedBalance = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
    functionName: "stakedBalanceOf",
    args: address ? [address] : undefined,
    query: { enabled: addressEnabled }
  });

  const pendingUnstake = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
    functionName: "pendingUnstake",
    args: address ? [address] : undefined,
    query: { enabled: addressEnabled }
  });

  const totalStaked = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
    functionName: "totalStaked",
    query: { enabled }
  });

  const cooldownDuration = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
    functionName: "cooldownDuration",
    query: { enabled }
  });

  const stakingEthPoolBalance = useReadContract({
    address: CONFIG.contracts.Views,
    abi: ViewsABI,
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
