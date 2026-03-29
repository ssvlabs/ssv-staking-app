import { hoodi } from "viem/chains";

import { createEnvAssertions } from "@/config/env-assertions";

const { getRequiredUrl, getRequiredAddress, getUrlWithFallback } =
  createEnvAssertions("hoodi");

const explorerUrl = hoodi.blockExplorers.default.url;
const normalizedExplorerUrl = explorerUrl.endsWith("/")
  ? explorerUrl.slice(0, -1)
  : explorerUrl;

export const HOODI_CONFIG = {
  chainName: hoodi.name,
  rpcUrl: getUrlWithFallback(
    [
      {
        key: "VITE_HOODI_RPC_URL",
        value: import.meta.env.VITE_HOODI_RPC_URL
      },
      { key: "HOODI_RPC_URL", value: import.meta.env.HOODI_RPC_URL }
    ],
    "Hoodi RPC URL",
    hoodi.rpcUrls.default.http[0] ?? ""
  ),
  ssvApiBaseUrl: getRequiredUrl(
    [
      {
        key: "VITE_HOODI_SSV_API",
        value: import.meta.env.VITE_HOODI_SSV_API
      },
      {
        key: "HOODI_SSV_API",
        value: import.meta.env.HOODI_SSV_API
      }
    ],
    "Hoodi SSV API URL"
  ).replace(/\/+$/, ""),
  contracts: {
    SSVToken: getRequiredAddress(
      [
        {
          key: "VITE_HOODI_SSV_TOKEN_ADDRESS",
          value: import.meta.env.VITE_HOODI_SSV_TOKEN_ADDRESS
        },
        {
          key: "HOODI_SSV_TOKEN_ADDRESS",
          value: import.meta.env.HOODI_SSV_TOKEN_ADDRESS
        }
      ],
      "Hoodi SSV token address"
    ),
    cSSVToken: getRequiredAddress(
      [
        {
          key: "VITE_HOODI_CSSV_TOKEN_ADDRESS",
          value: import.meta.env.VITE_HOODI_CSSV_TOKEN_ADDRESS
        },
        {
          key: "HOODI_CSSV_TOKEN_ADDRESS",
          value: import.meta.env.HOODI_CSSV_TOKEN_ADDRESS
        }
      ],
      "Hoodi cSSV token address"
    ),
    Staking: getRequiredAddress(
      [
        {
          key: "VITE_HOODI_STAKING_ADDRESS",
          value: import.meta.env.VITE_HOODI_STAKING_ADDRESS
        },
        {
          key: "HOODI_STAKING_ADDRESS",
          value: import.meta.env.HOODI_STAKING_ADDRESS
        }
      ],
      "Hoodi staking contract address"
    ),
    Views: getRequiredAddress(
      [
        {
          key: "VITE_HOODI_VIEWS_ADDRESS",
          value: import.meta.env.VITE_HOODI_VIEWS_ADDRESS
        },
        {
          key: "HOODI_VIEWS_ADDRESS",
          value: import.meta.env.HOODI_VIEWS_ADDRESS
        }
      ],
      "Hoodi views contract address"
    )
  },
  blockExplorer: {
    name: hoodi.blockExplorers.default.name,
    url: normalizedExplorerUrl,
    txBaseUrl: `${normalizedExplorerUrl}/tx/`,
    addressBaseUrl: `${normalizedExplorerUrl}/address/`
  },
  faucetUrl: getRequiredUrl(
    [
      {
        key: "VITE_HOODI_FAUCET_URL",
        value: import.meta.env.VITE_HOODI_FAUCET_URL
      },
      { key: "HOODI_FAUCET_URL", value: import.meta.env.HOODI_FAUCET_URL }
    ],
    "Hoodi faucet URL"
  ),
  dvtUrl: getRequiredUrl(
    [
      {
        key: "VITE_HOODI_DVT_APP_URL",
        value: import.meta.env.VITE_HOODI_DVT_APP_URL
      },
      { key: "HOODI_DVT_APP_URL", value: import.meta.env.HOODI_DVT_APP_URL }
    ],
    "Hoodi DVT URL"
  )
} as const;
