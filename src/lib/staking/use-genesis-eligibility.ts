import { useQuery } from "@tanstack/react-query";
import { getAddress, isAddress } from "viem";

import { getNetworkConfigByChainId } from "@/lib/config";

// Shape returned by GET {ssvApiBaseUrl}/apr/lst-snapshot/eligible/{address}.
// A wallet is eligible if it held any tracked LST at the June 5 snapshot block.
type EligibilityResponse = {
  walletAddress?: string;
  eligible?: boolean;
  snapshotBlock?: string;
  tokens?: Array<{
    symbol: string;
    tokenAddress: string;
    balanceWei: string;
  }>;
};

async function fetchEligibility(
  chainId: number | undefined,
  address: string
): Promise<boolean> {
  const baseUrl = getNetworkConfigByChainId(chainId).ssvApiBaseUrl;
  const url = `${baseUrl}/apr/lst-snapshot/eligible/${address}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Eligibility request failed: ${response.status}`);
  }

  const payload = (await response.json()) as EligibilityResponse;
  return payload.eligible === true;
}

/**
 * Resolves cSSV Syndicate Boost eligibility for the connected wallet by querying
 * the LST snapshot API exactly once per address. The result is cached for the
 * lifetime of the session (staleTime/gcTime Infinity, no refetch triggers), so
 * the request fires only when a wallet first connects.
 */
export function useGenesisEligibility(
  chainId: number | undefined,
  address: string | undefined
) {
  const normalizedAddress =
    address && isAddress(address) ? getAddress(address) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["genesis-eligibility", chainId, normalizedAddress],
    queryFn: () => fetchEligibility(chainId, normalizedAddress as string),
    enabled: Boolean(normalizedAddress),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1
  });

  return {
    isEligible: data ?? false,
    isLoading: Boolean(normalizedAddress) && isLoading,
    isError
  };
}
