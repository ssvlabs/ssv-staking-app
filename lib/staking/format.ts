import { formatUnits, parseUnits } from "viem";

export const formatToken = (value?: bigint, decimals = 18, maxDecimals = 4) => {
  if (value === undefined) return "--";
  const formatted = formatUnits(value, decimals);
  const parsed = Number(formatted);
  if (Number.isNaN(parsed)) return formatted;
  const isCompact = value >= 100000;
  return parsed.toLocaleString(undefined, {
    notation: isCompact ? "compact" : "standard",
    maximumFractionDigits: isCompact ? 1 : maxDecimals,
  });
};

export const formatApr = (value: number | null): string => {
  if (value === null) return "--";
  return new Intl.NumberFormat(undefined, {
    notation: value > 10000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatTxHash = (hash: string) =>
  `${hash.slice(0, 6)}...${hash.slice(-4)}`;

export const safeParse = (value: string, decimals: number) => {
  if (!value) return 0n;
  try {
    return parseUnits(value.replace(/,/g, ""), decimals);
  } catch {
    return 0n;
  }
};

export const formatDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return "Now";
  if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
  if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};
