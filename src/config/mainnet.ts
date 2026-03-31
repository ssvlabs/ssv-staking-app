import { mainnet } from "viem/chains";

import { createEnvAssertions } from "@/config/env-assertions";

const { getRequiredUrl, getRequiredAddress, getUrlWithFallback } =
  createEnvAssertions("mainnet");

const explorerUrl = mainnet.blockExplorers.default.url;
const normalizedExplorerUrl = explorerUrl.endsWith("/")
  ? explorerUrl.slice(0, -1)
  : explorerUrl;

export const MAINNET_CONFIG = {
  chainName: mainnet.name,
  rpcUrl: getRequiredUrl(
    [
      {
        key: "VITE_MAINNET_RPC_URL",
        value: import.meta.env.VITE_MAINNET_RPC_URL
      },
      { key: "MAINNET_RPC_URL", value: import.meta.env.MAINNET_RPC_URL }
    ],
    "Mainnet RPC URL"
  ),
  ssvApiBaseUrl: getUrlWithFallback(
    [
      {
        key: "VITE_MAINNET_SSV_API",
        value: import.meta.env.VITE_MAINNET_SSV_API
      },
      {
        key: "MAINNET_SSV_API",
        value: import.meta.env.MAINNET_SSV_API
      }
    ],
    "Mainnet SSV API URL",
    mainnet.rpcUrls.default.http[0] ?? ""
  ).replace(/\/+$/, ""),
  contracts: {
    SSVToken: getRequiredAddress(
      [
        {
          key: "VITE_MAINNET_SSV_TOKEN_ADDRESS",
          value: import.meta.env.VITE_MAINNET_SSV_TOKEN_ADDRESS
        },
        {
          key: "MAINNET_SSV_TOKEN_ADDRESS",
          value: import.meta.env.MAINNET_SSV_TOKEN_ADDRESS
        }
      ],
      "Mainnet SSV token address"
    ),
    cSSVToken: getRequiredAddress(
      [
        {
          key: "VITE_MAINNET_CSSV_TOKEN_ADDRESS",
          value: import.meta.env.VITE_MAINNET_CSSV_TOKEN_ADDRESS
        },
        {
          key: "MAINNET_CSSV_TOKEN_ADDRESS",
          value: import.meta.env.MAINNET_CSSV_TOKEN_ADDRESS
        }
      ],
      "Mainnet cSSV token address"
    ),
    Staking: getRequiredAddress(
      [
        {
          key: "VITE_MAINNET_STAKING_ADDRESS",
          value: import.meta.env.VITE_MAINNET_STAKING_ADDRESS
        },
        {
          key: "MAINNET_STAKING_ADDRESS",
          value: import.meta.env.MAINNET_STAKING_ADDRESS
        }
      ],
      "Mainnet staking contract address"
    ),
    Views: getRequiredAddress(
      [
        {
          key: "VITE_MAINNET_VIEWS_ADDRESS",
          value: import.meta.env.VITE_MAINNET_VIEWS_ADDRESS
        },
        {
          key: "MAINNET_VIEWS_ADDRESS",
          value: import.meta.env.MAINNET_VIEWS_ADDRESS
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
  faucetUrl: null,
  dvtUrl: getRequiredUrl(
    [
      {
        key: "VITE_MAINNET_DVT_APP_URL",
        value: import.meta.env.VITE_MAINNET_DVT_APP_URL
      },
      { key: "MAINNET_DVT_APP_URL", value: import.meta.env.MAINNET_DVT_APP_URL }
    ],
    "Mainnet DVT URL"
  )
} as const;
