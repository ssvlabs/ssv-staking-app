import { erc20Abi, type Abi } from "viem";

import StakingHoodiAbiJson from "@/lib/abis/StakingHoodi.json";
import StakingStageAbiJson from "@/lib/abis/StakingStage.json";
import ViewsHoodiAbiJson from "@/lib/abis/ViewsHoodi.json";
import ViewsStageAbiJson from "@/lib/abis/ViewsStage.json";

type AbiEnv = "Stage" | "Hoodi";

const abiByEnv: Record<AbiEnv, { staking: Abi; views: Abi }> = {
  Stage: {
    staking: StakingStageAbiJson as Abi,
    views: ViewsStageAbiJson as Abi
  },
  Hoodi: {
    staking: StakingHoodiAbiJson as Abi,
    views: ViewsHoodiAbiJson as Abi
  }
};

// const appEnv = process.env.APP_ENV?.trim().toLowerCase();
const abiEnv = "Hoodi";

export const StakingABI = abiByEnv[abiEnv].staking;

export const ViewsABI = abiByEnv[abiEnv].views;

export { erc20Abi as ERC20ABI };
