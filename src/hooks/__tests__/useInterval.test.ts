import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useInterval from '../useInterval';

// Import mocks
import './useInterval-mock';

describe('useInterval hook', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('calls callback immediately', () => {
    renderHook(() => useInterval(callback, [], 1000));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('sets up interval with specified delay', () => {
    renderHook(() => useInterval(callback, [], 1000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('does not set up interval if delay is null', () => {
    renderHook(() => useInterval(callback, [], null));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).not.toHaveBeenCalled();
  });

  it('uses default delay of 0 if delay is undefined', () => {
    renderHook(() => useInterval(callback, [], undefined));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 0);
  });

  it('works with undefined deps', () => {
    renderHook(() => useInterval(callback, undefined, 1000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('clears interval on unmount', () => {
    const { unmount } = renderHook(() => useInterval(callback, [], 1000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);
    unmount();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('updates callback ref when it changes', () => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const { rerender } = renderHook((props) => useInterval(props.callback, [], 1000), { initialProps: { callback } });
    expect(callback).toHaveBeenCalledTimes(1);
    const newCallback = vi.fn();
    rerender({ callback: newCallback });
    // Only the initial callback should be called at this point
    expect(callback).toHaveBeenCalledTimes(1);
    expect(newCallback).not.toHaveBeenCalled();
  });

  it('updates dependencies correctly', () => {
    const deps = ['initial'];
    const { rerender } = renderHook((props) => useInterval(callback, props.deps, 1000), { initialProps: { deps } });
    expect(callback).toHaveBeenCalledTimes(1);
    // Clear mocks before rerender
    vi.clearAllMocks();
    rerender({ deps: ['changed'] });
    // Should call callback immediately when deps change
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('updates delay correctly', () => {
    const { rerender } = renderHook((props) => useInterval(callback, [], props.delay), {
      initialProps: { delay: 1000 },
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    // Clear mocks before rerender
    vi.clearAllMocks();
    rerender({ delay: 500 });
    // Should call callback immediately when delay changes
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 500);
  });
});
