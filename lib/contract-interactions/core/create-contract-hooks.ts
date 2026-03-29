/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo } from "react";
import type { UseReadContractReturnType } from "wagmi";
import { useReadContract, useWriteContract } from "wagmi";
import type { Abi, AbiFunction, Address } from "viem";
import type { ExtractAbiFunctions } from "abitype";
import { getChainId, type WriteContractErrorType } from "wagmi/actions";
import { useInterval } from "react-use";
import { isAddress } from "viem";

import type { QueryKey } from "@tanstack/react-query";
import type {
  UseQueryOptions as DefaultUseQueryOptions,
} from "@tanstack/react-query";
import { useWaitForTransactionReceipt } from "@/lib/contract-interactions/utils/useWaitForTransactionReceipt";
import type {
  MutationOptions,
  AllEvents,
} from "@/lib/contract-interactions/utils/useWaitForTransactionReceipt";
import {
  paramsToArray,
  extractAbiFunction,
} from "@/lib/contract-interactions/utils";
import type { AbiInputsToParams } from "@/lib/contract-interactions/utils";
import { wagmiConfig } from "@/lib/wagmi";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type UseQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  DefaultUseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type WriteParams<T extends AbiFunction> = {
  args: Prettify<AbiInputsToParams<T["inputs"]>>;
  value?: bigint;
  options?: MutationOptions<AllEvents>;
};

type WriteHookResult<T extends AbiFunction> = {
  error: Error | null;
  isSuccess: boolean;
  isPending: boolean;
  mutation: ReturnType<typeof useWriteContract>;
  write: T["inputs"] extends readonly []
    ? (params?: Prettify<Partial<WriteParams<T>>>) => Promise<unknown>
    : (params: Prettify<WriteParams<T>>) => Promise<unknown>;
  send: T["inputs"] extends readonly []
    ? (params?: Prettify<Partial<WriteParams<T>>>) => Promise<`0x${string}`>
    : (params: Prettify<WriteParams<T>>) => Promise<`0x${string}`>;
  wait: ReturnType<typeof useWaitForTransactionReceipt>;
};

type WriteHooksObject<T extends AbiFunction[]> = {
  [Fn in T[number] as `use${Capitalize<Fn["name"]>}`]: (args?: {
    chainId?: number;
    contract?: Address;
  }) => WriteHookResult<Fn>;
};
type CustomQueryOptions = {
  chainId?: number;
  enabled?: boolean;
  watch?: boolean;
  contract?: Address;
};

const refetchInterval = 12000;

