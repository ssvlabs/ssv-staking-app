import { describe, expect, it } from "vitest";

import {
  formatDuration,
  formatToken,
  formatTxHash,
} from "@/lib/staking/format";

describe("formatToken", () => {
  it("returns placeholder for undefined values", () => {
    expect(formatToken(undefined)).toBe("--");
  });

  it("formats whole tokens without locale ambiguity", () => {
    expect(formatToken(1_000_000_000_000_000_000n)).toBe("1");
  });
});

describe("formatTxHash", () => {
  it("truncates hashes for display", () => {
    expect(formatTxHash("0x1234567890abcdef")).toBe("0x1234...cdef");
  });
});

describe("formatDuration", () => {
  it("formats seconds into friendly labels", () => {
    expect(formatDuration(0)).toBe("Now");
    expect(formatDuration(61)).toBe("1m 1s");
    expect(formatDuration(3661)).toBe("1h 1m 1s");
    expect(formatDuration(90_000)).toBe("1d 1h");
  });
});
