import type { FC, ReactNode } from "react";
import type { Hash } from "viem";
import { setup, fromCallback, assign } from "xstate";
import type { WriteHookResult } from "@/lib/contract-interactions/core/create-contract-hooks";
import { toast } from "sonner";
import { getErrorMessage } from "../utils/wagmi";

export type Status = "idle" | "initiated" | "confirmed" | "mined" | "error";

export type TransactionStep = {
  write: WriteHookResult<any>["write"];
  params: Parameters<WriteHookResult<any>["write"]>[0];
  label: string | FC<{ status: Status }>;
};

export type TransactionState = TransactionStep & {
  status: Status;
  hash?: Hash;
};

export function tx<T extends (...args: any) => any>(step: {
  write: T;
  params: Parameters<T>[0];
  label: string | FC<{ status: Status }>;
}) {
  return step;
}

type WriterInput = {
  step: TransactionState;
};

const writerActor = fromCallback<
  | { type: "TX_CONFIRMED"; hash: Hash }
  | { type: "TX_MINED" }
  | { type: "TX_ERROR"; error: unknown },
  WriterInput
>(({ sendBack, input }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (input.step.write as any)({
    ...(input.step.params as any),
    options: {
      ...input.step.params?.options,
      onConfirmed: (hash: Hash) => {
        sendBack({ type: "TX_CONFIRMED", hash });
      },
      onMined: () => {
        sendBack({ type: "TX_MINED" });
      },
      onError: (error: unknown) => {
        sendBack({ type: "TX_ERROR", error });
      },
    },
  });
  return () => {};
});

const updateTx = (
  transactions: TransactionState[],
  i: number,
  patch: Partial<Pick<TransactionState, "status" | "hash">>
): TransactionState[] => {
  const next = [...transactions];
  next[i] = { ...next[i], ...patch };
  return next;
};

export const machine = setup({
  types: {
    context: {} as {
      transactions: TransactionState[];
      i: number;
      header: ReactNode;
      onDone?: () => void;
    },
    events: {} as
      | { type: "retry" | "restart" }
      | {
          type: "write";
          transactions: TransactionStep[];
          header: ReactNode;
          onDone?: () => void;
        }
      | { type: "cancel" }
      | { type: "TX_CONFIRMED"; hash: Hash }
      | { type: "TX_MINED" }
      | { type: "TX_ERROR"; error: unknown },
  },
  actions: {
    increment: assign({
      i: ({ context }) => context.i + 1,
    }),
    setInitiated: assign({
      transactions: ({ context }) =>
        updateTx(context.transactions, context.i, { status: "initiated" }),
    }),
    setConfirmed: assign({
      transactions: ({ context, event }) =>
        updateTx(context.transactions, context.i, {
          status: "confirmed",
          hash: "hash" in event ? (event.hash as Hash) : undefined,
        }),
    }),
    setMined: assign({
      transactions: ({ context }) =>
        updateTx(context.transactions, context.i, { status: "mined" }),
    }),
    setError: assign({
      transactions: ({ context }) =>
        updateTx(context.transactions, context.i, { status: "error" }),
    }),
  },
  actors: {
    writer: writerActor,
  },
  guards: {
    isFinished: ({ context }) => context.i === context.transactions.length - 1,
  },
}).createMachine({
  context: {
    transactions: [],
    i: 0,
    header: null,
  },
  id: "BatchTransactionMachine",
  initial: "idle",
  states: {
    idle: {
      on: {
        write: {
          target: "writing",
          guard: ({ event }) => {
            console.assert(
              event.transactions.length > 0,
              "You've tried to write with no transactions"
            );
            return event.transactions.length > 0;
          },
          actions: assign(({ event }) => ({
            transactions: event.transactions.map(
              (tx): TransactionState => ({ ...tx, status: "idle" })
            ),
            header: event.header,
            onDone: event.onDone,
            i: 0,
          })),
        },
      },
    },
    writing: {
      entry: "setInitiated",
      invoke: {
        src: "writer",
        input: ({ context }) => ({
          step: context.transactions[context.i],
        }),
      },
      on: {
        TX_CONFIRMED: {
          actions: "setConfirmed",
        },
        TX_MINED: [
          {
            target: "finished",
            guard: "isFinished",
            actions: "setMined",
          },
          {
            target: "writing",
            reenter: true,
            actions: ["setMined", "increment"],
          },
        ],
        TX_ERROR: {
          target: "failed",
          actions: "setError",
        },
      },
    },
    finished: {
      after: {
        1000: {
          target: "idle",
          actions: ({ context }) => {
            context.onDone?.();
          },
        },
      },
    },
    failed: {
      on: {
        retry: "writing",
        cancel: "idle",
      },
      entry: [
        ({ event }) => {
          if ("error" in event) {
            toast.error("Transaction failed", {
              description: (
                <span className="whitespace-pre-wrap">
                  {getErrorMessage(event.error as Error)}
                </span>
              ),
            });
          }
        },
      ],
    },
  },
});
