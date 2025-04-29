import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebounce from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should return the initial value immediately', () => {
    const initialValue = 'initial value';
    const { result } = renderHook(() => useDebounce(initialValue, 500));

    expect(result.current).toBe(initialValue);
  });

  it('should update the value after the specified delay', () => {
    const initialValue = 'initial value';
    const updatedValue = 'updated value';

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialValue, delay: 500 },
    });

    // Initial value should be returned immediately
    expect(result.current).toBe(initialValue);

    // Update the value
    rerender({ value: updatedValue, delay: 500 });

    // Value should not have changed yet
    expect(result.current).toBe(initialValue);

    // Fast-forward time by 499ms (just before the delay expires)
    act(() => {
      vi.advanceTimersByTime(499);
    });

    // Value should still not have changed
    expect(result.current).toBe(initialValue);

    // Fast-forward time by 1ms more (to reach the full delay)
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Value should have changed now
    expect(result.current).toBe(updatedValue);
  });

  it('should handle changes to the delay', () => {
    const initialValue = 'initial value';
    const updatedValue = 'updated value';

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialValue, delay: 500 },
    });

    // Update the value and delay
    rerender({ value: updatedValue, delay: 1000 });

    // Fast-forward time by 500ms (original delay)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Value should not have changed yet due to updated delay
    expect(result.current).toBe(initialValue);

    // Fast-forward time by another 500ms (to reach the full new delay)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Value should have changed now
    expect(result.current).toBe(updatedValue);
  });

  it('should properly handle rapid value changes', () => {
    const initialValue = 'initial';
    const intermediateValue = 'intermediate';
    const finalValue = 'final';

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialValue, delay: 500 },
    });

    // Change to intermediate value
    rerender({ value: intermediateValue, delay: 500 });

    // Fast-forward time by 300ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Value should not have changed yet
    expect(result.current).toBe(initialValue);

    // Change to final value
    rerender({ value: finalValue, delay: 500 });

    // Fast-forward time by 300ms more
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Value should still not reflect intermediate value
    expect(result.current).toBe(initialValue);

    // Fast-forward time by 200ms more (to reach the full delay since last change)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Value should now reflect final value, skipping intermediate
    expect(result.current).toBe(finalValue);
  });

  it('should handle different value types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 10, delay: 300 } },
    );

    numberRerender({ value: 20, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(numberResult.current).toBe(20);

    // Test with object
    const initialObject = { name: 'John', age: 30 };
    const updatedObject = { name: 'Jane', age: 25 };

    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObject, delay: 300 } },
    );

    objectRerender({ value: updatedObject, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(objectResult.current).toEqual(updatedObject);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
