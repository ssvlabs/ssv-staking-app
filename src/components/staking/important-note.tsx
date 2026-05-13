import type { ComponentPropsWithoutRef, FC } from "react";

import { cn } from "@/lib/utils";

export const ImportantNote: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-white p-6 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <p className="text-[12px] font-bold leading-5 text-[#0b2a3c] dark:text-white">
        IMPORTANT NOTE
      </p>
      <p className="text-[10px] font-medium leading-4 text-[#63768b] dark:text-gray-400">
        Staking crypto assets involves risks, including but not limited to: (a)
        slashing penalties that may result in partial or total loss of staked
        assets due to validator misbehavior or downtime; (b) smart contract
        risk, including the possibility of bugs or vulnerabilities in the
        protocol or infrastructure software; {`(‌c)`} illiquidity risk, as
        staked assets may be subject to unbonding periods during which they
        cannot be transferred or sold; (d) regulatory risk, as the legal and
        regulatory treatment of staking activities and related tokens varies by
        jurisdiction and is subject to change; and (e) protocol risk, including
        changes to the Ethereum network&apos;s consensus rules or reward
        structure. SSV Network does not guarantee any particular level of
        staking rewards. Rewards are determined by the Ethereum protocol and
        are subject to variability based on network conditions. Past reward
        rates are not indicative of future performance. cSSV tokens are receipt
        tokens representing a user&apos;s staked SSV position. They are not
        investment contracts, securities, or financial instruments. cSSV tokens
        do not entitle holders to returns beyond the protocol-defined rewards
        attributable to the underlying staked assets. This website does not
        constitute an offer to sell or a solicitation of an offer to buy any
        securities in any jurisdiction. Nothing on this website should be
        construed as investment, legal, or tax advice.
      </p>
    </div>
  );
};

ImportantNote.displayName = "ImportantNote";