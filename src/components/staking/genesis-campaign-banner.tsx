import type { ComponentPropsWithoutRef, FC } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { formatUnits, getAddress, isAddress } from "viem";

import { cn, safeLocalStorage } from "@/lib/utils";
import { useStakingData, TOKEN_DECIMALS } from "@/hooks/use-staking-data";
import { useGenesisEligibility } from "@/lib/staking/use-genesis-eligibility";
import { calculateBoost } from "@/lib/staking/genesis-boost";

export const GenesisCampaignBanner: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  const { isConnected, address, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { cssvBalance } = useStakingData();
  const { isEligible: apiEligible, isLoading: isEligibilityLoading } =
    useGenesisEligibility(chainId, address);

  const stakedSSV =
    cssvBalance?.value !== undefined
      ? Number(formatUnits(cssvBalance.value, TOKEN_DECIMALS))
      : undefined;

  // QA override: force eligibility for a specific wallet via localStorage.
  const override = safeLocalStorage("boostWalletAddress");
  const forcedEligible =
    !!address &&
    !!override &&
    isAddress(override) &&
    getAddress(override) === getAddress(address);
  const isEligible = forcedEligible || apiEligible;

  const eligibilityLabel = isEligibilityLoading
    ? "…"
    : isEligible
      ? "Eligible"
      : "Not eligible";
  const boostValue = isEligibilityLoading
    ? "–"
    : stakedSSV !== undefined
      ? calculateBoost(isEligible, stakedSSV)
      : "–";
  const boostIsValue = boostValue !== "–" && boostValue !== "0%";

  return (
    <div
      className={cn(
        "relative h-[62px] overflow-hidden rounded-[12px]",
        className
      )}
      {...props}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(93.06deg, #8F28C2 0%, #D3699F 100%)",
        }}
      />

      {/* Sparkle texture overlay — right-aligned, oversized, soft-light matches Figma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 mix-blend-soft-light opacity-[0.35]"
        style={{ top: "-58px", width: "134%", height: "343px" }}
      >
        <img
          alt=""
          className="size-full object-cover object-center"
          src="/figma/genesis-banner-bg.png"
        />
      </div>

      {/* Figma pixel-perfect — do not adjust */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-2px] flex h-[73px] w-[94px] items-center justify-center"
        style={{ top: "3px" }}
      >
        <div className="flex-none" style={{ transform: "rotate(180deg) scaleY(-1)" }}>
          <div className="relative h-[73px] w-[94px] overflow-hidden">
            <div
              className="absolute flex items-center justify-center"
              style={{ inset: "-4.33% 31.53% 15.33% -0.02%", containerType: "size" }}
            >
              <div
                className="flex-none"
                style={{
                  width: "hypot(77.5655cqw, 22.4345cqh)",
                  height: "hypot(22.4345cqw, 77.5655cqh)",
                  transform: "rotate(-16.27deg) skewX(-0.28deg)",
                }}
              >
                <div className="relative size-full">
                  <img
                    alt=""
                    className="absolute inset-0 size-full"
                    src="/figma/genesis-banner-frame.svg"
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute -translate-x-1/2"
              style={{
                aspectRatio: "816 / 1456",
                bottom: "-63.81%",
                left: "calc(50% + 8.04px)",
                top: "-53.18%",
              }}
            >
              <img
                alt=""
                className="absolute inset-0 size-full object-cover"
                src="/figma/genesis-banner-icon.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content row — text shrinks/wraps to fit; the right panel stays fixed
          width so the two can never overlap. */}
      <div className="absolute inset-0 flex items-center gap-3 pl-[106px] pr-[8px]">
        {/* Campaign text */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <p className="text-[14px] font-bold leading-[20px] text-white">
            cSSV Syndicate Boost
          </p>
          <p className="text-[10px] font-medium leading-[13px] text-white">
            Held eligible LSTs at snapshot? Stake SSV for up to 20% boosted
            rewards.{" "}
            <a
              className="text-[#e0bbfe] underline"
              href="https://ssv.network/cssv/syndicate"
              target="_blank"
              rel="noreferrer"
            >
              Learn more.
            </a>
          </p>
        </div>

        {/* Right-side: Connect Wallet (disconnected) OR STATUS/BOOST panel (connected) */}
        {!isConnected ? (
          <button
            type="button"
            className="h-[28px] flex-none rounded-[4px] bg-[rgba(232,246,254,0.2)] px-3 text-[10px] font-medium text-white whitespace-nowrap transition-colors hover:bg-[rgba(232,246,254,0.3)]"
            onClick={openConnectModal}
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex flex-none items-center gap-[16px] rounded-[6px] bg-[rgba(232,246,254,0.2)] pl-[16px] pr-[8px] pb-[8px] pt-[8px]">
          {/* STATUS */}
          <div className="flex flex-col gap-[2px] items-start">
            <span className="text-[8px] font-bold text-white/50 uppercase leading-normal">
              STATUS
            </span>
            <div className="flex items-center gap-[2px]">
              <span className="text-[14px] font-extrabold text-white leading-normal whitespace-nowrap">
                {eligibilityLabel}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-white/30" />

          {/* BOOST */}
          <div className="flex flex-col gap-[2px] items-end">
            <span className="text-[8px] font-bold text-white/50 uppercase leading-normal">
              BOOST
            </span>
            <div className="flex items-center gap-[2px]">
              <span
                className="text-[14px] font-extrabold leading-normal whitespace-nowrap"
                style={{ color: boostIsValue ? "#fcc800" : "#fdfefe" }}
              >
                {boostValue}
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

GenesisCampaignBanner.displayName = "GenesisCampaignBanner";
