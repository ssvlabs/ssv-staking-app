import { CONFIG } from "@/lib/config";
import { STAKING_COPY } from "@/lib/staking/copy";

type AddTokenParams = {
  decimals: number;
  image: string;
  onError?: (message: string) => void;
};

type EthereumProvider = {
  request?: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

export async function addCssvToMetamask({
  decimals,
  image,
  onError
}: AddTokenParams) {
  const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
  if (!ethereum?.request) {
    onError?.(STAKING_COPY.toasts.metamaskMissing);
    return;
  }

  try {
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: CONFIG.contracts.cSSVToken,
          symbol: "cSSV",
          decimals,
          image
        }
      }
    });
  } catch (error) {
    console.error("Add cSSV error:", error);
    onError?.(STAKING_COPY.toasts.metamaskError);
  }
}
