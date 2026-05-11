import { getAddress } from "viem";
import raw from "@/assets/genesis-allowlist.csv?raw";

// Addresses are public — bundled in JS chunk by design (campaign eligibility, not access control)
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

export const isOGHolder = (address: string): boolean =>
  allowlist.has(getAddress(address));
