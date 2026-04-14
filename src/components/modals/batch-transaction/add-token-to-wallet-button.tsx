import type { ComponentPropsWithoutRef, FC } from "react";
import { toast } from "sonner";
import { useWatchAsset } from "wagmi";

import { WalletLogo } from "@/components/ui/wallet-logo";
import { useWalletConnectorDisplay } from "@/hooks/use-wallet-connector-display";
import { cn } from "@/lib/utils";

export type AddTokenToWalletButtonProps = {
  tokenName: string;
  tokenAddress: `0x${string}`;
  decimals: number;
};

type AddTokenToWalletButtonFC = FC<
  Omit<ComponentPropsWithoutRef<"button">, keyof AddTokenToWalletButtonProps> &
    AddTokenToWalletButtonProps
>;

export const AddTokenToWalletButton: AddTokenToWalletButtonFC = ({
  tokenName,
  tokenAddress,
  decimals,
  className,
  ...props
}) => {
  const walletDisplay = useWalletConnectorDisplay();
  const { watchAsset, isPending } = useWatchAsset();

  const handleClick = () => {
    watchAsset(
      {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenName,
          decimals,
        },
      },
      {
        onError: () => {
          toast.error(`Unable to add ${tokenName} to ${walletDisplay.name}.`);
        },
      }
    );
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        "bg-slate-50 w-fit flex h-[36px] items-center justify-center gap-3 rounded-[8px] bg-[#E5EEFB]/50 px-3 text-[14px] font-medium text-staking-primary-500",
        className
      )}
      {...props}
    >
      <span>
        Add {tokenName} to {walletDisplay.name}
      </span>
      <WalletLogo className="size-4" width={16} height={16} />
    </button>
  );
};

AddTokenToWalletButton.displayName = "AddTokenToWalletButton";
