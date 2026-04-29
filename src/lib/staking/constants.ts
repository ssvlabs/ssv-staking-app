export const ASSET_BASE = "/figma";

export const STAKING_ASSETS = {
  ssvLarge: `${ASSET_BASE}/ssv_0-2095.svg`,
  ssvMedium: `${ASSET_BASE}/ssv_0-2106.svg`,
  ssvSmall: `${ASSET_BASE}/ssv_0-2139.svg`,
  ethIcon: `${ASSET_BASE}/ethereum_0-2171.svg`,
  metamaskIcon: `${ASSET_BASE}/metamask.png`,
  calculatorIcon: `${ASSET_BASE}/calculator.svg`
} as const;

export const CLAIMABLE_DECIMALS = 18;
export const MAX_PENDING_REQUESTS = 2000;
export const MINIMAL_STAKING_AMOUNT = 1_000_000_000n;
