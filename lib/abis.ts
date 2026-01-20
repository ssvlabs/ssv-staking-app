import { erc20Abi, type Abi } from "viem";

import StakingAbiJson from "@/lib/abis/SSVStaking.json";
import ViewsAbiJson from "@/lib/abis/SSVNetworkViews.json";

export const StakingABI = StakingAbiJson as Abi;

export const ViewsABI = ViewsAbiJson as Abi;

export { erc20Abi as ERC20ABI };
