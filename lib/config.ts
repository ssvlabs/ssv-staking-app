import { Address } from "viem";

const parseChainId = (value: string | undefined): number | undefined => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const CONFIG = {
  CHAIN_ID: parseChainId(
    process.env.NEXT_PUBLIC_CHAIN_ID ?? process.env.CHAIN_ID
  ),
  contracts: {
    SSVToken: (process.env.NEXT_PUBLIC_SSV_TOKEN_ADDRESS ??
      process.env.SSV_TOKEN_ADDRESS) as Address,
    cSSVToken: (process.env.NEXT_PUBLIC_CSSV_TOKEN_ADDRESS ??
      process.env.CSSV_TOKEN_ADDRESS) as Address,
    Staking: (process.env.NEXT_PUBLIC_STAKING_ADDRESS ??
      process.env.STAKING_ADDRESS) as Address,
    Views: (process.env.NEXT_PUBLIC_VIEWS_ADDRESS ??
      process.env.VIEWS_ADDRESS) as Address
  },
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ?? process.env.RPC_URL
} as const;
