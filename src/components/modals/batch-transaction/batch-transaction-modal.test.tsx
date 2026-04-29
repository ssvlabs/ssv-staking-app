import type { FC } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Status } from "@/lib/machines/transaction-machine";
import { STAKING_COPY } from "@/lib/staking/copy";
import { useTransactionModal } from "@/lib/signals/modal";

import { BatchTransactionModal } from "./batch-transaction-modal";

vi.mock("@/hooks/use-account", () => ({
  useAccount: vi.fn(),
}));

vi.mock("@/hooks/use-network-config", () => ({
  useNetworkConfig: vi.fn(() => ({
    blockExplorer: { txBaseUrl: "https://explorer.test/tx/" },
  })),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { useAccount } from "@/hooks/use-account";

/** No callbacks → current step stays in flight until another write completes it. */
const mockWrite = vi.fn(() => {});

const SecondStepLabel: FC<{ status: Status }> = ({ status }) => {
  if (status === "idle") return <>Stake — queued</>;
  if (status === "initiated") return <>Stake — in progress</>;
  if (status === "confirmed") return <>Stake — confirmed</>;
  if (status === "mined") return <>Stake — done</>;
  return <>Stake — error</>;
};

/** Macrotask so the UI can paint `idle` on step 2 before step 1 completes. */
const firstWriteCompletes = vi.fn(
  (params: {
    options?: {
      onConfirmed?: (h: `0x${string}`) => void;
      onMined?: () => void;
    };
  }) => {
    setTimeout(() => {
      params?.options?.onConfirmed?.(
        "0x1111111111111111111111111111111111111111111111111111111111111111"
      );
      params?.options?.onMined?.();
    }, 0);
  }
);

/** Staged writer: one tick fires onConfirmed, the next fires onMined. */
const stagedWriteCompletes = vi.fn(
  (params: {
    options?: {
      onConfirmed?: (h: `0x${string}`) => void;
      onMined?: () => void;
    };
  }) => {
    setTimeout(() => {
      params?.options?.onConfirmed?.(
        "0x2222222222222222222222222222222222222222222222222222222222222222"
      );
      setTimeout(() => {
        params?.options?.onMined?.();
      }, 0);
    }, 0);
  }
);

describe("BatchTransactionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!document.getElementById("root")) {
      const root = document.createElement("div");
      root.id = "root";
      document.body.appendChild(root);
    }
    useTransactionModal.state.close(true);
    vi.mocked(useAccount).mockReturnValue({
      isContract: false,
    } as ReturnType<typeof useAccount>);
  });

  afterEach(() => {
    cleanup();
    useTransactionModal.state.close(true);
  });

  it("multisig wallet: shows Transaction Initiated copy, not batch step UI", async () => {
    vi.mocked(useAccount).mockReturnValue({
      isContract: true,
    } as ReturnType<typeof useAccount>);

    useTransactionModal.state.open({
      transactions: [
        { write: mockWrite, label: "Approve SSV" },
        { write: mockWrite, label: "Confirm stake" },
      ],
      header: "Stake SSV",
    });

    render(<BatchTransactionModal />);

    expect(
      await screen.findByRole("heading", {
        name: STAKING_COPY.modals.multisig,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(STAKING_COPY.multisig.pending)).toBeInTheDocument();
    expect(
      screen.getByText(STAKING_COPY.multisig.returnWhenApproved)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: STAKING_COPY.actions.close })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Stake SSV" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Approve SSV")).not.toBeInTheDocument();
    expect(screen.queryByText("Waiting...")).not.toBeInTheDocument();
  });

  it("multisig wallet: close button dismisses modal while tx still in flight (no machine close)", async () => {
    vi.mocked(useAccount).mockReturnValue({
      isContract: true,
    } as ReturnType<typeof useAccount>);

    useTransactionModal.state.open({
      transactions: [{ write: mockWrite, label: "Approve SSV" }],
      header: "Stake SSV",
    });

    render(<BatchTransactionModal />);

    expect(useTransactionModal.state.isOpen).toBe(true);

    const closeBtn = await screen.findByRole("button", {
      name: STAKING_COPY.actions.close,
    });
    closeBtn.click();

    expect(useTransactionModal.state.isOpen).toBe(false);
  });

  it("regular wallet: string label on step 1; component label on step 2 updates with status", () => {
    vi.useFakeTimers();
    try {
      useTransactionModal.state.open({
        transactions: [
          { write: firstWriteCompletes, label: "Approve SSV" },
          { write: mockWrite, label: SecondStepLabel },
        ],
        header: "Stake SSV",
      });

      render(<BatchTransactionModal />);

      expect(
        screen.getByRole("heading", { name: "Stake SSV" })
      ).toBeInTheDocument();

      expect(screen.getByText("Approve SSV")).toBeInTheDocument();
      expect(screen.getByText("Stake — queued")).toBeInTheDocument();

      act(() => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByText("Stake — in progress")).toBeInTheDocument();
      expect(screen.queryByText("Stake — queued")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("regular wallet: object label renders the right text per status (default -> confirmed -> mined)", () => {
    vi.useFakeTimers();
    try {
      useTransactionModal.state.open({
        transactions: [
          {
            write: stagedWriteCompletes,
            label: {
              default: "Claim 1 ETH",
              confirmed: "Claiming 1 ETH",
              mined: "Claimed 1 ETH",
            },
          },
        ],
        header: "Claim ETH Rewards",
      });

      render(<BatchTransactionModal />);

      expect(screen.getByText("Claim 1 ETH")).toBeInTheDocument();
      expect(screen.queryByText("Claiming 1 ETH")).not.toBeInTheDocument();
      expect(screen.queryByText("Claimed 1 ETH")).not.toBeInTheDocument();

      act(() => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByText("Claiming 1 ETH")).toBeInTheDocument();
      expect(screen.queryByText("Claim 1 ETH")).not.toBeInTheDocument();
      expect(screen.queryByText("Claimed 1 ETH")).not.toBeInTheDocument();

      act(() => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByText("Claimed 1 ETH")).toBeInTheDocument();
      expect(screen.queryByText("Claim 1 ETH")).not.toBeInTheDocument();
      expect(screen.queryByText("Claiming 1 ETH")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("regular wallet: object label falls back to `default` when current status has no entry", () => {
    useTransactionModal.state.open({
      transactions: [
        {
          write: mockWrite,
          label: {
            default: "Claim 1 ETH",
            mined: "Claimed 1 ETH",
          },
        },
      ],
      header: "Claim ETH Rewards",
    });

    render(<BatchTransactionModal />);

    expect(screen.getByText("Claim 1 ETH")).toBeInTheDocument();
    expect(screen.queryByText("Claimed 1 ETH")).not.toBeInTheDocument();
  });
});
