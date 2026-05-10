import { getAddress, isAddress } from "viem";
import raw from "@/assets/genesis-allowlist.csv?raw";

const allowlist = new Set(
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("0x"))
    .map((line) => {
      try {
        return getAddress(line);
      } catch {
        return null;
      }
    })
    .filter((addr): addr is `0x${string}` => addr !== null)
);

export const isOGHolder = (address: string): boolean => {
  const addr = getAddress(address);
  const boostOverride = localStorage.getItem("boostWalletAddress");
  if (boostOverride && isAddress(boostOverride) && getAddress(boostOverride) === addr) return true;
  return allowlist.has(addr);
};
