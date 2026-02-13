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
        "0x9F5d4Ec84fC4785788aB44F9de973cF34F7A038e") as Address,
    cSSVToken:
      (process.env.NEXT_PUBLIC_CSSV_TOKEN_ADDRESS ??
        process.env.CSSV_TOKEN_ADDRESS ??
        "0x6e1a5d27361c666f681af06535c8Ac773E571d4d") as Address,
    Staking:
      (process.env.NEXT_PUBLIC_STAKING_ADDRESS ??
        process.env.STAKING_ADDRESS ??
        "0x58410Bef803ECd7E63B23664C586A6DB72DAf59c") as Address,
    Views:
      (process.env.NEXT_PUBLIC_VIEWS_ADDRESS ??
        process.env.VIEWS_ADDRESS ??
        "0x5AdDb3f1529C5ec70D77400499eE4bbF328368fe") as Address
  },
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ?? process.env.RPC_URL ?? "0x0"
} as const;
