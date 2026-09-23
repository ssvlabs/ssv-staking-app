import SafeAppsSDK, { TransactionStatus } from "@safe-global/safe-apps-sdk";
import type { Hash } from "viem";

const sdk = new SafeAppsSDK();

const POLLING_INTERVAL = 5000;
const MAX_CONSECUTIVE_ERRORS = 5;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForSafeTransaction = async (
  safeTxHash: Hash
): Promise<Hash> => {
  let failedAttempts = 0;

  for (;;) {
    // Tolerate a few errors: the gateway may not have indexed the tx yet
    const details = await sdk.txs.getBySafeTxHash(safeTxHash).catch((error) => {
      failedAttempts += 1;
      if (failedAttempts >= MAX_CONSECUTIVE_ERRORS) throw error;
      return undefined;
    });

    if (details) {
      failedAttempts = 0;

      if (details.txStatus === TransactionStatus.CANCELLED) {
        throw new Error("Safe transaction was cancelled");
      }
      if (details.txStatus === TransactionStatus.FAILED) {
        throw new Error("Safe transaction failed");
      }
      if (details.txHash) {
        return details.txHash as Hash;
      }
    }

    await wait(POLLING_INTERVAL);
  }
};
