import { erc20Abi, type Abi } from "viem";

import StakingHoodiAbiJson from "@/lib/abis/StakingHoodi.json";
import StakingMainnetAbiJson from "@/lib/abis/StakingMainnet.json";
import ViewsHoodiAbiJson from "@/lib/abis/ViewsHoodi.json";
import ViewsMainnetAbiJson from "@/lib/abis/ViewsMainnet.json";
import { NetworkKey, getNetworkConfigByChainId } from "@/lib/config";

type AbiSet = { staking: Abi; views: Abi };

const abiByNetwork: Record<NetworkKey, AbiSet> = {
  hoodi: {
    staking: StakingHoodiAbiJson as Abi,
    views: ViewsHoodiAbiJson as Abi
  },
  mainnet: {
    staking: StakingMainnetAbiJson as Abi,
    views: ViewsMainnetAbiJson as Abi
  }
};

export const getAbiSetByChainId = (
  chainId: number | undefined
): AbiSet => {
  const network = getNetworkConfigByChainId(chainId);
  return abiByNetwork[network.key];
};

export const getStakingAbiByChainId = (
  chainId: number | undefined
): Abi => getAbiSetByChainId(chainId).staking;

export const getViewsAbiByChainId = (chainId: number | undefined): Abi =>
  getAbiSetByChainId(chainId).views;

export { erc20Abi as ERC20ABI };
