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

export const hoodi = defineChain({
  id: NETWORK_CONFIGS.hoodi.chainId,
  name: NETWORK_CONFIGS.hoodi.chainName,
  iconBackground: "none",
  iconUrl: "/figma/ethereum_0-2171.svg",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [NETWORK_CONFIGS.hoodi.rpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: NETWORK_CONFIGS.hoodi.blockExplorer.name,
      url: NETWORK_CONFIGS.hoodi.blockExplorer.url
    }
  }
});

export const mainnet = defineChain({
  id: NETWORK_CONFIGS.mainnet.chainId,
  name: NETWORK_CONFIGS.mainnet.chainName,
  iconBackground: "none",
  iconUrl: "/figma/ethereum_0-2171.svg",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [NETWORK_CONFIGS.mainnet.rpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: NETWORK_CONFIGS.mainnet.blockExplorer.name,
      url: NETWORK_CONFIGS.mainnet.blockExplorer.url
    }
  }
});

const chains = [hoodi, mainnet] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "SSV Web App",
  projectId,
  wallets: getWalletGroups(),
  chains,
  ssr: true
});
