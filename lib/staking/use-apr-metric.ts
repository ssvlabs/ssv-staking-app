"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getNetworkConfigByChainId } from "@/lib/config";

type AprResponse = {
  apr?: string | number | null;
  aprProjected?: string | number | null;
};

type AprValues = {
  aprValue: number | null;
  potentialAprValue: number | null;
};

const resolveAprApiBaseUrl = (chainId: number | undefined): string => {
  const network = getNetworkConfigByChainId(chainId);
  return network.ssvApiBaseUrl;
};

async function fetchApr(chainId?: number): Promise<AprValues> {
  const url = `${resolveAprApiBaseUrl(chainId)}/apr/current`;
  try {
    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { aprValue: null, potentialAprValue: null };
    }

    const payload = (await response.json()) as AprResponse;

    const parseMetric = (
      value: string | number | null | undefined
    ): number | null => {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
      }
      if (typeof value === "string") {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const result = {
      aprValue: parseMetric(payload.apr),
      potentialAprValue: parseMetric(payload.aprProjected)
    };

    return result;
  } catch (error) {
    console.error("APR Fetch Error:", error);
    return { aprValue: null, potentialAprValue: null };
  }
}

export function useAprMetric(chainId: number | undefined) {
  const resolvedNetwork = getNetworkConfigByChainId(chainId);
  const resolvedChainId = resolvedNetwork.chainId;

  const { data, refetch } = useQuery({
    queryKey: ["apr", resolvedChainId],
    queryFn: () => fetchApr(resolvedChainId),
    placeholderData: keepPreviousData,
    refetchInterval: false,
    staleTime: Infinity
  });

  const aprValue = data?.aprValue ?? null;
  const potentialAprValue = data?.potentialAprValue ?? null;

  return {
    aprValue,
    potentialAprValue,
    refreshApr: refetch
  };
}
