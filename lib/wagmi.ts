import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { defineChain } from "viem";

import { NETWORK_CONFIGS } from "@/lib/config";

const projectId = "c93804911b583e5cacf856eee58655e6";

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

// Dynamically generate chains from NETWORK_CONFIGS
const chains = NETWORK_CONFIGS.map(config =>
  defineChain({
    id: config.chainId,
    name: config.chainName,
    iconBackground: "none",
    iconUrl: "/figma/ethereum_0-2171.svg",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: [config.rpcUrl]
      }
    },
    blockExplorers: {
      default: {
        name: config.blockExplorer.name,
        url: config.blockExplorer.url
      }
    }
  })
) as any;

export const wagmiConfig = getDefaultConfig({
  appName: "SSV Web App",
  projectId,
  wallets: getWalletGroups(),
  chains,
  ssr: true
});
