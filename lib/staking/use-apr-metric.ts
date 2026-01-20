"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useInterval } from "@/hooks/use-interval";

type UseAprMetricOptions = {
  refreshIntervalMs?: number;
};

export function useAprMetric(options: UseAprMetricOptions = {}) {
  const { refreshIntervalMs = 5 * 60 * 1000 } = options;
  const [aprValue, setAprValue] = useState<number | null>(null);
  const aprMountedRef = useRef(true);

  const refreshApr = useCallback(async () => {
    try {
      const response = await fetch("/api/apr", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { apr?: number | null };
      if (aprMountedRef.current) {
        setAprValue(typeof payload.apr === "number" ? payload.apr : null);
      }
    } catch {
      if (aprMountedRef.current) setAprValue(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      aprMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void refreshApr();
  }, [refreshApr]);

  useInterval(() => {
    void refreshApr();
  }, refreshIntervalMs);

  return { aprValue, refreshApr };
}
