import type { FC, ReactNode } from "react";
import { toast } from "sonner";
import type { Hash } from "viem";
import { assign, fromCallback, setup } from "xstate";
import { getErrorMessage } from "../utils/wagmi";

export type Status = "idle" | "initiated" | "confirmed" | "mined" | "error";

export type TransactionStep = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  write: (...args: any[]) => any;
  params?: Record<string, unknown>;
  label: string | FC<{ status: Status }>;
};

export type TransactionState = TransactionStep & {
  status: Status;
  hash?: Hash;
};

/**
 * TypeScript helper that provides intellisense on the step parameters.
 * It returns the input as-is.
 */
export function tx<T extends (...args: any) => any>(
  step: {
    write: T;
    label: string | FC<{ status: Status }>;
  } & (undefined extends Parameters<T>[0]
    ? { params?: Parameters<T>[0] }
    : { params: Parameters<T>[0] })
) {
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
  const params = input.step.params as Record<string, any> | undefined;
  (input.step.write as any)({
    ...params,
    options: {
      ...params?.options,
      onConfirmed: (hash: Hash) => {
        params?.options?.onConfirmed?.(hash);
        sendBack({ type: "TX_CONFIRMED", hash });
      },
      onMined: () => {
        params?.options?.onMined?.();
        sendBack({ type: "TX_MINED" });
      },
      onError: (error: unknown) => {
        params?.options?.onError?.(error);
        sendBack({ type: "TX_ERROR", error });
      },
    },
  });
  return () => {};
});

const updateTransaction = (
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
      | { type: "close" }
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
        updateTransaction(context.transactions, context.i, {
          status: "initiated",
        }),
    }),
    setConfirmed: assign({
      transactions: ({ context, event }) =>
        updateTransaction(context.transactions, context.i, {
          status: "confirmed",
          hash: "hash" in event ? (event.hash as Hash) : undefined,
        }),
    }),
    setMined: assign({
      transactions: ({ context }) =>
        updateTransaction(context.transactions, context.i, { status: "mined" }),
    }),
    setError: assign({
      transactions: ({ context }) =>
        updateTransaction(context.transactions, context.i, { status: "error" }),
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
      entry: ({ context }) => {
        context.onDone?.();
      },
      on: {
        close: "idle",
      },
    },
    failed: {
      on: {
        retry: "writing",
        close: "idle",
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
