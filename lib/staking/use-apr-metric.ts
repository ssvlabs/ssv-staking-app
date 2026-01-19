"use client";

import * as React from "react";

import { useInterval } from "@/hooks/use-interval";

type UseAprMetricOptions = {
  refreshIntervalMs?: number;
};

export function useAprMetric(options: UseAprMetricOptions = {}) {
  const { refreshIntervalMs = 5 * 60 * 1000 } = options;
  const [aprValue, setAprValue] = React.useState<number | null>(null);
  const aprMountedRef = React.useRef(true);

  const refreshApr = React.useCallback(async () => {
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

  React.useEffect(() => {
    return () => {
      aprMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    void refreshApr();
  }, [refreshApr]);

  useInterval(() => {
    void refreshApr();
  }, refreshIntervalMs);

  return { aprValue, refreshApr };
}
