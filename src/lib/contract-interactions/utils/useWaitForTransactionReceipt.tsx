import type { MutationKey } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type {
  TransactionReceipt,
  WaitForTransactionReceiptErrorType,
} from "viem";
import { usePublicClient } from "wagmi";

import type { WriteContractErrorType } from "wagmi/actions";

export type AllEvents = Record<string, unknown>;

type MaybePromise<T> = T | Promise<T>;

export type MutationOptions<T extends AllEvents = AllEvents> = {
  onInitiated?: () => MaybePromise<unknown | (() => unknown)>;
  onConfirmed?: (hash: `0x${string}`) => MaybePromise<unknown | (() => unknown)>;
  onMined?: (
    receipt: TransactionReceipt,
  ) => MaybePromise<unknown | (() => unknown)>;
  onError?: (
    error: WriteContractErrorType | WaitForTransactionReceiptErrorType,
  ) => MaybePromise<unknown | (() => unknown)>;
};

export const useWaitForTransactionReceipt = <T extends AllEvents = AllEvents>(
  key: MutationKey = [],
) => {
  const client = usePublicClient();

  return useMutation({
    mutationKey: ["waitForTransactionReceipt", ...key],
    mutationFn: (hash: `0x${string}`) => {
      if (!client) {
        throw new Error("Public client not found");
      }
      return client.waitForTransactionReceipt({ hash });
    },
  });
};
