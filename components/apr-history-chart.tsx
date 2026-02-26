"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

import { formatApr } from "@/lib/staking/format";
import { useAprHistory } from "@/lib/staking/use-apr-history";

type AprHistoryChartProps = {
  chainId: number | undefined;
};

function formatChartDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatTooltipDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function CursorWithGradient(props: Record<string, unknown>) {
  const id = useId();
  const x = (props.x as number) ?? 0;
  const y = (props.y as number) ?? 0;
  const width = (props.width as number) ?? 0;
  const height = (props.height as number) ?? 0;
  const points = props.points as { x?: number; y?: number }[] | undefined;
  const coordinate = props.coordinate as { x?: number; y?: number } | undefined;
  const centerX = coordinate?.x ?? points?.[0]?.x ?? x + width / 2;
  const dotY = points?.[0]?.y;
  const lineTop = dotY != null ? dotY : y;
  const lineBottom = y + height;
  const gradientId = `cursorLineGradient-${id.replace(/:/g, "")}`;

  return (
    <g>
      <defs>
        <linearGradient
          id={gradientId}
          x1={centerX}
          y1={lineTop}
          x2={centerX}
          y2={lineBottom}
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0%"
            stopColor="var(--color-brand-600)"
            stopOpacity={1}
          />
          <stop
            offset="100%"
            stopColor="var(--color-brand-600)"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <line
        x1={centerX}
        y1={lineTop}
        x2={centerX}
        y2={lineBottom}
        stroke={`url(#${gradientId})`}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </g>
  );
}

export function AprHistoryChart({ chainId }: AprHistoryChartProps) {
  const { data, isLoading, isError } = useAprHistory(chainId);

  const chartData = useMemo(() => {
    if (!data?.samples?.length) return [];
    const samples = data.samples.slice(-7);
    const points = samples.map((s) => {
      const apr = Number.parseFloat(s.currentApr);
      return {
        date: formatChartDate(s.timestamp),
        fullDate: s.timestamp,
        apr: Number.isFinite(apr) ? apr : 0,
      };
    });
    const last = samples[samples.length - 1];
    const nextDay = new Date(last.timestamp);
    nextDay.setDate(nextDay.getDate() + 1);
    points.push({
      date: formatChartDate(nextDay.toISOString()),
      fullDate: nextDay.toISOString(),
      apr: points[points.length - 1].apr,
    });
    return points;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-surface-100 p-5">
        <Loader2 className="size-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || !data?.samples?.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-surface-100 p-5">
        <p className="text-sm text-ink-400">We fucked up</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-100 p-5">
      <p className="mb-4 text-sm font-semibold text-ink-400">
        Avg APR (Last 7 Days)
      </p>
      <div className="h-[89px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 12, left: 12, bottom: 4 }}
          >
            <defs>
              <linearGradient id="aprGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-500)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-500)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--color-border)"
              vertical={true}
              horizontal={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-ink-400)",
                fontSize: 8,
                fontFamily: "Roboto Mono, monospace",
              }}
              interval={0}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-surface-0 px-3 py-2 shadow-sm">
                    <p className="text-[10px] font-medium text-ink-400">
                      {formatTooltipDate(d.fullDate)}
                    </p>
                    <p className="text-xs font-semibold text-ink-900">
                      {formatApr(d.apr)}%
                    </p>
                  </div>
                );
              }}
              cursor={<CursorWithGradient />}
            />
            <Area
              type="stepAfter"
              dataKey="apr"
              stroke="var(--color-brand-500)"
              strokeWidth={1}
              fill="url(#aprGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
