"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

const APR_API_BASE_URL = "https://api.hoodi.ssv.network/api/v4/hoodi";

type AprResponse = {
  apr?: string | number | null;
  aprProjected?: string | number | null;
};

type AprValues = {
  aprValue: number | null;
  potentialAprValue: number | null;
};

async function fetchApr(): Promise<AprValues> {
  const response = await fetch(`${APR_API_BASE_URL}/apr/current`, {
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

  return {
    aprValue: parseMetric(payload.apr),
    potentialAprValue: parseMetric(payload.aprProjected)
  };
}

export function useAprMetric() {
  const { data, refetch } = useQuery({
    queryKey: ["apr"],
    queryFn: fetchApr,
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
