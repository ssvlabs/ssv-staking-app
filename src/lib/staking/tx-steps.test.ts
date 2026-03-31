import { describe, expect, it } from "vitest";

import { STAKING_COPY } from "@/lib/staking/copy";
import {
  buildApprovalAndActionSteps,
  buildSingleStep
} from "@/lib/staking/tx-steps";

describe("buildSingleStep", () => {
  it("wraps a single step with an idle label", () => {
    const steps = buildSingleStep(
      {
        status: "idle",
        label: "Stake",
        hash: null
      },
      "Start stake"
    );

    expect(steps).toHaveLength(1);
    expect(steps[0].idleLabel).toBe("Start stake");
  });
});

describe("buildApprovalAndActionSteps", () => {
  it("returns approval + action steps when approval is required", () => {
    const steps = buildApprovalAndActionSteps(
      true,
      { status: "idle", label: "Approve", hash: null },
      { status: "idle", label: "Stake", hash: null },
      { action: "Stake" }
    );

    expect(steps).toHaveLength(2);
    expect(steps[0].idleLabel).toBe(STAKING_COPY.actions.approve);
    expect(steps[1].idleLabel).toBe("Stake");
  });

  it("returns only the action step when approval is not required", () => {
    const steps = buildApprovalAndActionSteps(
      false,
      { status: "idle", label: "Approve", hash: null },
      { status: "idle", label: "Stake", hash: null },
      { action: "Stake" }
    );

    expect(steps).toHaveLength(1);
    expect(steps[0].idleLabel).toBe("Stake");
  });
});
