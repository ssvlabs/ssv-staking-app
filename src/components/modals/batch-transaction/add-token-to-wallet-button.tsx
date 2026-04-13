import type { ComponentPropsWithoutRef, FC } from "react";
import { toast } from "sonner";
import { useAccount, useWatchAsset } from "wagmi";

import { cn } from "@/lib/utils";
import { FaWallet } from "react-icons/fa6";

const WALLET_ICONS: Record<string, string> = {
  MetaMask: "/images/wallets/metamask.svg",
  "Coinbase Wallet": "/images/wallets/coinbase.svg",
  WalletConnect: "/images/wallets/walletconnect.svg",
  Ledger: "/images/wallets/ledger.svg",
  Trezor: "/images/wallets/trezor.svg",
};

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
  const { connector } = useAccount();
  const { watchAsset, isPending } = useWatchAsset();

  const walletName = connector?.name ?? "Wallet";
  const walletIcon = WALLET_ICONS[walletName];

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
          toast.error(`Unable to add ${tokenName} to ${walletName}.`);
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
        Add {tokenName} to {walletName}
      </span>
      {walletIcon ? (
        <img
          src={walletIcon}
          alt={walletName}
          className="size-4"
          width={16}
          height={16}
        />
      ) : (
        <FaWallet className="size-4" />
      )}
    </button>
  );
};

AddTokenToWalletButton.displayName = "AddTokenToWalletButton";
