import { useAccount } from "wagmi";

import { type NetworkConfig, getNetworkConfigByChainId } from "@/lib/config";

export const useNetworkConfig = (): NetworkConfig => {
  const { chainId } = useAccount();
  return getNetworkConfigByChainId(chainId);
};
