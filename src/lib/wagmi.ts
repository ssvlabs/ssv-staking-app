import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { defineChain, type Chain } from "viem";
import { hoodi, mainnet } from "viem/chains";

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

// Map of chainId to viem's built-in chain configs
const viemChainsByChainId: Record<number, Chain> = {
  1: mainnet,
  560048: hoodi
};

// Dynamically generate chains from NETWORK_CONFIGS, using viem's configs as base
const chainsArray = NETWORK_CONFIGS.map(config => {
  const baseChain = viemChainsByChainId[config.chainId];

  if (baseChain) {
    // Use viem's chain config and override only what's needed
    return defineChain({
      ...baseChain,
      iconBackground: "none",
      iconUrl: "/figma/ethereum_0-2171.svg",
      rpcUrls: {
        ...baseChain.rpcUrls,
        default: {
          http: [config.rpcUrl]
        }
      },
      // Override block explorer if custom one is provided
      ...(config.blockExplorer.url && {
        blockExplorers: {
          default: {
            name: config.blockExplorer.name,
            url: config.blockExplorer.url
          }
        }
      })
    });
  }

  // Fallback for chains not in viem (e.g., custom testnets)
  return defineChain({
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
  });
});

// Ensure at least one chain exists for wagmi config
if (chainsArray.length === 0) {
  throw new Error("At least one network must be configured in VITE_SSV_NETWORKS");
}

// Type assertion: wagmi requires a readonly tuple with at least one element
// The runtime check above ensures this constraint is met
const chains = chainsArray as unknown as readonly [Chain, ...Chain[]];

export const wagmiConfig = getDefaultConfig({
  appName: "SSV Web App",
  projectId,
  wallets: getWalletGroups(),
  chains,
  ssr: false
});
