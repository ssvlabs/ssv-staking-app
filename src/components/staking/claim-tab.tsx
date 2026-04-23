import confetti from "canvas-confetti";
import type { ComponentPropsWithoutRef, FC } from "react";
import { formatEther } from "viem";

import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { useStakingData } from "@/hooks/use-staking-data";
import { useClaimEthRewards } from "@/lib/contract-interactions/hooks/setter";
import { tx } from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";
import { CLAIMABLE_DECIMALS, STAKING_ASSETS } from "@/lib/staking/constants";
import { formatToken } from "@/lib/staking/format";
import { cn } from "@/lib/utils";

export type ClaimTabProps = {
  isConnected: boolean;
  onConnectWallet: () => void;
};

type ClaimTabFC = FC<
  Omit<ComponentPropsWithoutRef<"div">, keyof ClaimTabProps> & ClaimTabProps
>;

const fireConfetti = () => {
  const size = 0.03;
  confetti({
    particleCount: 300,
    spread: 250,
    origin: { y: 0.5 },
    shapes: [
      confetti.shapeFromPath({
        path: "M0 0 H20 V10 H0 Z",
        matrix: new DOMMatrix([
          size * 20,
          0,
          0,
          size * 20,
          -0.5 * 20,
          -0.25 * 20,
        ]),
      }),
    ],
    colors: ["#FFDE7D", "#00B8A9", "#F8F3D4", "#F6416C"],
  });
};

export const ClaimTab: ClaimTabFC = ({
  isConnected,
  onConnectWallet,
  className,
  ...props
}) => {
  const { claimableValue, refetchClaimable } = useStakingData();

  const claimEthRewards = useClaimEthRewards();
  const modal = useTransactionModal();

  const isClaimDisabled = isConnected && claimableValue === 0n;

  const handleClaim = () => {
    if (!isConnected) {
      onConnectWallet();
      return;
    }
    const amountLabel = formatToken(claimableValue, CLAIMABLE_DECIMALS, 5);
    useTransactionModal.state.open({
      transactions: [
        tx({
          write: claimEthRewards.write,
          label: {
            default: `Claim ${amountLabel} ETH`,
            confirmed: `Claiming ${amountLabel} ETH`,
            mined: `Claimed ${amountLabel} ETH`,
          },
        }),
      ],
      header: "Claim ETH Rewards",
      onDone: () => {
        refetchClaimable();
        fireConfetti();
      },
    });
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="rounded-[12px] border border-surface-100 bg-surface-50 px-[24px] py-[16px] pr-[20px]">
        <div className="flex items-center justify-between">
          <span className="text-[28px] font-medium text-ink-900">
            {formatEther(claimableValue)}
          </span>
          <div className="flex items-center gap-2">
            <img
              alt=""
              className="size-8"
              src={STAKING_ASSETS.ethIcon}
              width={32}
              height={32}
            />
            <span className="text-[28px] font-medium text-ink-900">ETH</span>
          </div>
        </div>
      </div>
      <PrimaryActionButton
        className="font-dm-sans"
        onClick={handleClaim}
        disabled={isClaimDisabled || modal.isOpen}
        isActivated={modal.isOpen}
      >
        {isConnected ? "Claim All" : "Connect Wallet"}
      </PrimaryActionButton>
    </div>
  );
};

ClaimTab.displayName = "ClaimTab";
