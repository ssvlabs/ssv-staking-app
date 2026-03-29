import { Address, isAddress } from "viem";
import { z } from "zod";

// Zod schema for SSV Network validation
const SSVNetworkSchema = z.object({
  networkId: z.number().positive(),
  chainName: z.string().min(1),
  rpcUrl: z.string().url(),
  apiVersion: z.string().min(1),
  apiNetwork: z.string().min(1),
  api: z.string().url(),
  blockExplorerName: z.string().min(1).optional(),
  blockExplorerUrl: z.string().url().optional(),
  tokenAddress: z.string().refine((val) => isAddress(val), {
    message: "Invalid Ethereum address for tokenAddress"
  }),
  cTokenAddress: z.string().refine((val) => isAddress(val), {
    message: "Invalid Ethereum address for cTokenAddress"
  }),
  setterContractAddress: z.string().refine((val) => isAddress(val), {
    message: "Invalid Ethereum address for setterContractAddress"
  }),
  getterContractAddress: z.string().refine((val) => isAddress(val), {
    message: "Invalid Ethereum address for getterContractAddress"
  }),
  faucetUrl: z.string().url().nullable(),
  dvtUrl: z.string().url().nullable(),
  abiType: z.enum(["stage", "hoodi", "mainnet"])
});

// SSV Network schema from env variable
type SSVNetworkFromEnv = z.infer<typeof SSVNetworkSchema>;

type ContractsConfig = {
  SSVToken: Address;
  cSSVToken: Address;
  Setter: Address;
  Getter: Address;
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
  // abiType cannot be derived from chainId alone because the same chain (e.g., Hoodi with chainId 560048)
  // can use different ABIs in different environments (stage vs production)
  abiType: "stage" | "hoodi" | "mainnet";
};

// Utility function to join URL parts, handling trailing/leading slashes
const urlJoin = (...parts: string[]): string => {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/+$/, "");
      }
      if (index === parts.length - 1) {
        return part.replace(/^\/+/, "");
      }
      return part.replace(/^\/+/, "").replace(/\/+$/, "");
    })
    .filter((part) => part.length > 0)
    .join("/");
};

// Parse SSV_NETWORKS from environment variable
const parseSSVNetworks = (): SSVNetworkFromEnv[] => {
  const networksEnv = import.meta.env.VITE_SSV_NETWORKS;

  if (!networksEnv) {
    throw new Error(
      "VITE_SSV_NETWORKS is not defined in environment variables"
    );
  }

  try {
    const parsed = JSON.parse(networksEnv);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("VITE_SSV_NETWORKS must be a non-empty array");
    }

    // Validate each network using Zod schema
    const validatedNetworks = parsed.map((network, index) => {
      try {
        return SSVNetworkSchema.parse(network);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          throw new Error(
            `Network at index ${index} validation failed: ${issues}`
          );
        }
        throw error;
      }
    });

    return validatedNetworks;
  } catch (error) {
    throw new Error(
      `Failed to parse VITE_SSV_NETWORKS: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Convert SSVNetworkFromEnv to NetworkConfig
const convertToNetworkConfig = (network: SSVNetworkFromEnv): NetworkConfig => {
  return {
    chainId: network.networkId,
    chainName: network.chainName,
    rpcUrl: network.rpcUrl,
    ssvApiBaseUrl: urlJoin(network.api, network.apiVersion, network.apiNetwork),
    contracts: {
      SSVToken: network.tokenAddress as Address,
      cSSVToken: network.cTokenAddress as Address,
      Setter: network.setterContractAddress as Address,
      Getter: network.getterContractAddress as Address
    },
    blockExplorer: {
      name: network.blockExplorerName || "",
      url: network.blockExplorerUrl || "",
      txBaseUrl: network.blockExplorerUrl
        ? urlJoin(network.blockExplorerUrl, "tx") + "/"
        : "",
      addressBaseUrl: network.blockExplorerUrl
        ? urlJoin(network.blockExplorerUrl, "address") + "/"
        : ""
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

  const network = NETWORK_CONFIGS.find((config) => config.chainId === chainId);
  return network || DEFAULT_NETWORK;
};
