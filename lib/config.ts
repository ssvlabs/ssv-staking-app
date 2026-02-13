import { Address } from "viem";

const parseChainId = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const CONFIG = {
  CHAIN_ID: parseChainId(process.env.CHAIN_ID, 560048),
  contracts: {
    SSVToken: (process.env.SSV_TOKEN_ADDRESS || "0x0") as Address,
    cSSVToken: (process.env.CSSV_TOKEN_ADDRESS || "0x0") as Address,
    Staking: (process.env.STAKING_ADDRESS || "0x0") as Address,
    Views: (process.env.VIEWS_ADDRESS || "0x0") as Address
  },
  RPC_URL: process.env.RPC_URL || "0x0"
} as const;
