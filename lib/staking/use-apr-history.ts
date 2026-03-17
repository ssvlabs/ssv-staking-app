"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getNetworkConfigByChainId } from "@/lib/config";

interface AprHistoryResponse {
  samples: {
    id: string;
    timestamp: string;
    networkFeeWei: string;
    ethPrice: string;
    ssvPrice: string;
    currentApr: string;
    aprProjected: string;
    deltaIndex: null;
    deltaTime: null;
    createdAt: string;
  }[];
  count: number;
}

async function fetchAprHistory(chainId?: number): Promise<AprHistoryResponse> {
  const api = getNetworkConfigByChainId(chainId).ssvApiBaseUrl;

  try {
    const response = await fetch(`${api}/apr/history`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch APR history");
    }

    const payload = (await response.json()) as AprHistoryResponse;
    return payload;
  } catch (error) {
    console.error("APR History Fetch Error:", error);
    throw new Error("Failed to fetch APR history");
  }
}

export function useAprHistory(chainId: number | undefined) {
  const resolvedNetwork = getNetworkConfigByChainId(chainId);
  const resolvedChainId = resolvedNetwork.chainId;

  return useQuery({
    queryKey: ["apr-history", resolvedChainId],
    queryFn: () => fetchAprHistory(resolvedChainId),
    placeholderData: keepPreviousData,
    refetchInterval: false,
    staleTime: Infinity,
  });
}
