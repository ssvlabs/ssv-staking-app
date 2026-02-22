"use client";

import Image from "next/image";

import { formatApr, formatToken } from "@/lib/staking/format";
import { InfoIcon } from "@/components/ui/info-icon";
import { Tooltip } from "@/components/ui/tooltip";

type StakingHeaderProps = {
  aprValue: number | null;
  potentialAprValue: number | null;
  totalStakedValue: bigint | undefined;
  tokenDecimals: number;
  ssvSmall: string;
  calculatorIcon: string;
};

export function StakingHeader({
  aprValue,
  potentialAprValue,
  totalStakedValue,
  tokenDecimals,
  ssvSmall,
  calculatorIcon
}: StakingHeaderProps) {
  const aprBgPieces = [
    {
      light: "/figma/staking-apr-bg-light-1.svg",
      dark: "/figma/staking-apr-bg-dark-1.svg",
      className: "absolute inset-[61%_36.2%_6.6%_36.44%]"
    },
    {
      light: "/figma/staking-apr-bg-light-2.svg",
      dark: "/figma/staking-apr-bg-dark-2.svg",
      className: "absolute inset-[29%_53.64%_38.6%_19%]"
    },
    {
      light: "/figma/staking-apr-bg-light-3.svg",
      dark: "/figma/staking-apr-bg-dark-3.svg",
      className: "absolute inset-[28.42%_18.92%_39.18%_53.72%]"
    },
    {
      light: "/figma/staking-apr-bg-light-4.svg",
      dark: "/figma/staking-apr-bg-dark-4.svg",
      className: "absolute inset-[8%_36.57%_59.6%_36%]"
    }
  ];

  const totalBgPieces = [
    {
      light: "/figma/staking-total-bg-light-1.svg",
      dark: "/figma/staking-total-bg-dark-1.svg",
      className: "absolute inset-[61%_36.2%_6.6%_36.44%]"
    },
    {
      light: "/figma/staking-total-bg-light-2.svg",
      dark: "/figma/staking-total-bg-dark-2.svg",
      className: "absolute inset-[29%_53.64%_38.6%_19%]"
    },
    {
      light: "/figma/staking-total-bg-light-3.svg",
      dark: "/figma/staking-total-bg-dark-3.svg",
      className: "absolute inset-[28.42%_18.92%_39.18%_53.72%]"
    },
    {
      light: "/figma/staking-total-bg-light-4.svg",
      dark: "/figma/staking-total-bg-dark-4.svg",
      className: "absolute inset-[8%_36.57%_59.6%_36%]"
    }
  ];

  return (
    <section className="flex flex-col gap-6 rounded-[16px] bg-[#fdfefe] p-6 dark:bg-[#0b2a3c]">
      <div className="flex flex-col gap-2">
        <p className="text-[20px] font-bold leading-[28px] text-[#0b2a3c] dark:text-[#fdfefe]">
          SSV Staking
        </p>
        <p className="text-[16px] font-medium leading-[24px] text-[#34455a] dark:text-[#e6eaf7]">
          Stake your SSV tokens to earn ETH network fees.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[8px] bg-[#f4f7fa] p-5 dark:bg-[#0b1620]">
          <div
            className="pointer-events-none absolute left-[72.51px] top-[-48.6px] flex size-[230.063px] items-center justify-center"
            aria-hidden="true"
          >
            <div className="flex-none rotate-[196deg] scale-y-[-100%]">
              <div className="relative size-[186px] opacity-[0.08]">
                {aprBgPieces.map((piece) => (
                  <div
                    key={piece.light}
                    className={`relative ${piece.className}`}
                  >
                    <Image
                      alt=""
                      className="dark:hidden"
                      src={piece.light}
                      fill
                      sizes="100%"
                    />
                    <Image
                      alt=""
                      className="hidden dark:block"
                      src={piece.dark}
                      fill
                      sizes="100%"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[14px] font-semibold leading-[20px] text-[#97a5ba]">
            <span>Current APR</span>
            <Tooltip content="Estimated APR based on recent reward accrual.">
              <span className="inline-flex size-5 items-center justify-center">
                <InfoIcon className="text-[#cbd3e5]" />
              </span>
            </Tooltip>
          </div>
          <p className="text-[20px] font-bold leading-[28px] text-[#0b2a3c] dark:text-[#fdfefe]">
            {aprValue !== null ? `${formatApr(aprValue)} %` : "--"}
          </p>
        </div>

        {/* Potential APR — center card with calculator link */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[12px] bg-gradient-to-br from-[#264FA4] to-[#2F61C9] p-5">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <Image
              alt=""
              src="/figma/apr-bg-logo.svg"
              fill
              className="object-cover"
              sizes="100%"
            />
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1 text-[14px] font-semibold leading-[20px] text-[#cbd3e5]">
              <span>Potential APR</span>
              <Tooltip content="Potential APR assuming 100% network migration to ETH clusters.">
                <span className="inline-flex size-5 items-center justify-center">
                  <InfoIcon className="text-[#cbd3e5]" />
                </span>
              </Tooltip>
            </div>
            <Tooltip content="Staking Calculator">
              <a
                className="inline-flex size-6 items-center justify-center text-white"
                href="https://ssv.network/cssv#calculator"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  alt="Staking calculator"
                  className="size-5 text-[#cbd3e5]"
                  src={calculatorIcon}
                  width={20}
                  height={20}
                />
              </a>
            </Tooltip>
          </div>
          <p className="relative text-[20px] font-bold leading-[28px] text-white">
            {potentialAprValue !== null
              ? `${formatApr(potentialAprValue)} %`
              : "--"}
          </p>
        </div>

        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[8px] bg-[#f4f7fa] p-5 dark:bg-[#0b1620]">
          <div
            className="pointer-events-none absolute left-[134px] top-[-27px] flex size-[195.611px] items-center justify-center"
            aria-hidden="true"
          >
            <div className="flex-none rotate-[156.904deg] scale-y-[-100%]">
              <div className="relative size-[149.08px] opacity-[0.08]">
                {totalBgPieces.map((piece) => (
                  <div
                    key={piece.light}
                    className={`relative ${piece.className}`}
                  >
                    <Image
                      alt=""
                      className="dark:hidden"
                      src={piece.light}
                      fill
                      sizes="100%"
                    />
                    <Image
                      alt=""
                      className="hidden dark:block"
                      src={piece.dark}
                      fill
                      sizes="100%"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[14px] font-semibold leading-[20px] text-[#97a5ba]">
            <span>Total SSV Staked</span>
            <Tooltip content="Total SSV currently staked in the protocol.">
              <span className="inline-flex size-5 items-center justify-center">
                <InfoIcon className="text-[#cbd3e5]" />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-[28px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c8de6_0%,#3e75e2_100%)] p-[6px]">
              <Image
                alt="SSV"
                className="size-4"
                src={ssvSmall}
                width={16}
                height={16}
              />
            </span>
            <span className="text-[20px] font-bold leading-[28px] text-[#0b2a3c] dark:text-[#fdfefe]">
              {formatToken(totalStakedValue, tokenDecimals)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
