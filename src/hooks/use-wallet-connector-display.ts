import { useMemo } from "react";
import { useAccount } from "wagmi";

const WALLET_ICONS: Record<string, string> = {
  MetaMask: "/images/wallets/metamask.svg",
  "Coinbase Wallet": "/images/wallets/coinbase.svg",
  WalletConnect: "/images/wallets/walletconnect.svg",
  Ledger: "/images/wallets/ledger.svg",
  Trezor: "/images/wallets/trezor.svg",
};

export function useWalletConnectorDisplay() {
  const { connector } = useAccount();

  return useMemo(() => {
    const connectorName =  connector?.name ?? "Wallet";
    return { name: connectorName, iconSrc: WALLET_ICONS[connectorName] };
  }, [connector?.name]);
}
