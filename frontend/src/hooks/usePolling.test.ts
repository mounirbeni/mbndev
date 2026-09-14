import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from './usePolling';

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility('visible');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('usePolling', () => {
  it('calls the callback immediately on mount by default', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000 }));
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not call immediately when immediate is false', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000, immediate: false }));
    await vi.advanceTimersByTimeAsync(0);
    expect(cb).not.toHaveBeenCalled();
  });

  it('calls the callback on every interval tick', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000, immediate: false }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(3000);
    expect(cb).toHaveBeenCalledTimes(5);
  });

  it('stops ticking after unmount', async () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => usePolling(cb, { interval: 1000, immediate: false }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);
    unmount();
    await vi.advanceTimersByTimeAsync(5000);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('never runs when disabled', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000, disabled: true }));
    await vi.advanceTimersByTimeAsync(5000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('does not queue overlapping calls while the previous one is still in-flight', async () => {
    let resolveFirst: () => void = () => {};
    const cb = vi.fn(() => new Promise<void>((resolve) => { resolveFirst = resolve; }));
    renderHook(() => usePolling(cb, { interval: 1000, immediate: false }));

    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1); // first tick fires, promise still pending

    // A second interval elapses while the first call hasn't resolved yet —
    // the in-flight guard must skip this tick rather than starting a second
    // overlapping request.
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);

    resolveFirst();
    await vi.advanceTimersByTimeAsync(0); // let the resolved promise's `finally` run

    // Now that the in-flight call has resolved, the next tick fires normally.
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('pauses polling when the tab is hidden and resumes with a catch-up tick when visible again', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000, immediate: false }));

    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(5000); // no ticks should fire while hidden
    expect(cb).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(0); // the catch-up tick on becoming visible
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('ignores visibility changes when pauseWhenHidden is false', async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, { interval: 1000, immediate: false, pauseWhenHidden: false }));

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(1000);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
