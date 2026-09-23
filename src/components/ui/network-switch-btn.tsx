import type { ComponentPropsWithRef, FC } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaChevronDown } from "react-icons/fa6";

import { useAccount } from "@/hooks/use-account";

export const NetworkSwitchBtn: FC<ComponentPropsWithRef<"button">> = (
  props
) => {
  const { isSafe } = useAccount();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, mounted }) => {
        const connected = mounted && account && chain;
        if (!connected || isSafe) return null;

        return (
          <button
            data-cy="network-button"
            onClick={openChainModal}
            className="flex h-12 items-center gap-3 rounded-[8px] bg-surface-50 pl-4 pr-3 text-sm"
            type="button"
            {...props}
          >
            {chain.hasIcon && (
              <div
                className="size-6"
                style={{
                  background: chain.iconBackground,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginRight: 4
                }}
              >
                {chain.iconUrl && (
                  <img
                    alt={chain.name ?? "Chain icon"}
                    src={chain.iconUrl}
                    className="size-6"
                  />
                )}
              </div>
            )}

            <span>{chain.name}</span>
            <div className="-ml-1 flex size-6 items-center justify-center">
              <FaChevronDown className="size-3" />
            </div>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};

NetworkSwitchBtn.displayName = "NetworkSwitchBtn";
