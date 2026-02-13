"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

const APR_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SSV_API ??
  process.env.SSV_API ??
  "https://api.hoodi.ssv.network/api/v4/hoodi/"
).replace(/\/+$/, "");

type AprResponse = {
  samples?: Array<{
    currentApr?: string | number | null;
    aprProjected?: string | number | null;
  }>;
  count?: number;
};

type AprValues = {
  aprValue: number | null;
  potentialAprValue: number | null;
};

async function fetchApr(): Promise<AprValues> {
  const response = await fetch(`${APR_API_BASE_URL}/apr/latest`, {
    cache: "no-store"
  });
  if (!response.ok) {
    return { aprValue: null, potentialAprValue: null };
  }
  const payload = (await response.json()) as AprResponse;
  const sample = payload.samples?.[0];

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
    aprValue: parseMetric(sample?.currentApr),
    potentialAprValue: parseMetric(sample?.aprProjected)
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
