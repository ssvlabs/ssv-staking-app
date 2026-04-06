import { useMemo } from "react";
import { useAccount } from "wagmi";

import { usePendingUnstake } from "@/lib/contract-interactions/hooks/getter";
import type { WithdrawalRequest } from "@/lib/staking/types";

export function useWithdrawalRequests() {
  const { address } = useAccount();
  const query = usePendingUnstake(
    { user: address! },
    { enabled: !!address }
  );

  const requests: WithdrawalRequest[] = useMemo(() => {
    const data = query.data;
    if (!data) return [];

    const result: WithdrawalRequest[] = [];

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0] === "object" &&
      "amount" in data[0]
    ) {
      // Hoodi format: {amount, unlockTime}[]
      for (let index = 0; index < data.length; index += 1) {
        const entry = data[index] as { amount: bigint; unlockTime: bigint };
        if (entry.amount <= 0n) continue;
        result.push({
          id: String(index),
          amount: entry.amount,
          unlockTime: Number(entry.unlockTime),
        });
      }
    } else {
      // Stage format: [uint256[], uint256[]]
      const [amounts = [], unlockTimes = []] = data as [bigint[], bigint[]];
      const count = Math.min(amounts.length, unlockTimes.length);
      for (let index = 0; index < count; index += 1) {
        const amount = amounts[index] ?? 0n;
        const unlockTime = unlockTimes[index] ?? 0n;
        if (amount <= 0n) continue;
        result.push({
          id: String(index),
          amount,
          unlockTime: Number(unlockTime),
        });
      }
    }

    return result;
  }, [query.data]);

  return { requests, refetch: query.refetch };
}
