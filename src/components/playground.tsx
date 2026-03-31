import { useMachine } from "@xstate/react";
import { useSyncFees } from "@/lib/contract-interactions/hooks/setter";
import {
  machine,
  tx,
  type Status,
  type TransactionState,
} from "@/lib/machines/transaction-machine";

const statusColors: Record<Status, string> = {
  idle: "bg-gray-200 text-gray-700",
  initiated: "bg-yellow-200 text-yellow-800",
  confirmed: "bg-blue-200 text-blue-800",
  mined: "bg-green-200 text-green-800",
  error: "bg-red-200 text-red-800",
};

function TxRow({ tx }: { tx: TransactionState }) {
  const Label = tx.label;
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <span className="font-medium">
        {typeof Label === "string" ? Label : <Label status={tx.status} />}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            statusColors[tx.status]
          }`}
        >
          {tx.status}
        </span>
        {tx.hash && (
          <code className="text-xs text-gray-500">
            {tx.hash.slice(0, 10)}...
          </code>
        )}
      </div>
    </div>
  );
}

export const Playground = () => {
  const syncFees1 = useSyncFees();
  const syncFees2 = useSyncFees();

  const [snapshot, send] = useMachine(machine);

  const { transactions, i } = snapshot.context;
  const state = snapshot.value as string;

  const handleRun = () => {
    send({
      type: "write",
      transactions: [
        tx({
          write: syncFees1.write,
          params: {},
          label: ({ status }) => (
            <span>
              Sync Fees #1 {status === "initiated" && "⏳"}
              {status === "confirmed" && "📝"}
              {status === "mined" && "✅"}
              {status === "error" && "❌"}
            </span>
          ),
        }),
        tx({
          write: syncFees2.write,
          params: {},
          label: "Sync Fees #2",
        }),
      ],
      header: "Batch Sync Fees",
      onDone: () => console.log("All done!"),
    });
  };

  return (
    <div className="mx-auto mt-12 max-w-lg space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Transaction Machine Playground</h2>
        <p className="text-sm text-gray-500">
          Sends <code>syncFees</code> twice using the batch machine.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Machine: <strong>{state}</strong>
        </span>
        {transactions.length > 0 && (
          <span className="text-sm text-gray-600">
            Index: <strong>{i}</strong>
          </span>
        )}
      </div>

      <div className="space-y-2">
        {transactions.map((t, idx) => (
          <TxRow key={idx} tx={t} />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={state === "writing"}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Run Batch
        </button>

        {state === "failed" && (
          <>
            <button
              onClick={() => send({ type: "retry" })}
              className="rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              Retry
            </button>
            <button
              onClick={() => send({ type: "cancel" })}
              className="rounded bg-gray-400 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};
