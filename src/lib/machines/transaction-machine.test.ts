import { describe, it, expect, vi, beforeEach } from "vitest";
import { createActor, waitFor } from "xstate";
import { machine, type TransactionStep } from "./transaction-machine";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const mockWriter = (hash = "0xmockhash", delay = 0): TransactionStep["write"] =>
  vi.fn((params: any) => {
    setTimeout(() => {
      params?.options?.onConfirmed?.(hash);
      setTimeout(() => {
        params?.options?.onMined?.();
      }, delay);
    }, delay);
  }) as any;

const mockFailingWriter = (
  error = new Error("tx reverted"),
  delay = 0
): TransactionStep["write"] =>
  vi.fn((params: any) => {
    setTimeout(() => {
      params?.options?.onError?.(error);
    }, delay);
  }) as any;

const step = (
  write: TransactionStep["write"],
  label: string = "Test Step"
): TransactionStep => ({
  write,
  params: { args: { amount: 1n } } as any,
  label,
});

const statuses = (actor: ReturnType<typeof createActor<typeof machine>>) =>
  actor.getSnapshot().context.transactions.map((tx) => tx.status);

describe("BatchTransactionMachine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle", () => {
    const actor = createActor(machine);
    actor.start();
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("stays idle when sending write with empty transactions", () => {
    const actor = createActor(machine);
    actor.start();
    actor.send({ type: "write", transactions: [], header: null });
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("transitions to writing and sets status to initiated", () => {
    const write = mockWriter("0xhash", 500);
    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write)],
      header: "Test",
    });

    expect(actor.getSnapshot().value).toBe("writing");
    expect(statuses(actor)).toEqual(["initiated"]);

    actor.stop();
  });

  it("single transaction: initiated -> confirmed -> mined -> finished, close -> idle", async () => {
    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(mockWriter("0xaaa", 5))],
      header: "Test",
    });

    expect(statuses(actor)).toEqual(["initiated"]);

    await waitFor(actor, (snap) => snap.value === "finished");
    expect(statuses(actor)).toEqual(["mined"]);

    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("sets confirmed status with hash on TX_CONFIRMED", async () => {
    const hash = "0xdeadbeef";
    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(mockWriter(hash, 50))],
      header: "Test",
    });

    await waitFor(
      actor,
      (snap) => snap.context.transactions[0]?.status === "confirmed"
    );

    const tx = actor.getSnapshot().context.transactions[0];
    expect(tx.status).toBe("confirmed");
    expect(tx.hash).toBe(hash);

    actor.stop();
  });

  it("calls write with the provided params (args, value)", async () => {
    const write = mockWriter("0xhash", 0);
    const params = { args: { amount: 42n }, value: 100n } as any;

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [{ write, params, label: "Check params" }],
      header: "Test",
    });

    await waitFor(actor, (snap) => snap.value === "finished");

    expect(write).toHaveBeenCalledWith(
      expect.objectContaining({ args: { amount: 42n }, value: 100n })
    );
    actor.stop();
  });

  it("batch: processes multiple transactions sequentially", async () => {
    const write1 = mockWriter("0x1", 5);
    const write2 = mockWriter("0x2", 5);
    const write3 = mockWriter("0x3", 5);

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [
        step(write1, "Approve"),
        step(write2, "Stake"),
        step(write3, "Confirm"),
      ],
      header: "Batch",
    });

    await waitFor(actor, (snap) => snap.value === "finished");

    const ctx = actor.getSnapshot().context;
    expect(statuses(actor)).toEqual(["mined", "mined", "mined"]);
    expect(ctx.i).toBe(2);
    expect(write1).toHaveBeenCalledTimes(1);
    expect(write2).toHaveBeenCalledTimes(1);
    expect(write3).toHaveBeenCalledTimes(1);

    actor.stop();
  });

  it("error: transitions to failed and sets status to error", async () => {
    const write = mockFailingWriter();
    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write)],
      header: "Test",
    });

    await waitFor(actor, (snap) => snap.value === "failed");
    expect(statuses(actor)).toEqual(["error"]);

    actor.stop();
  });

  it("error mid-batch: earlier txs are mined, failing tx is error", async () => {
    const write1 = mockWriter("0x1", 5);
    const write2 = mockFailingWriter();

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write1, "Approve"), step(write2, "Stake")],
      header: "Batch",
    });

    await waitFor(actor, (snap) => snap.value === "failed");
    expect(statuses(actor)).toEqual(["mined", "error"]);

    actor.stop();
  });

  it("retry: resumes from the failed transaction", async () => {
    let attempts = 0;
    const flakyWrite: TransactionStep["write"] = vi.fn((params: any) => {
      attempts++;
      if (attempts === 1) {
        setTimeout(() => params?.options?.onError?.(new Error("network")), 0);
      } else {
        setTimeout(() => {
          params?.options?.onConfirmed?.("0xretry");
          setTimeout(() => params?.options?.onMined?.(), 5);
        }, 0);
      }
    }) as any;

    const write1 = mockWriter("0x1", 5);

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write1, "Approve"), step(flakyWrite, "Stake")],
      header: "Batch",
    });

    await waitFor(actor, (snap) => snap.value === "failed");
    expect(statuses(actor)).toEqual(["mined", "error"]);

    actor.send({ type: "retry" });

    await waitFor(actor, (snap) => snap.value === "finished");
    expect(statuses(actor)).toEqual(["mined", "mined"]);
    expect(flakyWrite).toHaveBeenCalledTimes(2);

    actor.stop();
  });

  it("close: returns to idle from failed", async () => {
    const write = mockFailingWriter();
    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write)],
      header: "Test",
    });

    await waitFor(actor, (snap) => snap.value === "failed");

    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toBe("idle");

    actor.stop();
  });

  it("onDone callback fires immediately on entering finished", async () => {
    const write = mockWriter("0xhash", 5);
    const onDone = vi.fn();

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(write)],
      header: "Test",
      onDone,
    });

    await waitFor(actor, (snap) => snap.value === "finished");
    expect(onDone).toHaveBeenCalledTimes(1);

    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toBe("idle");
    actor.stop();
  });

  it("label can be a component (FC<{ status }>)", async () => {
    const write = mockWriter("0xhash", 5);
    const LabelComponent: TransactionStep["label"] = ({ status }) => null;

    const txStep: TransactionStep = {
      write,
      params: { args: { amount: 1n } } as any,
      label: LabelComponent,
    };

    const actor = createActor(machine);
    actor.start();

    actor.send({
      type: "write",
      transactions: [txStep],
      header: "Test",
    });

    await waitFor(actor, (snap) => snap.value === "finished");

    const tx = actor.getSnapshot().context.transactions[0];
    expect(typeof tx.label).toBe("function");
    expect(tx.status).toBe("mined");

    actor.stop();
  });

  it("full lifecycle: idle -> initiated -> confirmed -> mined -> finished", async () => {
    const hash = "0xlifecycle";
    const collectedStatuses: string[] = [];

    const actor = createActor(machine);
    actor.subscribe((snap) => {
      const txs = snap.context.transactions;
      if (txs.length > 0 && !collectedStatuses.includes(txs[0].status)) {
        collectedStatuses.push(txs[0].status);
      }
    });
    actor.start();

    actor.send({
      type: "write",
      transactions: [step(mockWriter(hash, 20))],
      header: "Lifecycle",
    });

    await waitFor(actor, (snap) => snap.value === "finished");

    expect(collectedStatuses).toEqual(["initiated", "confirmed", "mined"]);
    actor.stop();
  });
});
