import { erc20Abi, type Abi } from "viem";

import GetterAbiJson from "@/lib/abis/getter.json";
import SetterAbiJson from "@/lib/abis/setter.json";
import { getNetworkConfigByChainId } from "@/lib/config";

type AbiSet = { staking: Abi; views: Abi };
type AbiType = "stage" | "hoodi" | "mainnet";

// Map ABI types to their corresponding ABIs
const STAKING_ABI_BY_TYPE: Record<AbiType, Abi> = {
  stage: SetterAbiJson as Abi,
  hoodi: SetterAbiJson as Abi,
  mainnet: SetterAbiJson as Abi
};

const VIEWS_ABI_BY_TYPE: Record<AbiType, Abi> = {
  stage: GetterAbiJson as Abi,
  hoodi: GetterAbiJson as Abi,
  mainnet: GetterAbiJson as Abi
};

export const getAbiSetByChainId = (chainId: number | undefined): AbiSet => {
  const network = getNetworkConfigByChainId(chainId);
  const abiType = network.abiType;

  const stakingAbi = STAKING_ABI_BY_TYPE[abiType];
  const viewsAbi = VIEWS_ABI_BY_TYPE[abiType];

  if (!stakingAbi || !viewsAbi) {
    throw new Error(
      `No ABI found for network ${network.chainName} with abiType: ${abiType}`
    );
  }

  return {
    staking: stakingAbi,
    views: viewsAbi
  };
};

export const getStakingAbiByChainId = (chainId: number | undefined): Abi =>
  getAbiSetByChainId(chainId).staking;

export const getViewsAbiByChainId = (chainId: number | undefined): Abi =>
  getAbiSetByChainId(chainId).views;

export { erc20Abi as ERC20ABI };
