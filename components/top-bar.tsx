"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { useTheme } from "@/lib/theme";

import { NetworkSwitchBtn } from "./ui/network-switch-btn";

export default function TopBar() {
  const { isConnected } = useAccount();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const metamaskIcon = "/figma/metamask.png";
  const logoSrc = isDark
    ? "/figma/logoStaking-dark.svg"
    : "/figma/logoStaking.svg";
  const connectPattern = "/figma/ssv-button-bg.svg";
  const toggleLight = "/figma/modeToggle.svg";
  const toggleDark = "/figma/modeToggle-dark.svg";
  return (
    <header className="relative w-full border-b border-border bg-surface-0">
      <div className="flex h-[72px] w-full items-center justify-between px-6">
        <div className="flex items-center">
          <Image
            alt="ssv.network staking"
            src={logoSrc}
            className="h-[32px] w-[160px]"
            width={160}
            height={32}
            priority
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {" "}
            <NetworkSwitchBtn />
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openAccountModal,
                mounted
              }) => {
                const ready = mounted;
                const connected = ready && isConnected && account && chain;
                const label = connected
                  ? account.displayName
                  : "Connect Wallet";
                const buttonClass = connected
                  ? "bg-surface-50 text-ink-900 px-4 gap-3"
                  : "bg-cta-bg text-cta-text px-5 gap-2 hover:bg-cta-bg-hover active:bg-cta-bg-active disabled:bg-cta-bg-disabled disabled:text-cta-text-disabled";
                return (
                  <button
                    type="button"
                    onClick={connected ? openAccountModal : openConnectModal}
                    className={`relative flex h-[48px] items-center overflow-hidden rounded-[8px] text-[14px] font-medium transition ${buttonClass}`}
                    {...(!ready && {
                      "aria-hidden": true,
                      tabIndex: -1
                    })}
                  >
                    {!connected ? (
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[78px] w-[263px] -translate-x-1/2 -translate-y-1/2 opacity-cta-pattern"
                        aria-hidden="true"
                      >
                        <Image
                          alt=""
                          src={connectPattern}
                          className="size-full"
                          width={263}
                          height={78}
                        />
                      </span>
                    ) : null}
                    {connected ? (
                      <Image
                        src={metamaskIcon}
                        alt=""
                        className="size-6"
                        width={24}
                        height={24}
                        aria-hidden="true"
                      />
                    ) : null}
                    {label}
                  </button>
                );
              }}
            </ConnectButton.Custom>{" "}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-[28px] w-[44px]"
            aria-label="Theme toggle"
          >
            <span className="relative block size-full">
              <Image
                alt=""
                aria-hidden="true"
                src={toggleLight}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark
                    ? "translate-x-1 opacity-0"
                    : "translate-x-0 opacity-100"
                }`}
                width={44}
                height={28}
              />
              <Image
                alt=""
                aria-hidden="true"
                src={toggleDark}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0"
                }`}
                width={44}
                height={28}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
