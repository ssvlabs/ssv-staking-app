"use client";

import Image from "next/image";

import { formatToken } from "@/lib/staking/format";

type StakingBalancesProps = {
  ssvBalanceValue: bigint | undefined;
  stakedBalanceValue: bigint | undefined;
  claimableValue: bigint;
  tokenDecimals: number;
  receiptDecimals: number;
  ssvLarge: string;
  ssvSmall: string;
  ethIcon: string;
};

export function StakingBalances({
  ssvBalanceValue,
  stakedBalanceValue,
  claimableValue,
  tokenDecimals,
  receiptDecimals,
  ssvLarge,
  ssvSmall,
  ethIcon
}: StakingBalancesProps) {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">
          Available toStake
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Image
            alt="SSV"
            className="size-7"
            src={ssvLarge}
            width={28}
            height={28}
          />
          <span className="text-[20px] font-bold text-ink-950">
            {formatToken(ssvBalanceValue, tokenDecimals)} SSV
          </span>
        </div>
      </div>
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">
          Staked Balance
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c8de6_0%,#3e75e2_100%)] p-[6px]">
            <Image
              alt="SSV"
              className="size-4"
              src={ssvSmall}
              width={16}
              height={16}
            />
          </span>
          <span className="text-[20px] font-bold text-ink-950">
            {formatToken(stakedBalanceValue, receiptDecimals)} cSSV
          </span>
        </div>
      </div>
      <div className="rounded-[16px] bg-surface-25 p-6">
        <p className="text-[14px] font-semibold text-ink-400">
          Claimable
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Image
            alt="ETH"
            className="size-7"
            src={ethIcon}
            width={28}
            height={28}
          />
          <span className="text-[20px] font-bold text-ink-900">
            {formatToken(claimableValue, 18, 5)} ETH
          </span>
        </div>
      </div>
    </section>
  );
}
