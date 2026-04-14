import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { WalletLogo } from "@/components/ui/wallet-logo";
import { useTheme } from "@/lib/theme";
import { useNetworkConfig } from "@/hooks/use-network-config";

import { NetworkSwitchBtn } from "./ui/network-switch-btn";
import { Button } from "./ui/button";

export default function TopBar() {
  const { isConnected } = useAccount();
  const { theme, toggleTheme } = useTheme();
  const network = useNetworkConfig();
  const isDark = theme === "dark";

  return (
    <header className="relative w-full border-b border-border ">
      <div className="flex h-[72px] w-full items-center justify-between px-6">
        <div className="flex items-center">
          <img
            alt="ssv.network staking"
            src={
              isDark ? "/figma/logoStaking-dark.svg" : "/figma/logoStaking.svg"
            }
            className="h-[32px] w-[160px]"
            width={160}
            height={32}
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {network.faucetUrl ? (
              <a
                href={network.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  className="flex h-12 items-center gap-3 rounded-[8px] bg-surface-50 px-4 text-sm"
                  type="button"
                >
                  Faucet
                </Button>
              </a>
            ) : null}
            {network.dvtUrl ? (
              <a
                href={network.dvtUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  className="flex h-12 items-center gap-3 rounded-[8px] bg-surface-50 px-4 text-sm"
                  type="button"
                >
                  DVT
                </Button>
              </a>
            ) : null}
            <NetworkSwitchBtn />
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openAccountModal,
                mounted,
              }) => {
                const connected = mounted && isConnected && account && chain;
                return (
                  <button
                    type="button"
                    onClick={connected ? openAccountModal : openConnectModal}
                    className={`relative flex h-[48px] items-center overflow-hidden rounded-[8px] text-[14px] font-medium transition ${
                      connected
                        ? "bg-surface-50 text-ink-900 px-4 gap-3"
                        : "bg-cta-bg text-cta-text px-5 gap-2 hover:bg-cta-bg-hover active:bg-cta-bg-active disabled:bg-cta-bg-disabled disabled:text-cta-text-disabled"
                    }`}
                    {...(!mounted && {
                      "aria-hidden": true,
                      tabIndex: -1,
                    })}
                  >
                    {!connected ? (
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[78px] w-[263px] -translate-x-1/2 -translate-y-1/2 opacity-cta-pattern"
                        aria-hidden="true"
                      >
                        <img
                          alt=""
                          src="/figma/ssv-button-bg.svg"
                          className="size-full"
                          width={263}
                          height={78}
                        />
                      </span>
                    ) : null}
                    {connected ? <WalletLogo className="size-6" /> : null}
                    {connected ? account.displayName : "Connect Wallet"}
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
              <img
                alt=""
                aria-hidden="true"
                src="/figma/modeToggle.svg"
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark
                    ? "translate-x-1 opacity-0"
                    : "translate-x-0 opacity-100"
                }`}
                width={44}
                height={28}
              />
              <img
                alt=""
                aria-hidden="true"
                src="/figma/modeToggle-dark.svg"
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
