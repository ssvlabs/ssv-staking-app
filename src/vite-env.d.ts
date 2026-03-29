/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SSV_NETWORKS: string;
  readonly VITE_HOODI_RPC_URL?: string;
  readonly VITE_HOODI_SSV_API?: string;
  readonly VITE_HOODI_SSV_TOKEN_ADDRESS?: string;
  readonly VITE_HOODI_CSSV_TOKEN_ADDRESS?: string;
  readonly VITE_HOODI_STAKING_ADDRESS?: string;
  readonly VITE_HOODI_VIEWS_ADDRESS?: string;
  readonly VITE_HOODI_FAUCET_URL?: string;
  readonly VITE_HOODI_DVT_APP_URL?: string;
  readonly VITE_MAINNET_RPC_URL?: string;
  readonly VITE_MAINNET_SSV_API?: string;
  readonly VITE_MAINNET_SSV_TOKEN_ADDRESS?: string;
  readonly VITE_MAINNET_CSSV_TOKEN_ADDRESS?: string;
  readonly VITE_MAINNET_STAKING_ADDRESS?: string;
  readonly VITE_MAINNET_VIEWS_ADDRESS?: string;
  readonly VITE_MAINNET_DVT_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
