import type { FC, ComponentPropsWithoutRef } from "react";
import { useMachine } from "@xstate/react";
import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccount } from "@/hooks/use-account";
import {
  machine,
  type TransactionStep,
} from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";
import { STAKING_COPY } from "@/lib/staking/copy";
import { AddTokenToWalletButton } from "./add-token-to-wallet-button";
import { TransactionCard } from "./transaction-card";

const BatchTransactionModalContent: FC = () => {
  const { isContract } = useAccount();
  const modal = useTransactionModal();

  const transactions = useMemo(
    () => modal.meta.transactions ?? [],
    [modal.meta.transactions]
  ) as TransactionStep[];

  const [snapshot, send] = useMachine(machine);

  if (snapshot.can({ type: "write", transactions, header: null })) {
    send({
      type: "write",
      transactions,
      header: modal.meta.header ?? "",
      onDone: modal.meta.onDone,
    });
  }

  const handleClose = () => {
    if (snapshot.can({ type: "close" })) {
      send({ type: "close" });
      useTransactionModal.state.close(true);
    }
  };

  return (
    <Dialog isOpen={modal.isOpen}>
      <DialogContent className="w-[560px] max-w-[calc(100%-32px)] gap-5 p-8">
        {isContract ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-bold leading-[28px] text-ink-900">
                {STAKING_COPY.modals.multisig}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Multi-sig wallet transaction initiated
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-[14px] text-ink-500">
              <p>{STAKING_COPY.multisig.pending}</p>
              <p>{STAKING_COPY.multisig.returnWhenApproved}</p>
            </div>
            {snapshot.matches("failed") ? (
              <div className="flex w-full gap-2 pt-4">
                <button
                  className="h-[52px] flex-1 rounded-[12px] bg-brand-600 text-[14px] font-semibold text-white"
                  onClick={() => send({ type: "retry" })}
                  type="button"
                >
                  Try again
                </button>
                <button
                  className="h-[52px] flex-1 rounded-[12px] bg-surface-100 text-[14px] font-semibold text-ink-700"
                  onClick={handleClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex w-full pt-4">
                <button
                  className="h-[52px] w-full rounded-[12px] bg-brand-50 text-[14px] font-semibold text-brand-600"
                  onClick={handleClose}
                  type="button"
                >
                  {STAKING_COPY.actions.close}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-bold leading-[28px] text-ink-900">
                {modal.meta.header || snapshot.context.header}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Transaction progress
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full flex-col gap-2">
              {snapshot.context.transactions.map((tx, i) => (
                <TransactionCard
                  key={i}
                  tx={tx}
                  onRetry={() => send({ type: "retry" })}
                />
              ))}
            </div>

            {snapshot.matches("finished") && (
              <>
                {modal.meta.addTokenToWallet && (
                  <AddTokenToWalletButton
                    className="mx-auto"
                    tokenName={modal.meta.addTokenToWallet.tokenName}
                    tokenAddress={modal.meta.addTokenToWallet.tokenAddress}
                    decimals={modal.meta.addTokenToWallet.decimals}
                  />
                )}
                <div className="flex w-full">
                  <button
                    className="h-[52px] w-full rounded-[12px] bg-brand-50 text-[14px] font-semibold text-brand-600"
                    onClick={handleClose}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {snapshot.matches("failed") && (
              <div className="flex w-full gap-2 pt-4">
                <button
                  className="h-[52px] flex-1 rounded-[12px] bg-surface-100 text-[14px] font-semibold text-ink-700"
                  onClick={handleClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

type BatchTransactionModalFC = FC<ComponentPropsWithoutRef<"div">>;

export const BatchTransactionModal: BatchTransactionModalFC = ({
  className,
  ...props
}) => {
  const modal = useTransactionModal();
  return <BatchTransactionModalContent key={modal.meta._id} />;
};

BatchTransactionModal.displayName = "BatchTransactionModal";
