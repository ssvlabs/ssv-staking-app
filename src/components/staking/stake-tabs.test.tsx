import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_PENDING_REQUESTS } from "@/lib/staking/constants";
import StakeTabs from "@/components/staking/stake-tabs";

const baseProps = {
  activeTab: "unstake",
  onTabChange: vi.fn(),
  amount: "1",
  onAmountChange: vi.fn(),
  onMax: vi.fn(),
  stakeBalanceLabel: "Wallet Balance: 100",
  unstakeBalanceLabel: "Wallet Balance: 100",
  ssvMedium: "/figma/ssv_0-2106.svg",
  ssvSmall: "/figma/ssv_0-2139.svg",
  tokenDecimals: 18,
  receiptDecimals: 18,
  stakeAmount: 1n,
  isBelowMinimalStake: false,
  minimalStakeLabel: "1",
  cooldownDurationSeconds: 86400,
  cooldownLabel: "1 day",
  isConnected: true,
  isActionDisabled: false,
  isStakeFlowBusy: false,
  isUnstakeFlowBusy: false,
  onWithdrawUnlocked: vi.fn(),
  onRequestUnstake: vi.fn(),
  onStake: vi.fn(),
  withdrawalRequests: [],
  nowEpoch: Math.floor(Date.now() / 1000),
  isWithdrawFlowBusy: false,
  claimableValue: 0n,
  ethIcon: "/figma/ethereum_0-2171.svg",
  isClaimDisabled: true,
  isClaimFlowBusy: false,
  onClaim: vi.fn(),
  faucetUrl: null,
  ssvBalanceValue: 100n,
  stakedBalanceValue: 100n
};

describe("StakeTabs - Unstake pending request limit", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows warning and disables Request Unstake at max pending requests", () => {
    render(<StakeTabs {...baseProps} isUnstakeRequestLimitReached />);

    expect(
      screen.getByText(
        new RegExp(
          `Max pending unstake requests reached \\(${MAX_PENDING_REQUESTS}\\)`
        )
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request Unstake" })
    ).toBeDisabled();
  });

  it("keeps Request Unstake enabled when pending request limit is not reached", () => {
    render(<StakeTabs {...baseProps} isUnstakeRequestLimitReached={false} />);

    expect(
      screen.queryByText(/Max pending unstake requests reached/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request Unstake" })
    ).toBeEnabled();
  });
});
