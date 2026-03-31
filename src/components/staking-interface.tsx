import type { ComponentPropsWithoutRef, FC } from "react";
import { useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { cn } from "@/lib/utils";
import { ClaimTab } from "@/components/staking/claim-tab";
import { StakeTab } from "@/components/staking/stake-tab";
import { StakeTabs } from "@/components/staking/stake-tabs";
import { StakingBalances } from "@/components/staking/staking-balances";
import { StakingHeader } from "@/components/staking/staking-header";
import { UnstakeTab } from "@/components/staking/unstake-tab";

export const StakingInterface: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [activeTab, setActiveTab] = useState("stake");

  const connectWallet = () => openConnectModal?.();

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[648px] flex-col gap-6 pb-6",
        className
      )}
      {...props}
    >
      <StakingHeader />
      <StakingBalances />
      <StakeTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stakeContent={
          <StakeTab
            isConnected={isConnected}
            onConnectWallet={connectWallet}
          />
        }
        unstakeContent={
          <UnstakeTab
            isConnected={isConnected}
            onConnectWallet={connectWallet}
          />
        }
        claimContent={
          <ClaimTab
            isConnected={isConnected}
            onConnectWallet={connectWallet}
          />
        }
      />
    </div>
  );
};

StakingInterface.displayName = "StakingInterface";
