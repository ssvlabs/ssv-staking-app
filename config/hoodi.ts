import { hoodi } from "viem/chains";
import { createEnvAssertions } from "@/config/env-assertions";

const { getRequiredUrl, getRequiredAddress } = createEnvAssertions("hoodi");

const explorerUrl = hoodi.blockExplorers.default.url;
const normalizedExplorerUrl = explorerUrl.endsWith("/")
  ? explorerUrl.slice(0, -1)
  : explorerUrl;

export const HOODI_CONFIG = {
  chainName: hoodi.name,
  rpcUrl: getRequiredUrl(
    [
      {
        key: "NEXT_PUBLIC_HOODI_RPC_URL",
        value: process.env.NEXT_PUBLIC_HOODI_RPC_URL
      },
      { key: "HOODI_RPC_URL", value: process.env.HOODI_RPC_URL }
    ],
    "Hoodi RPC URL"
  ),
  ssvApiBaseUrl: getRequiredUrl(
    [
      {
        key: "NEXT_PUBLIC_HOODI_SSV_API",
        value: process.env.NEXT_PUBLIC_HOODI_SSV_API
      },
      {
        key: "HOODI_SSV_API",
        value: process.env.HOODI_SSV_API
      }
    ],
    "Hoodi SSV API URL"
  ).replace(/\/+$/, ""),
  contracts: {
    SSVToken: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_HOODI_SSV_TOKEN_ADDRESS",
          value: process.env.NEXT_PUBLIC_HOODI_SSV_TOKEN_ADDRESS
        },
        {
          key: "HOODI_SSV_TOKEN_ADDRESS",
          value: process.env.HOODI_SSV_TOKEN_ADDRESS
        }
      ],
      "Hoodi SSV token address"
    ),
    cSSVToken: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_HOODI_CSSV_TOKEN_ADDRESS",
          value: process.env.NEXT_PUBLIC_HOODI_CSSV_TOKEN_ADDRESS
        },
        {
          key: "HOODI_CSSV_TOKEN_ADDRESS",
          value: process.env.HOODI_CSSV_TOKEN_ADDRESS
        }
      ],
      "Hoodi cSSV token address"
    ),
    Staking: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_HOODI_STAKING_ADDRESS",
          value: process.env.NEXT_PUBLIC_HOODI_STAKING_ADDRESS
        },
        {
          key: "HOODI_STAKING_ADDRESS",
          value: process.env.HOODI_STAKING_ADDRESS
        }
      ],
      "Hoodi staking contract address"
    ),
    Views: getRequiredAddress(
      [
        {
          key: "NEXT_PUBLIC_HOODI_VIEWS_ADDRESS",
          value: process.env.NEXT_PUBLIC_HOODI_VIEWS_ADDRESS
        },
        {
          key: "HOODI_VIEWS_ADDRESS",
          value: process.env.HOODI_VIEWS_ADDRESS
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
        key: "NEXT_PUBLIC_HOODI_FAUCET_URL",
        value: process.env.NEXT_PUBLIC_HOODI_FAUCET_URL
      },
      { key: "HOODI_FAUCET_URL", value: process.env.HOODI_FAUCET_URL }
    ],
    "Hoodi faucet URL"
  )
} as const;
