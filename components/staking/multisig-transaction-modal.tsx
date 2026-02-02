"use client";

import { useMultisigTransactionModal } from "@/lib/multisig-modal";
import { STAKING_COPY } from "@/lib/staking/copy";
import { TxFlowFooter } from "@/components/staking/tx-flow-footer";
import { TxFlowModal } from "@/components/staking/tx-flow-modal";

export function MultisigTransactionModal() {
  const { isOpen, close } = useMultisigTransactionModal();

  return (
    <TxFlowModal
      title={STAKING_COPY.modals.multisig}
      isOpen={isOpen}
      onClose={close}
    >
      <div className="space-y-3 text-[14px] text-ink-500">
        <p>{STAKING_COPY.multisig.pending}</p>
        <p>{STAKING_COPY.multisig.returnWhenApproved}</p>
      </div>
      <TxFlowFooter onClose={close} />
    </TxFlowModal>
  );
}
