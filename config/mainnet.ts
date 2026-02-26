import { mainnet } from "viem/chains";
import { createEnvAssertions } from "@/config/env-assertions";

const { getRequiredUrl, getRequiredAddress } = createEnvAssertions("mainnet");

const explorerUrl = mainnet.blockExplorers.default.url;
const normalizedExplorerUrl = explorerUrl.endsWith("/")
  ? explorerUrl.slice(0, -1)
  : explorerUrl;

export const MAINNET_CONFIG = {
  chainName: mainnet.name,
  rpcUrl: getRequiredUrl(
    [
      {
        key: "NEXT_PUBLIC_MAINNET_RPC_URL",
        value: process.env.NEXT_PUBLIC_MAINNET_RPC_URL
      },
      { key: "MAINNET_RPC_URL", value: process.env.MAINNET_RPC_URL }
    ],
    "Mainnet RPC URL"
  ),
  ssvApiBaseUrl: getRequiredUrl(
    [
      {
        key: "NEXT_PUBLIC_MAINNET_SSV_API",
        value: process.env.NEXT_PUBLIC_MAINNET_SSV_API
      },
      {
        key: "MAINNET_SSV_API",
        value: process.env.MAINNET_SSV_API
      }
    ],
    "Mainnet SSV API URL"
  ).replace(/\/+$/, ""),
  contracts: {
    SSVToken: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_MAINNET_SSV_TOKEN_ADDRESS",
          value: process.env.NEXT_PUBLIC_MAINNET_SSV_TOKEN_ADDRESS
        },
        {
          key: "MAINNET_SSV_TOKEN_ADDRESS",
          value: process.env.MAINNET_SSV_TOKEN_ADDRESS
        }
      ],
      "Mainnet SSV token address"
    ),
    cSSVToken: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_MAINNET_CSSV_TOKEN_ADDRESS",
          value: process.env.NEXT_PUBLIC_MAINNET_CSSV_TOKEN_ADDRESS
        },
        {
          key: "MAINNET_CSSV_TOKEN_ADDRESS",
          value: process.env.MAINNET_CSSV_TOKEN_ADDRESS
        }
      ],
      "Mainnet cSSV token address"
    ),
    Staking: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_MAINNET_STAKING_ADDRESS",
          value: process.env.NEXT_PUBLIC_MAINNET_STAKING_ADDRESS
        },
        {
          key: "MAINNET_STAKING_ADDRESS",
          value: process.env.MAINNET_STAKING_ADDRESS
        }
      ],
      "Mainnet staking contract address"
    ),
    Views: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_MAINNET_VIEWS_ADDRESS",
          value: process.env.NEXT_PUBLIC_MAINNET_VIEWS_ADDRESS
        },
        {
          key: "MAINNET_VIEWS_ADDRESS",
          value: process.env.MAINNET_VIEWS_ADDRESS
        }
      ],
      "Mainnet views contract address"
    )
  },
  blockExplorer: {
    name: mainnet.blockExplorers.default.name,
    url: normalizedExplorerUrl,
    txBaseUrl: `${normalizedExplorerUrl}/tx/`,
    addressBaseUrl: `${normalizedExplorerUrl}/address/`
  },
  faucetUrl: null
} as const;
