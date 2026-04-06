import type { ComponentPropsWithoutRef, FC } from "react";
import { useAccount, useBalance } from "wagmi";

import { usePreviewClaimableEth } from "@/lib/contract-interactions/hooks/getter";
import { useDecimals } from "@/lib/contract-interactions/hooks/token";
import { STAKING_ASSETS } from "@/lib/staking/constants";
import { formatToken } from "@/lib/staking/format";
import { cn } from "@/lib/utils";
import { useNetworkConfig } from "@/hooks/use-network-config";

const { ssvLarge, ssvSmall, ethIcon } = STAKING_ASSETS;

export const StakingBalances: FC<ComponentPropsWithoutRef<"section">> = ({
  className,
  ...props
}) => {
  const { address } = useAccount();
  const network = useNetworkConfig();

  const { data: ssvBalance } = useBalance({
    address,
    token: network.contracts.SSVToken,
    query: { enabled: !!address },
  });
  const { data: cssvBalance } = useBalance({
    address,
    token: network.contracts.cSSVToken,
    query: { enabled: !!address },
  });
  const { data: claimableRaw } = usePreviewClaimableEth(
    { user: address! },
    { enabled: !!address }
  );
  const { data: cssvDec } = useDecimals({
    contract: network.contracts.cSSVToken,
  });

  const ssvBalanceValue = ssvBalance?.value;
  const stakedBalanceValue = cssvBalance?.value;
  const claimableValue = (claimableRaw as bigint) ?? 0n;
  const tokenDecimals = ssvBalance?.decimals ?? 18;
  const receiptDecimals = Number(cssvDec ?? tokenDecimals);

  return (
    <section
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-3", className)}
      {...props}
    >
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">
          Available to Stake
        </p>
        <div className="mt-3 flex items-center gap-2">
          <img
            alt="SSV"
            className="size-7"
            src={ssvLarge}
            width={28}
            height={28}
          />
          <span className="text-[20px] font-bold text-ink-950">
            {formatToken(ssvBalanceValue, tokenDecimals)}
          </span>
        </div>
      </div>
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">
          Staked Balance
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c8de6_0%,#3e75e2_100%)] p-[6px]">
            <img
              alt="SSV"
              className="size-4"
              src={ssvSmall}
              width={16}
              height={16}
            />
          </span>
          <span className="text-[20px] font-bold text-ink-950">
            {formatToken(stakedBalanceValue, receiptDecimals)}
          </span>
        </div>
      </div>
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">Claimable</p>
        <div className="mt-3 flex items-center gap-2">
          <img
            alt="ETH"
            className="size-7"
            src={ethIcon}
            width={28}
            height={28}
          />
          <span className="text-[20px] font-bold text-ink-900">
            {formatToken(claimableValue, 18, 5)}
          </span>
        </div>
      </div>
    </section>
  );
};

StakingBalances.displayName = "StakingBalances";
