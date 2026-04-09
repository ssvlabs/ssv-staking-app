import { useAccount, useBalance } from "wagmi";

import { usePreviewClaimableEth } from "@/lib/contract-interactions/hooks/getter";
import { useNetworkConfig } from "@/hooks/use-network-config";

export const TOKEN_DECIMALS = 18;

export const useStakingData = () => {
  const { address } = useAccount();
  const network = useNetworkConfig();

  const { data: ssvBalance, refetch: refetchSsvBalance } = useBalance({
    address,
    token: network.contracts.SSVToken,
    query: { enabled: !!address },
  });

  const { data: cssvBalance, refetch: refetchCssvBalance } = useBalance({
    address,
    token: network.contracts.cSSVToken,
    query: { enabled: !!address },
  });

  const { data: claimableRaw, refetch: refetchClaimable } =
    usePreviewClaimableEth(
      { user: address! },
      { enabled: !!address, watch: true }
    );

  return {
    ssvBalance,
    cssvBalance,
    claimableValue: (claimableRaw as bigint) ?? 0n,
    tokenDecimals: TOKEN_DECIMALS,
    refetchSsvBalance,
    refetchCssvBalance,
    refetchClaimable,
  };
};
