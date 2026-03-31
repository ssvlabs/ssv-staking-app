import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStakeFlows } from "@/lib/staking/use-stake-flows";

const writeContractAsyncMock = vi.fn();

vi.mock("canvas-confetti", () => {
  const confetti = Object.assign(vi.fn(), {
    shapeFromPath: vi.fn(() => ({}))
  });
  return { default: confetti };
});

vi.mock("@/lib/abis", () => ({
  ERC20ABI: [],
  getStakingAbiByChainId: vi.fn(() => [])
}));

vi.mock("@/lib/config", () => ({
  getNetworkConfigByChainId: vi.fn(() => ({
    contracts: {
      Staking: "0x0000000000000000000000000000000000000001",
      SSVToken: "0x0000000000000000000000000000000000000002",
      cSSVToken: "0x0000000000000000000000000000000000000003"
    }
  }))
}));

vi.mock("@/lib/multisig-modal", () => ({
  useMultisigTransactionModal: vi.fn(() => ({
    open: vi.fn(),
    close: vi.fn()
  }))
}));

vi.mock("@/hooks/use-interval", () => ({
  useInterval: vi.fn()
}));

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useWriteContract: vi.fn(),
  useWaitForTransactionReceipt: vi.fn()
}));

const wagmi = await import("wagmi");
const sonner = await import("sonner");

const useAccount = wagmi.useAccount as unknown as ReturnType<typeof vi.fn>;
const useWriteContract = wagmi.useWriteContract as unknown as ReturnType<
  typeof vi.fn
>;
const useWaitForTransactionReceipt =
  wagmi.useWaitForTransactionReceipt as unknown as ReturnType<typeof vi.fn>;
const toastError = sonner.toast.error as unknown as ReturnType<typeof vi.fn>;

const buildOptions = () => ({
  isConnected: true,
  ssvBalanceFormatted: "10",
  ssvBalanceValue: 10_000_000_000_000_000_000n,
  stakedBalanceValue: 0n,
  claimableValue: 0n,
  ssvAllowanceValue: 10_000_000_000_000_000_000n,
  cssvAllowanceValue: 0n,
  withdrawalRequests: [],
  tokenDecimals: 18,
  receiptDecimals: 18,
  multiWithdrawEnabled: true
});

describe("useStakeFlows minimum stake validation", () => {
  beforeEach(() => {
    writeContractAsyncMock.mockReset();
    useAccount.mockReset();
    useWriteContract.mockReset();
    useWaitForTransactionReceipt.mockReset();
    toastError.mockReset();

    useAccount.mockReturnValue({ chainId: 1 });
    useWriteContract.mockReturnValue({
      writeContractAsync: writeContractAsyncMock
    });
    useWaitForTransactionReceipt.mockReturnValue({ isSuccess: false });
  });

  it("flags below-minimum stake amounts as disabled", () => {
    const options = buildOptions();
    const { result } = renderHook(() => useStakeFlows(options));

    act(() => {
      result.current.setAmount("0.0000000005");
    });

    expect(result.current.isBelowMinimalStake).toBe(true);
    expect(result.current.isActionDisabled).toBe(true);
  });

  it("blocks stake submission below minimum before any tx call", async () => {
    const options = buildOptions();
    const { result } = renderHook(() => useStakeFlows(options));

    act(() => {
      result.current.setAmount("0.0000000005");
    });

    await act(async () => {
      await result.current.handleStakeFlow();
    });

    expect(toastError).toHaveBeenCalledWith(
      "Minimum stake amount is 0.000000001 SSV."
    );
    expect(writeContractAsyncMock).not.toHaveBeenCalled();
  });
});
