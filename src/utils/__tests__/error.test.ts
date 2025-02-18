import { describe, it, expect } from 'vitest';
import { handleWebLoginErrorMessage } from '../error';

describe('handleWebLoginErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  it('should process `nativeError` when it exists and has a `message`', () => {
    const mockNativeError = {
      nativeError: {
        message: 'Native error occurred',
      },
    };

    const result = handleWebLoginErrorMessage(mockNativeError, 'Custom error text');

    // Assert
    expect(result).toEqual('Native error occurred');
  });

  it('should process non-native errors normally', () => {
    const mockError = {
      message: 'Regular error occurred',
    };

    const result = handleWebLoginErrorMessage(mockError, 'Custom error text');

    // Assert
    expect(result).toEqual('Regular error occurred');
  });

  it('should handle undefined or empty error gracefully', () => {
    const result2 = handleWebLoginErrorMessage({}, 'Default error text');

    // Assert returned values
    expect(result2).toEqual('Default error text');
  });

  it('should not crash if `nativeError` exists but lacks a `message`', () => {
    const mockError = {
      nativeError: {},
    };

    const result = handleWebLoginErrorMessage(mockError, 'Error text fallback');

    expect(result).toEqual('Error text fallback');
  });
});
