import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { defineChain } from "viem";

import { CONFIG } from "@/lib/config";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

type InjectedEthereumProvider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: InjectedEthereumProvider[];
};

const getInjectedProviders = (): InjectedEthereumProvider[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const ethereum = (window as Window & { ethereum?: InjectedEthereumProvider })
    .ethereum;

  if (!ethereum) {
    return [];
  }

  if (Array.isArray(ethereum.providers)) {
    return ethereum.providers;
  }

  return [ethereum];
};

const hasProviderFlag = (flag: keyof InjectedEthereumProvider) =>
  getInjectedProviders().some(
    (provider: InjectedEthereumProvider) => provider?.[flag]
  );

const getWalletGroups = () => {
  const installedWallets = [];
  const popularWallets = [];

  if (hasProviderFlag("isMetaMask")) {
    installedWallets.push(metaMaskWallet);
  } else {
    popularWallets.push(metaMaskWallet);
  }

  if (hasProviderFlag("isCoinbaseWallet")) {
    installedWallets.push(coinbaseWallet);
  } else {
    popularWallets.push(coinbaseWallet);
  }

  popularWallets.push(walletConnectWallet);

  return [
    ...(installedWallets.length
      ? [{ groupName: "Installed", wallets: installedWallets }]
      : []),
    { groupName: "Popular", wallets: popularWallets }
  ];
};

export const hoodi = defineChain({
  id: CONFIG.chainId,
  name: "Hoodi",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://0xrpc.io/hoodi"],
      webSocket: ["wss://0xrpc.io/hoodi"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hoodi Explorer",
      url: "https://hoodi.etherscan.io"
    }
  }
});

export const wagmiConfig = getDefaultConfig({
  appName: "SSV Staking Dashboard",
  projectId,
  wallets: getWalletGroups(),
  chains: [hoodi],
  ssr: true
});
