import { erc20Abi, type Abi } from "viem";

import StakingStageAbiJson from "@/lib/abis/StakingStage.json";
import StakingHoodiAbiJson from "@/lib/abis/StakingHoodi.json";
import StakingMainnetAbiJson from "@/lib/abis/StakingMainnet.json";
import ViewsStageAbiJson from "@/lib/abis/ViewsStage.json";
import ViewsHoodiAbiJson from "@/lib/abis/ViewsHoodi.json";
import ViewsMainnetAbiJson from "@/lib/abis/ViewsMainnet.json";
import { getNetworkConfigByChainId } from "@/lib/config";

type AbiSet = { staking: Abi; views: Abi };
type Environment = "stage" | "hoodi" | "mainnet";

// Determine environment from env variable
const getEnvironment = (): Environment => {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase();

  if (appEnv === "mainnet") {
    return "mainnet";
  }

  if (appEnv === "hoodi") {
    return "hoodi";
  }

  // Default to stage
  return "stage";
};

const abiByEnvironment: Record<Environment, AbiSet> = {
  stage: {
    staking: StakingStageAbiJson as Abi,
    views: ViewsStageAbiJson as Abi
  },
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
  const env = getEnvironment();

  // For Hoodi network (testnet), use env-specific ABI
  if (network.key === "hoodi") {
    return abiByEnvironment[env === "mainnet" ? "stage" : env];
  }

  // For Mainnet, always use mainnet ABI
  return abiByEnvironment.mainnet;
};

export const getStakingAbiByChainId = (
  chainId: number | undefined
): Abi => getAbiSetByChainId(chainId).staking;

export const getViewsAbiByChainId = (chainId: number | undefined): Abi =>
  getAbiSetByChainId(chainId).views;

export { erc20Abi as ERC20ABI };
