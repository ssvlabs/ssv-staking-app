import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useAccount as useWagmiAccount } from "wagmi";
import { useLocalStorage } from "react-use";
import { getNetworkConfigByChainId } from "@/lib/config";

export const useAccount = () => {
  const account = useWagmiAccount();
  const publicClient = usePublicClient();
  const [isMultisig] = useLocalStorage("isMultisig", false);

  const acceptedTerms = useQuery({
    queryKey: ["terms", account.address, account.chainId],
    queryFn: async () => {
      const networkConfig = getNetworkConfigByChainId(account.chainId);
      const url = `${networkConfig.ssvApiBaseUrl}/terms?isStaking=true`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: account.address }),
      });
      return true;
    },
    enabled: Boolean(account.address && account.chainId === 1),
    staleTime: Infinity,
  });

  const isContractWallet = useQuery({
    staleTime: Infinity,
    queryKey: [
      "is-contract-wallet",
      account.address?.toLowerCase(),
      account.chainId,
    ],
    queryFn: async () => {
      const code = await publicClient!.getCode({
        address: account.address!,
      });
      return Boolean(code && code !== "0x");
    },
    enabled: Boolean(account.address && publicClient),
  });

  return useMemo(
    () =>
      ({
        ...account,
        isContract: isMultisig || (isContractWallet.data ?? false),
        acceptedTerms: acceptedTerms.isSuccess,
      } as typeof account & { isContract: boolean; acceptedTerms: boolean }),
    [account, isContractWallet.data, acceptedTerms.isSuccess]
  );
};
