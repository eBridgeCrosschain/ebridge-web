/* eslint-disable @typescript-eslint/no-empty-function */
import { BasicActions, basicActions, formatLoginInfo } from 'contexts/utils';
import { describe, expect, test } from 'vitest';

describe('basicActions', () => {
  test('should return an action with type and payload', () => {
    const actionType = 'TEST_ACTION';
    const payload = { key: 'value' };
    const action = basicActions(actionType, payload);

    expect(action).toEqual({
      type: actionType,
      payload: payload,
    });
  });

  test('should return an action with only type if payload is undefined', () => {
    const actionType = 'TEST_ACTION';
    const action = basicActions(actionType);

    expect(action).toEqual({
      type: actionType,
      payload: undefined,
    });
  });
});

describe('BasicActions', () => {
  test('should define the dispatch function type correctly', () => {
    const dispatchMock: BasicActions['dispatch'] = (action) => {
      expect(action.type).toBe('TEST_ACTION');
      expect(action.payload).toEqual({ key: 'value' });
    };

    dispatchMock({ type: 'TEST_ACTION', payload: { key: 'value' } });
  });
});

describe('formatLoginInfo', () => {
  test('should format publicKey when it is an object', () => {
    const loginInfo = JSON.stringify({
      publicKey: {
        x: '1234567890abcdef',
        y: '0987654321fedcba',
      },
    });

    const formattedInfo = formatLoginInfo(loginInfo);

    expect(formattedInfo.pubKey).toBe(
      '040000000000000000000000000000000000000000000000001234567890abcdef0000000000000000000000000000000000000000000000000987654321fedcba',
    );
  });

  test('should format publicKey when it is a JSON string', () => {
    const loginInfo = JSON.stringify({
      publicKey: '{"x":"1234567890abcdef","y":"0987654321fedcba"}',
    });

    const formattedInfo = formatLoginInfo(loginInfo);

    expect(formattedInfo.pubKey).toBe(
      '040000000000000000000000000000000000000000000000001234567890abcdef0000000000000000000000000000000000000000000000000987654321fedcba',
    );
  });

  test('should return the original publicKey if it is not an object or JSON string', () => {
    const loginInfo = JSON.stringify({
      publicKey: '041234567890abcdef0987654321fedcba',
    });

    const formattedInfo = formatLoginInfo(loginInfo);

    expect(formattedInfo.pubKey).toBe('041234567890abcdef0987654321fedcba');
  });

  test('should handle invalid JSON string gracefully', () => {
    const loginInfo = JSON.stringify({
      publicKey: '{invalid json}',
    });

    const formattedInfo = formatLoginInfo(loginInfo);

    expect(formattedInfo.pubKey).toBe('{invalid json}');
  });
});
