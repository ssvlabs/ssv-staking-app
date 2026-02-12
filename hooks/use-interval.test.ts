import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInterval } from "@/hooks/use-interval";

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes the callback on the given interval", () => {
    const callback = vi.fn();

    renderHook(() => useInterval(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not run when delay is null", () => {
    const callback = vi.fn();

    renderHook(() => useInterval(callback, null));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("uses the latest callback after rerender", () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ callback, delay }) => useInterval(callback, delay),
      { initialProps: { callback: first, delay: 1000 } }
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender({ callback: second, delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
