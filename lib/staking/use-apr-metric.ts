"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

type UseAprMetricOptions = {
  refreshIntervalMs?: number;
};

type AprResponse = {
  currentApr?: number | null;
  aprProjected?: number | null;
  timestamp?: string;
};

type AprValues = {
  aprValue: number | null;
  potentialAprValue: number | null;
};

async function fetchApr(): Promise<AprValues> {
  const response = await fetch("/api/apr/current", { cache: "no-store" });
  if (!response.ok) {
    return { aprValue: null, potentialAprValue: null };
  }
  const payload = (await response.json()) as AprResponse;

  return {
    aprValue:
      typeof payload.currentApr === "number" ? payload.currentApr : null,
    potentialAprValue:
      typeof payload.aprProjected === "number" ? payload.aprProjected : null,
  };
}

export function useAprMetric(options: UseAprMetricOptions = {}) {
  const { refreshIntervalMs = 5 * 60 * 1000 } = options;

  const { data, refetch } = useQuery({
    queryKey: ["apr"],
    queryFn: fetchApr,
    placeholderData: keepPreviousData,
    refetchInterval: refreshIntervalMs,
  });

  const aprValue = data?.aprValue ?? null;
  const potentialAprValue = data?.potentialAprValue ?? null;

  return {
    aprValue,
    potentialAprValue,
    refreshApr: refetch,
  };
}
