"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

const POTENTIAL_APR_URL =
  "https://api.stage.ops.ssvlabsinternal.com/api/v4/hoodi/apr/latest";

type UseAprMetricOptions = {
  refreshIntervalMs?: number;
};

type PotentialAprResponse = {
  samples: Array<{
    id: string;
    timestamp: string;
    accEthPerShare: string;
    ethPrice: string;
    ssvPrice: string;
    currentApr: string;
    aprProjected: string;
    deltaIndex: null;
    deltaTime: null;
    createdAt: string;
  }>;
  count: number;
};

async function fetchApr(): Promise<number | null> {
  const response = await fetch("/api/apr", { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json()) as { apr?: number | null };
  return typeof payload.apr === "number" ? payload.apr : null;
}

async function fetchPotentialApr(): Promise<number | null> {
  const response = await fetch(POTENTIAL_APR_URL, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json()) as PotentialAprResponse;
  const sample = payload.samples?.[0];
  if (!sample?.currentApr) return null;
  const value = Number.parseFloat(sample.currentApr);
  return Number.isNaN(value) ? null : value;
}

export function useAprMetric(options: UseAprMetricOptions = {}) {
  const { refreshIntervalMs = 5 * 60 * 1000 } = options;

  const { data: aprValue, refetch } = useQuery({
    queryKey: ["apr"],
    queryFn: fetchApr,
    placeholderData: keepPreviousData,
    refetchInterval: refreshIntervalMs,
  });

  const { data: potentialAprValue, refetch: refetchPotentialApr } = useQuery({
    queryKey: ["potential-apr"],
    queryFn: fetchPotentialApr,
    placeholderData: keepPreviousData,
    refetchInterval: refreshIntervalMs,
  });

  console.log("aprValue:", aprValue);
  console.log("potentialAprValue:", potentialAprValue);
  return {
    aprValue: aprValue ?? null,
    potentialAprValue: potentialAprValue ?? null,
    refreshApr: refetch,
    refreshPotentialApr: refetchPotentialApr,
  };
}
