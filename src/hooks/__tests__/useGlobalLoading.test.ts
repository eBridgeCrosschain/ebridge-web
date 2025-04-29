import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGlobalLoading from '../useGlobalLoading';
import { emitLoading } from 'utils/events';

// Mock the emitLoading function from utils/events
vi.mock('utils/events', () => ({
  emitLoading: vi.fn(),
}));

describe('useGlobalLoading', () => {
  it('should return a setGlobalLoading function', () => {
    const { result } = renderHook(() => useGlobalLoading());

    // Check if the hook returns an object with the setGlobalLoading function
    expect(result.current).toHaveProperty('setGlobalLoading');
    expect(typeof result.current.setGlobalLoading).toBe('function');
  });

  it('should call emitLoading with true when setGlobalLoading is called with true', () => {
    const { result } = renderHook(() => useGlobalLoading());

    // Call the setGlobalLoading function with true
    result.current.setGlobalLoading(true);

    // Verify that emitLoading was called with true
    expect(emitLoading).toHaveBeenCalledOnce();
    expect(emitLoading).toHaveBeenCalledWith(true);
  });

  it('should call emitLoading with false when setGlobalLoading is called with false', () => {
    const { result } = renderHook(() => useGlobalLoading());

    // Call the setGlobalLoading function with false
    result.current.setGlobalLoading(false);

    // Verify that emitLoading was called with false
    expect(emitLoading).toHaveBeenCalledWith(false);
  });

  it('should maintain reference equality of setGlobalLoading between renders', () => {
    const { result, rerender } = renderHook(() => useGlobalLoading());

    // Save reference to the initial setGlobalLoading function
    const initialSetGlobalLoading = result.current.setGlobalLoading;

    // Rerender the hook
    rerender();

    // Check that the function reference is the same
    expect(result.current.setGlobalLoading).toBe(initialSetGlobalLoading);
  });
});
