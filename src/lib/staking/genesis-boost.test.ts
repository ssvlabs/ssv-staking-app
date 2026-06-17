import { describe, expect, it } from "vitest";

import { calculateBoost } from "@/lib/staking/genesis-boost";

describe("calculateBoost", () => {
  it("returns 0% for ineligible wallets regardless of stake", () => {
    expect(calculateBoost(false, 0)).toBe("0%");
    expect(calculateBoost(false, 4_000)).toBe("0%");
    expect(calculateBoost(false, 50_000)).toBe("0%");
  });

  it("returns 0% for eligible wallets with no stake", () => {
    expect(calculateBoost(true, 0)).toBe("0%");
  });

  it("applies the 20% tier for 0–5,000 SSV", () => {
    expect(calculateBoost(true, 1)).toBe("+20%");
    expect(calculateBoost(true, 2_500)).toBe("+20%");
    expect(calculateBoost(true, 5_000)).toBe("+20%");
  });

  it("applies the 15% tier for 5,000.01–12,000 SSV", () => {
    expect(calculateBoost(true, 5_000.01)).toBe("+15%");
    expect(calculateBoost(true, 12_000)).toBe("+15%");
  });

  it("applies the 10% tier for 12,000.01–20,000 SSV", () => {
    expect(calculateBoost(true, 12_000.01)).toBe("+10%");
    expect(calculateBoost(true, 20_000)).toBe("+10%");
  });

  it("returns 0% above 20,000 SSV", () => {
    expect(calculateBoost(true, 20_000.01)).toBe("0%");
    expect(calculateBoost(true, 100_000)).toBe("0%");
  });
});
