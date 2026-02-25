import { Address } from "viem";
import { hoodi, mainnet } from "viem/chains";

import { HOODI_CONFIG } from "@/config/hoodi";
import { MAINNET_CONFIG } from "@/config/mainnet";

export type NetworkKey = "hoodi" | "mainnet";

type ContractsConfig = {
  SSVToken: Address;
  cSSVToken: Address;
  Staking: Address;
  Views: Address;
};

export type NetworkConfig = {
  key: NetworkKey;
  chainId: number;
  chainName: string;
  rpcUrl: string;
  contracts: ContractsConfig;
  blockExplorer: {
    name: string;
    url: string;
    txBaseUrl: string;
    addressBaseUrl: string;
  };
  faucetUrl: string | null;
  dvtUrl: string | null;
};

const hoodiConfig: NetworkConfig = {
  key: "hoodi",
  chainId: hoodi.id,
  chainName: HOODI_CONFIG.chainName,
  rpcUrl: HOODI_CONFIG.rpcUrl,
  contracts: HOODI_CONFIG.contracts,
  blockExplorer: HOODI_CONFIG.blockExplorer,
  faucetUrl: HOODI_CONFIG.faucetUrl,
  dvtUrl: HOODI_CONFIG.dvtUrl
};

const mainnetConfig: NetworkConfig = {
  key: "mainnet",
  chainId: mainnet.id,
  chainName: MAINNET_CONFIG.chainName,
  rpcUrl: MAINNET_CONFIG.rpcUrl,
  contracts: MAINNET_CONFIG.contracts,
  blockExplorer: MAINNET_CONFIG.blockExplorer,
  faucetUrl: MAINNET_CONFIG.faucetUrl,
  dvtUrl: MAINNET_CONFIG.dvtUrl
};

export const NETWORK_CONFIGS: Record<NetworkKey, NetworkConfig> = {
  hoodi: hoodiConfig,
  mainnet: mainnetConfig
};

export const DEFAULT_NETWORK = NETWORK_CONFIGS.hoodi;

export const getNetworkConfigByChainId = (
  chainId: number | undefined
): NetworkConfig => {
  if (chainId === NETWORK_CONFIGS.mainnet.chainId) {
    return NETWORK_CONFIGS.mainnet;
  }
  if (chainId === NETWORK_CONFIGS.hoodi.chainId) {
    return NETWORK_CONFIGS.hoodi;
  }
  return DEFAULT_NETWORK;
};
