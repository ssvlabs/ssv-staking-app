import type { ComponentPropsWithoutRef, FC } from "react";
import { BiSolidWallet } from "react-icons/bi";

import { useWalletConnectorDisplay } from "@/hooks/use-wallet-connector-display";
import { cn } from "@/lib/utils";

export type WalletLogoProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "alt"
>;

type WalletLogoFC = FC<WalletLogoProps>;

export const WalletLogo: WalletLogoFC = ({ className, ...imgProps }) => {
  const { iconSrc } = useWalletConnectorDisplay();

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        className={cn("shrink-0", className)}
        {...imgProps}
        aria-hidden
      />
    );
  }

  return (
    <BiSolidWallet
      className={cn("shrink-0 text-gray-500", className)}
      aria-hidden
    />
  );
};

WalletLogo.displayName = "WalletLogo";
