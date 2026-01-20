import { erc20Abi, type Abi } from "viem";

import StakingAbiJson from "@/lib/abis/SSVStaking.json";
import ViewsAbiJson from "@/lib/abis/SSVNetworkViews.json";

export const StakingABI = StakingAbiJson as const satisfies Abi;

export const ViewsABI = ViewsAbiJson as const satisfies Abi;

export { erc20Abi as ERC20ABI };
