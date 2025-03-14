import { describe, it, expect } from 'vitest';
import {
  handleError,
  handleContractError,
  handleErrorMessage,
  handleWebLoginErrorMessage,
  handleListingErrorMessage,
} from '../error';

describe('handleError', () => {
  it('should return error.error if exists', () => {
    const error = { error: 'Custom error' };
    expect(handleError(error)).toBe('Custom error');
  });

  it('should return the error itself if error.error does not exist', () => {
    const error = 'Generic error';
    expect(handleError(error)).toBe('Generic error');
  });
});

describe('handleContractError', () => {
  it('should return message if error is string', () => {
    expect(handleContractError('Error message')).toEqual({ message: 'Error message' });
  });

  it('should return error if error.message exists', () => {
    const error = { message: 'Error message' };
    expect(handleContractError(error)).toEqual(error);
  });

  it('should return error if error.shortMessage exists', () => {
    const error = { shortMessage: 'EVM contract error message' };
    const result = handleContractError(error);
    expect(result.message).toEqual(error.shortMessage);
  });

  it('should return error if error.details exists', () => {
    const error = { details: 'User rejected request' };
    const result = handleContractError(error);
    expect(result.message).toEqual(error.details);
  });

  it('should return detailed message and code if error.Error exists', () => {
    const error = { Error: { Details: 'Detailed error', Message: 'Error message', Code: 500 } };
    expect(handleContractError(error)).toEqual({
      message: 'Detailed error',
      code: 500,
    });
  });

  it('should return detailed message and code if error.Error is string', () => {
    const error = { Error: 'Error message' };
    expect(handleContractError(error)).toEqual({
      code: undefined,
      message: 'Error message',
    });
  });

  it('should return code and message from req if no other conditions match', () => {
    const req = { error: { message: { Code: 400 } }, errorMessage: { message: 'Request error' } };
    expect(handleContractError({}, req)).toEqual({
      code: 400,
      message: 'Request error',
    });
  });

  it('should return code and message from req if no other conditions match and error is 400', () => {
    const req = { error: 400, errorMessage: { message: 'Request error' } };
    expect(handleContractError({}, req)).toEqual({
      code: 400,
      message: 'Request error',
    });
  });

  it('should return code and message from req if no other conditions match and have error.message.Message', () => {
    const req = { error: { message: { Code: 400, Message: 'Request error' } } };
    expect(handleContractError({}, req)).toEqual({
      code: 400,
      message: 'Request error',
    });
  });
});

describe('handleErrorMessage', () => {
  it('should return errorText if error status is 500 and passing errorText in parameters', () => {
    const error = { status: 500 };
    expect(handleErrorMessage(error, 'Failed to request')).toBe('Failed to request');
  });

  it('should return errorText if error status is 500', () => {
    const error = { status: 500 };
    expect(handleErrorMessage(error)).toBe('Failed to fetch data');
  });

  it('should return error message from handleContractError', () => {
    const error = { Error: { Message: 'Contract error' } };
    expect(handleErrorMessage(error, 'Default error')).toBe('Contract error');
  });

  it('should return empty string if no error message is found', () => {
    expect(handleErrorMessage({}, 'Default error')).toBe('Default error');
  });

  it('should return empty string if no error message is found and errorText is empty', () => {
    expect(handleErrorMessage({})).toBe('');
  });
});

describe('handleWebLoginErrorMessage', () => {
  it('should handle nativeError and return error message', () => {
    const error = { nativeError: { Error: { Message: 'Login error' } } };
    expect(handleWebLoginErrorMessage(error, 'Default error')).toBe('Login error');
  });

  it('should return default error if no nativeError exists', () => {
    const error = { message: 'Web login error' };
    expect(handleWebLoginErrorMessage(error, 'Default error')).toBe('Web login error');
  });
});

describe('handleListingErrorMessage', () => {
  it('should return error message from response data', () => {
    const error = { response: { data: { error: { message: 'Listing error' } } } };
    expect(handleListingErrorMessage(error, 'Default error')).toBe('Listing error');
  });

  it('should return default error if no response data exists', () => {
    expect(handleListingErrorMessage({}, 'Default error')).toBe('Default error');
  });

  it('should return default error if no response data exists and errorText is empty', () => {
    expect(handleListingErrorMessage({})).toBe('');
  });
});
