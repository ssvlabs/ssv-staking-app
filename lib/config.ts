import { Address } from "viem";

const parseChainId = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const CONFIG = {
  CHAIN_ID: parseChainId(
    process.env.NEXT_PUBLIC_CHAIN_ID ?? process.env.CHAIN_ID,
    560048
  ),
  contracts: {
    SSVToken:
      (process.env.NEXT_PUBLIC_SSV_TOKEN_ADDRESS ??
        process.env.SSV_TOKEN_ADDRESS ??
        "0x0") as Address,
    cSSVToken:
      (process.env.NEXT_PUBLIC_CSSV_TOKEN_ADDRESS ??
        process.env.CSSV_TOKEN_ADDRESS ??
        "0x0") as Address,
    Staking:
      (process.env.NEXT_PUBLIC_STAKING_ADDRESS ??
        process.env.STAKING_ADDRESS ??
        "0x0") as Address,
    Views:
      (process.env.NEXT_PUBLIC_VIEWS_ADDRESS ??
        process.env.VIEWS_ADDRESS ??
        "0x0") as Address
  },
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ?? process.env.RPC_URL ?? "0x0"
} as const;