type ReadHooksObject<T extends AbiFunction[]> = {
  [Fn in T[number] as `use${Capitalize<Fn["name"]>}`]: Fn["inputs"] extends readonly []
    ? (
        options?: CustomQueryOptions &
          //@ts-ignore - Fn["name"] constraint
          UseQueryOptions<UseReadContractReturnType<T, Fn["name"]>["data"]>,
        //@ts-ignore - Fn["name"] constraint
      ) => UseReadContractReturnType<T, Fn["name"]>
    : (
        params: AbiInputsToParams<Fn["inputs"]>,
        options?: CustomQueryOptions &
          //@ts-ignore - Fn["name"] constraint
          UseQueryOptions<UseReadContractReturnType<T, Fn["name"]>["data"]>,
        //@ts-ignore - Fn["name"] constraint
      ) => UseReadContractReturnType<T, Fn["name"]>;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function createContractHooks<
  T extends Abi,
  DefaultContractAddressGetter extends () => Address | undefined,
>(abi: T, defaultContractAddressGetter?: DefaultContractAddressGetter) {
  const abiItems = abi as unknown as Abi;

  const writeFunctions = abiItems.filter(
    (item) =>
      item.type === "function" &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure",
  ) as AbiFunction[];

  const readFunctions = abiItems.filter(
    (item) =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure"),
  ) as AbiFunction[];

  const hooks = {};

  readFunctions.forEach((fn) => {
    const hookName = `use${capitalize(fn.name)}`;
    const functionName = fn.name;
    const hasInputs = Boolean(fn.inputs?.length);
    const abiFunction = extractAbiFunction(abi, functionName);

    if (hasInputs) {
      //@ts-expect-error - dynamic hook assignment
      hooks[hookName] = (
        params: AbiInputsToParams<typeof fn.inputs>,
        {
          enabled = true,
          watch = false,
          chainId = getChainId(wagmiConfig),
          contract = defaultContractAddressGetter?.(),
          ...queryOptions
        }: CustomQueryOptions = {},
      ) => {
        const contractAddress = contract || defaultContractAddressGetter?.();

        const args = paramsToArray({ params, abiFunction });
        const query = useReadContract({
          abi,
          address: contractAddress,
          functionName: functionName as string,
          args: args as readonly unknown[],
          chainId: chainId,
          query: {
            ...queryOptions,
            enabled:
              (enabled ?? true) &&
              !!contractAddress &&
              args?.every((arg: unknown) => arg !== undefined),
          },
        } as any);

        useInterval(() => query.refetch, watch ? refetchInterval : null);

        return query;
      };
    } else {
      //@ts-expect-error - dynamic hook assignment
      hooks[hookName] = ({
        enabled = true,
        watch = false,
        chainId = getChainId(wagmiConfig),
        contract = defaultContractAddressGetter?.(),
        ...queryOptions
      }: CustomQueryOptions = {}) => {
        const contractAddress = contract || defaultContractAddressGetter?.();

        const query = useReadContract({
          abi,
          address: contractAddress,
          functionName: functionName as string,
          chainId: chainId,
          query: {
            ...queryOptions,
            enabled: enabled && !!contractAddress,
          },
        } as any);

        useInterval(() => query.refetch, watch ? refetchInterval : null);

        return query;
      };
    }
  });

  writeFunctions.forEach((fn) => {
    const hookName = "use" + capitalize(fn.name);
    const hookFn = ({
      chainId = getChainId(wagmiConfig),
      contract = defaultContractAddressGetter?.(),
    }: CustomQueryOptions = {}) => {
      const isValidContract = isAddress(contract ?? "");
      if (!isValidContract) {
        throw new Error("Invalid contract address at hook: " + hookName);
      }
      const waitForTx = useWaitForTransactionReceipt([hookName, contract]);
      const functionName = fn.name;

      const abiFunction = useMemo(
        () => extractAbiFunction(abi, functionName),
        [functionName],
      );

      const mutation = useWriteContract();

      const write = (params?: WriteParams<any>) => {
        params?.options?.onInitiated?.();

        return mutation
          .writeContractAsync(
            // @ts-expect-error - dynamic ABI call
            {
              abi,
              address: contract,
              functionName,
              chainId,
              args: params?.args
                ? paramsToArray({ params: params.args, abiFunction })
                : undefined,
              value: params?.value,
            },
            {
              onSuccess: (hash) => params?.options?.onConfirmed?.(hash),
              onError: (error) => params?.options?.onError?.(error),
            },
          )
          .then((hash) =>
            waitForTx.mutateAsync(hash, {
              onSuccess: async (receipt) => {
                await wait(1);
                return params?.options?.onMined?.(receipt);
              },
              onError: async (error) => {
                await wait(1);
                return params?.options?.onError?.(error as any);
              },
            }),
          );
      };

      const send = (params?: WriteParams<any>) => {
        params?.options?.onInitiated?.();

        return mutation.writeContractAsync(
          // @ts-expect-error - dynamic ABI call
          {
            abi,
            address: contract,
            functionName,
            args: params?.args
              ? paramsToArray({ params: params.args, abiFunction })
              : undefined,
            value: params?.value,
          },
          {
            onSuccess: (hash) => params?.options?.onConfirmed?.(hash),
            onError: (error) =>
              params?.options?.onError?.(error as WriteContractErrorType),
          },
        );
      };

      return {
        error: mutation.error || waitForTx.error,
        isSuccess: waitForTx.isSuccess,
        isPending: mutation.isPending || waitForTx.isPending,
        mutation,
        write,
        send,
        wait: waitForTx,
      };
    };

    //@ts-expect-error - dynamic hook assignment
    hooks[hookName] = hookFn;
  });
  return hooks as WriteHooksObject<
    //@ts-ignore
    ExtractAbiFunctions<T, "nonpayable" | "payable">[]
  > &
    //@ts-ignore
    ReadHooksObject<ExtractAbiFunctions<T, "view" | "pure">[]>;
}
