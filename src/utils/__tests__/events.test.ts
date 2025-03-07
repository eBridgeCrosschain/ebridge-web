import { describe, it, expect, vi } from 'vitest';
import { emitLoading } from '../events';
import eBridgeEventBus from '../eBridgeEventBus';

// Mock Event Bus
vi.mock('../eBridgeEventBus', () => ({
  default: {
    GlobalLoading: {
      emit: vi.fn(),
    },
  },
}));

// Mock Event Bus
vi.mock('../eBridgeEventBus', () => ({
  default: {
    GlobalLoading: {
      emit: vi.fn(),
    },
  },
}));

// Mock Event Bus
vi.mock('../eBridgeEventBus', () => {
  return {
    default: {
      GlobalLoading: {
        emit: vi.fn(),
      },
    },
  };
});

describe('emitLoading', () => {
  it('should emit the global loading event with `loading` true', () => {
    emitLoading(true);

    // Assert that `eBridgeEventBus.GlobalLoading.emit` was called with the correct arguments
    expect(eBridgeEventBus.GlobalLoading.emit).toHaveBeenCalledOnce();
    expect(eBridgeEventBus.GlobalLoading.emit).toHaveBeenCalledWith(true);
  });

  it('should emit the global loading event with `loading` false', () => {
    emitLoading(false);

    // Assert that `eBridgeEventBus.GlobalLoading.emit` was called with correct arguments
    expect(eBridgeEventBus.GlobalLoading.emit).toHaveBeenCalledWith(false);
  });
});
