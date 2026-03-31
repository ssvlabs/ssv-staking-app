import {
  useRegisterOperator,
  useSyncFees,
} from "@/lib/contract-interactions/hooks/setter";
import { tx } from "@/lib/machines/transaction-machine";
import { useTransactionModal } from "@/lib/signals/modal";

export const Playground = () => {
  const syncFees1 = useSyncFees();
  const syncFees2 = useSyncFees();

  const handleRun = () => {
    useTransactionModal.state.open({
      transactions: [
        tx({
          write: syncFees1.write,
          label: ({ status }) => (
            <span>
              Sync Fees #1 {status === "initiated" && "⏳"}
              {status === "confirmed" && "📝"}
              {status === "mined" && "✅"}
              {status === "error" && "❌"}
            </span>
          ),
          params: {
            options: {
              onInitiated: () => {
                alert("Sync Fees #1 initiated");
                return console.log("Sync Fees #1 initiated");
              },
              onConfirmed: () => {
                alert("Sync Fees #1 confirmed");
                return console.log("Sync Fees #1 confirmed");
              },
              onMined: () => console.log("Sync Fees #1 mined"),
              onError: () => {
                alert("Sync Fees #1 error");
                return console.log("Sync Fees #1 error");
              },
            },
          },
        }),
        tx({
          write: syncFees2.write,
          label: "Sync Fees #2",
          params: {
            options: {
              onConfirmed: () => console.log("Sync Fees #2 confirmed"),
              onMined: () => console.log("Sync Fees #2 mined"),
              onError: () => console.log("Sync Fees #2 error"),
            },
          },
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
          Opens the batch transaction modal with <code>syncFees</code> twice.
        </p>
      </div>

      <button
        onClick={handleRun}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Run Batch
      </button>
    </div>
  );
};
