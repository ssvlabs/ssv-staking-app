import { useCooldownDuration } from "@/lib/contract-interactions/hooks/getter";

export function useCooldownLabel() {
  const { data } = useCooldownDuration();
  const seconds = Number(data ?? 0n);
  const days = seconds ? Math.ceil(seconds / 86400) : 0;
  return {
    cooldownDurationSeconds: seconds,
    cooldownLabel: `${days || 7} days`,
  };
}
