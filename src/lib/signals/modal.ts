import { proxy, useSnapshot } from "valtio";

interface ModalProxy<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  isOpen: boolean;
  onOpenChange(open: boolean): void;
  open(meta?: T): void;
  close(clear?: boolean): void;
  meta: Partial<T>;
}

type Effects<T extends Record<string, unknown>> = {
  meta?: T & { _id?: string };
  isOpen?: boolean;
};

const createModalSignal = <T extends Record<string, unknown>>(
  defaults?: Effects<T>
) => {
  const state = proxy<ModalProxy<T & { _id?: string }>>({
    isOpen: defaults?.isOpen ?? false,
    onOpenChange: (open) => {
      state.isOpen = open;
    },
    open: (meta) => {
      if (meta) state.meta = meta;
      state.meta._id = crypto.randomUUID() as unknown as (T & {
        _id?: string;
      })["_id"];
      state.isOpen = true;
    },
    close: (clear) => {
      if (clear) state.meta = {};
      state.isOpen = false;
    },
    meta: defaults?.meta ?? {},
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hook = () => useSnapshot(state);
  hook.state = state;
  return hook;
};

import type { TransactionStep } from "@/lib/machines/transaction-machine";

export const useTransactionModal = createModalSignal<{
  transactions: TransactionStep[];
  header: string;
  onDone?: () => void;
  addTokenToWallet?: {
    tokenName: string;
    tokenAddress: `0x${string}`;
    decimals: number;
  };
}>();
