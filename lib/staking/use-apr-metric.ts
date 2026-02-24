"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

const APR_API_BASE_URL = (
  process.env.NEXT_PUBLIC_SSV_API ??
  "https://api.hoodi.ssv.network/api/v4/hoodi/"
).replace(/\/+$/, "");
console.log(APR_API_BASE_URL)
type AprResponse = {
  apr?: string | number | null;
  aprProjected?: string | number | null;
};

type AprValues = {
  aprValue: number | null;
  potentialAprValue: number | null;
};

async function fetchApr(): Promise<AprValues> {
  const url = `${APR_API_BASE_URL}/apr/current`;
  console.log('🔍 APR Fetch Debug:', {
    url,
    baseUrl: APR_API_BASE_URL,
    envVar: process.env.NEXT_PUBLIC_SSV_API
  });

  try {
    const response = await fetch(url, {
      cache: "no-store"
    });

    console.log('📡 APR Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      console.error('❌ APR Fetch failed:', response.status, response.statusText);
      return { aprValue: null, potentialAprValue: null };
    }

    const payload = (await response.json()) as AprResponse;
    console.log('📦 APR Payload:', payload);

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

    console.log('✅ APR Parsed Result:', result);
    return result;
  } catch (error) {
    console.error('💥 APR Fetch Error:', error);
    return { aprValue: null, potentialAprValue: null };
  }
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
