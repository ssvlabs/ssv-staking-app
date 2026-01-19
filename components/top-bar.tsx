"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { useTheme } from "@/lib/theme";

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
    <header className="relative w-full border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
      <div className="flex h-[72px] w-full items-center justify-between px-6">
        <div className="flex items-center">
          <img
            alt="ssv.network staking"
            src={logoSrc}
            className="h-[32px] w-[160px]"
          />
        </div>
        <div className="flex items-center gap-6">
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
              const label = connected ? account.displayName : "Connect Wallet";
              const buttonClass = connected
                ? "bg-[var(--color-surface-50)] text-[var(--color-ink-900)] px-4 gap-3"
                : "bg-[var(--cta-bg)] text-[var(--cta-text)] px-5 gap-2 hover:bg-[var(--cta-bg-hover)] active:bg-[var(--cta-bg-active)] disabled:bg-[var(--cta-bg-disabled)] disabled:text-[var(--cta-text-disabled)]";
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
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[78px] w-[263px] -translate-x-1/2 -translate-y-1/2 opacity-[var(--cta-pattern-opacity)]"
                      aria-hidden="true"
                    >
                      <img
                        alt=""
                        src={connectPattern}
                        className="h-full w-full"
                      />
                    </span>
                  ) : null}
                  {connected ? (
                    <img
                      src={metamaskIcon}
                      alt=""
                      className="size-6"
                      aria-hidden="true"
                    />
                  ) : null}
                  {label}
                </button>
              );
            }}
          </ConnectButton.Custom>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-[28px] w-[44px]"
            aria-label="Theme toggle"
          >
            <span className="relative block size-full">
              <img
                alt=""
                aria-hidden="true"
                src={toggleLight}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100"
                }`}
              />
              <img
                alt=""
                aria-hidden="true"
                src={toggleDark}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
