"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useAccount as useWagmiAccount } from "wagmi";

export const useAccount = () => {
  const account = useWagmiAccount();
  const publicClient = usePublicClient();

  const isContractWallet = useQuery({
    staleTime: Infinity,
    queryKey: [
      "is-contract-wallet",
      account.address?.toLowerCase(),
      account.chainId
    ],
    queryFn: async () => {
      const code = await publicClient!.getCode({
        address: account.address!
      });
      return Boolean(code && code !== "0x");
    },
    enabled: Boolean(account.address && publicClient)
  });

  return useMemo(
    () =>
      ({
        ...account,
        isContract: isContractWallet.data ?? false
      }) as typeof account & { isContract: boolean },
    [account, isContractWallet.data]
  );
};
