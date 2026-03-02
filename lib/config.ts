import { Address, isAddress } from "viem";

// SSV Network schema from env variable
type SSVNetworkFromEnv = {
  networkId: number;
  chainName: string;
  rpcUrl: string;
  apiVersion: string;
  apiNetwork: string;
  api: string;
  blockExplorerName: string;
  blockExplorerUrl: string;
  tokenAddress: Address;
  cTokenAddress: Address;
  stakingAddress: Address;
  viewsAddress: Address;
  faucetUrl: string | null;
  dvtUrl: string | null;
  abiType: "stage" | "hoodi" | "mainnet";
};

type ContractsConfig = {
  SSVToken: Address;
  cSSVToken: Address;
  Staking: Address;
  Views: Address;
};

export type NetworkConfig = {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  ssvApiBaseUrl: string;
  contracts: ContractsConfig;
  blockExplorer: {
    name: string;
    url: string;
    txBaseUrl: string;
    addressBaseUrl: string;
  };
  faucetUrl: string | null;
  dvtUrl: string | null;
  abiType: "stage" | "hoodi" | "mainnet";
};

// Parse SSV_NETWORKS from environment variable
const parseSSVNetworks = (): SSVNetworkFromEnv[] => {
  const networksEnv = process.env.NEXT_PUBLIC_SSV_NETWORKS;

  if (!networksEnv) {
    throw new Error("NEXT_PUBLIC_SSV_NETWORKS is not defined in environment variables");
  }

  try {
    const parsed = JSON.parse(networksEnv);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("NEXT_PUBLIC_SSV_NETWORKS must be a non-empty array");
    }

    // Validate each network
    parsed.forEach((network, index) => {
      if (!network.networkId || typeof network.networkId !== "number") {
        throw new Error(`Network at index ${index}: networkId is required and must be a number`);
      }
      if (!network.tokenAddress || !isAddress(network.tokenAddress)) {
        throw new Error(`Network at index ${index}: tokenAddress is invalid`);
      }
      if (!network.stakingAddress || !isAddress(network.stakingAddress)) {
        throw new Error(`Network at index ${index}: stakingAddress is invalid`);
      }
      if (!network.viewsAddress || !isAddress(network.viewsAddress)) {
        throw new Error(`Network at index ${index}: viewsAddress is invalid`);
      }
    });

    return parsed as SSVNetworkFromEnv[];
  } catch (error) {
    throw new Error(`Failed to parse NEXT_PUBLIC_SSV_NETWORKS: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Convert SSVNetworkFromEnv to NetworkConfig
const convertToNetworkConfig = (network: SSVNetworkFromEnv): NetworkConfig => {
  return {
    chainId: network.networkId,
    chainName: network.chainName,
    rpcUrl: network.rpcUrl,
    ssvApiBaseUrl: `${network.api}/${network.apiVersion}/${network.apiNetwork}`,
    contracts: {
      SSVToken: network.tokenAddress,
      cSSVToken: network.cTokenAddress,
      Staking: network.stakingAddress,
      Views: network.viewsAddress
    },
    blockExplorer: {
      name: network.blockExplorerName,
      url: network.blockExplorerUrl,
      txBaseUrl: `${network.blockExplorerUrl}/tx/`,
      addressBaseUrl: `${network.blockExplorerUrl}/address/`
    },
    faucetUrl: network.faucetUrl,
    dvtUrl: network.dvtUrl,
    abiType: network.abiType
  };
};

// Parse networks and create NETWORK_CONFIGS array
const ssvNetworks = parseSSVNetworks();
export const NETWORK_CONFIGS = ssvNetworks.map(convertToNetworkConfig);
export const DEFAULT_NETWORK = NETWORK_CONFIGS[0];

export const getNetworkConfigByChainId = (
  chainId: number | undefined
): NetworkConfig => {
  if (!chainId) {
    return DEFAULT_NETWORK;
  }

  const network = NETWORK_CONFIGS.find(config => config.chainId === chainId);
  return network || DEFAULT_NETWORK;
};
