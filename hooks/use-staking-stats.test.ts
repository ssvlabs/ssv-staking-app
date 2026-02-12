import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStakingStats } from "@/hooks/use-staking-stats";

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn()
}));

const wagmi = await import("wagmi");
const useAccount = wagmi.useAccount as unknown as ReturnType<typeof vi.fn>;
const useReadContract = wagmi.useReadContract as unknown as ReturnType<
  typeof vi.fn
>;

const getCall = (functionName: string) =>
  useReadContract.mock.calls.find(
    ([options]) => options.functionName === functionName
  )?.[0];

describe("useStakingStats", () => {
  beforeEach(() => {
    useAccount.mockReset();
    useReadContract.mockReset();
    useReadContract.mockReturnValue({ data: null });
  });

  it("enables address-bound reads when a wallet is connected", () => {
    useAccount.mockReturnValue({ address: "0xabc" });

    renderHook(() => useStakingStats());

    expect(getCall("previewClaimableEth")?.args).toEqual(["0xabc"]);
    expect(getCall("previewClaimableEth")?.query).toEqual({ enabled: true });
    expect(getCall("stakedBalanceOf")?.query).toEqual({ enabled: true });
    expect(getCall("pendingUnstake")?.query).toEqual({ enabled: true });

    expect(getCall("totalStaked")?.query).toEqual({ enabled: true });
    expect(getCall("cooldownDuration")?.query).toEqual({ enabled: true });
    expect(getCall("stakingEthPoolBalance")?.query).toEqual({
      enabled: true,
      refetchInterval: 30000
    });
  });

  it("disables reads when explicitly disabled", () => {
    useAccount.mockReturnValue({ address: "0xabc" });

    renderHook(() => useStakingStats({ enabled: false }));

    expect(getCall("previewClaimableEth")?.query).toEqual({ enabled: false });
    expect(getCall("stakedBalanceOf")?.query).toEqual({ enabled: false });
    expect(getCall("pendingUnstake")?.query).toEqual({ enabled: false });
    expect(getCall("totalStaked")?.query).toEqual({ enabled: false });
    expect(getCall("cooldownDuration")?.query).toEqual({ enabled: false });
    expect(getCall("stakingEthPoolBalance")?.query).toEqual({
      enabled: false,
      refetchInterval: 30000
    });
  });
});
