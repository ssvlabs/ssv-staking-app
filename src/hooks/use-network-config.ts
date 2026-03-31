import { useAccount } from "wagmi";

import { getNetworkConfigByChainId } from "@/lib/config";

export const useNetworkConfig = () => {
  const { chainId } = useAccount();
  return getNetworkConfigByChainId(chainId);
};
