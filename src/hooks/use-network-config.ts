import { useAccount } from "wagmi";

import { type NetworkConfig, getNetworkConfigByChainId, NETWORK_CONFIGS } from "@/lib/config";
import { safeLocalStorage } from "@/lib/utils";

export const useNetworkConfig = (): NetworkConfig => {
  const { chainId } = useAccount();
  const overrideChainId = safeLocalStorage("overrideChainId");
  if (overrideChainId) {
    const mainnet = NETWORK_CONFIGS.find(c => c.chainId === 1) ?? NETWORK_CONFIGS[0];
    return { ...mainnet, chainId: Number(overrideChainId) };
  }
  return getNetworkConfigByChainId(chainId);
};
