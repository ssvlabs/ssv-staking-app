import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("filters falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined)).toBe("text-sm");
  });
});
