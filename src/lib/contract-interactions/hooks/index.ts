import { GetterABI } from "@/lib/abi/getter";
import { SetterABI } from "@/lib/abi/setter";
import { createContractHooks } from "@/lib/contract-interactions/core/create-contract-hooks";
import { getNetworkConfigByChainId } from "@/lib/config";
import { getChainId } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi";
import { TokenABI } from "@/lib/abi/token";

/**
   Contract Hooks

  Adding a contract here will auto-generate an export file
  based on the variable name (e.g. setter.ts, getter.ts)
  that destructures all hooks from the contract object.

  This lets you import hooks directly:
    import { useStake } from "@/lib/contract-interactions/hooks/setter"

  Instead of importing the object and accessing properties:
    import { setter } from "@/lib/contract-interactions/hooks"
    setter.useStake(...)

  Requires the ABI to be a local file to generate the exports (e.g. @/lib/abi/setter.ts)
*/

const getContractAddress = (key: "Setter" | "Getter") => {
  const chainId = getChainId(wagmiConfig);
  const config = getNetworkConfigByChainId(chainId);
  return config.contracts[key];
};

export const setter = createContractHooks(SetterABI, () =>
  getContractAddress("Setter")
);

export const getter = createContractHooks(GetterABI, () =>
  getContractAddress("Getter")
);

export const token = createContractHooks(TokenABI);
