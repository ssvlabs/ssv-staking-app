import { erc20Abi, type Abi } from "viem";

import ViewsHoodiAbiJson from "@/lib/abis/GetterHoodi.json";
import ViewsMainnetAbiJson from "@/lib/abis/GetterMainnet.json";
import ViewsStageAbiJson from "@/lib/abis/GetterStage.json";
import StakingHoodiAbiJson from "@/lib/abis/SetterHoodi.json";
import StakingMainnetAbiJson from "@/lib/abis/SetterMainnet.json";
import StakingStageAbiJson from "@/lib/abis/SetterStage.json";
import { getNetworkConfigByChainId } from "@/lib/config";

type AbiSet = { staking: Abi; views: Abi };
type AbiType = "stage" | "hoodi" | "mainnet";

// Map ABI types to their corresponding ABIs
const STAKING_ABI_BY_TYPE: Record<AbiType, Abi> = {
  stage: StakingStageAbiJson as Abi,
  hoodi: StakingHoodiAbiJson as Abi,
  mainnet: StakingMainnetAbiJson as Abi
};

const VIEWS_ABI_BY_TYPE: Record<AbiType, Abi> = {
  stage: ViewsStageAbiJson as Abi,
  hoodi: ViewsHoodiAbiJson as Abi,
  mainnet: ViewsMainnetAbiJson as Abi
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
