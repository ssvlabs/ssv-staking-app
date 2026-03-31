import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type StakeTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  stakeContent: ReactNode;
  unstakeContent: ReactNode;
  claimContent: ReactNode;
};

type StakeTabsFC = FC<
  Omit<ComponentPropsWithoutRef<"section">, keyof StakeTabsProps> &
    StakeTabsProps
>;

export const StakeTabs: StakeTabsFC = ({
  activeTab,
  onTabChange,
  stakeContent,
  unstakeContent,
  claimContent,
  className,
  ...props
}) => {
  const tabButtonClass = (value: string) =>
    `flex-1 rounded-[8px] px-4 py-2 text-[16px] font-semibold transition ${
      activeTab === value
        ? "bg-[#fdfefe] text-[#34455a] shadow-sm dark:bg-[#0b2a3c] dark:text-[#e6eaf7]"
        : "text-[#97a5ba]"
    }`;

  return (
    <section
      className={cn("rounded-[16px] bg-surface-0 p-6", className)}
      {...props}
    >
      <Tabs defaultValue="stake" value={activeTab} onValueChange={onTabChange}>
        <div className="space-y-6">
          <TabsList className="flex rounded-[12px] border border-[#e6eaf7] bg-[#f4f7fa] p-1 dark:border-[#34455a] dark:bg-[#011627]">
            <TabsTrigger className={tabButtonClass("stake")} value="stake">
              Stake
            </TabsTrigger>
            <TabsTrigger className={tabButtonClass("unstake")} value="unstake">
              Unstake
            </TabsTrigger>
            <TabsTrigger className={tabButtonClass("claim")} value="claim">
              Claim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-6">
            {stakeContent}
          </TabsContent>
          <TabsContent value="unstake" className="space-y-6">
            {unstakeContent}
          </TabsContent>
          <TabsContent value="claim" className="space-y-6">
            {claimContent}
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};

StakeTabs.displayName = "StakeTabs";
