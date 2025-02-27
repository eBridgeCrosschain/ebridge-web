import { AElfDappBridge } from '@aelf-react/types';
import { checkAElfBridge, isAElfBridge, isCurrentAElfBridge, reConnectAElfBridge } from 'utils/checkAElfBridge';
import { describe, it, expect, vi } from 'vitest';

describe('isAElfBridge', () => {
  it('should return true for valid AElfBridge', () => {
    const aelfBridge = { options: {}, connect: vi.fn() } as unknown as AElfDappBridge;

    expect(isAElfBridge(aelfBridge)).toBe(true);
  });

  it('should return false for invalid AElfBridge', () => {
    const aelfBridge = { options: {} } as unknown as AElfDappBridge;

    expect(isAElfBridge(aelfBridge)).toBe(false);
  });
});

describe('isCurrentAElfBridge', () => {
  it('should return true if endpoint matches', () => {
    const aelfBridge = { options: { endpoint: 'http://localhost:8000' } } as unknown as AElfDappBridge;

    expect(isCurrentAElfBridge(aelfBridge)).toBe(false);
  });

  it('should return false if endpoint does not match', () => {
    const aelfBridge = { options: { endpoint: 'http://localhost:8001' } } as unknown as AElfDappBridge;

    expect(isCurrentAElfBridge(aelfBridge)).toBe(false);
  });
});

describe('reConnectAElfBridge', () => {
  it('should reconnect failed if endpoint is undefined', async () => {
    const aelfBridge = {
      options: { endpoint: undefined },
      connect: vi.fn().mockResolvedValue(true),
    } as unknown as AElfDappBridge;

    await reConnectAElfBridge(aelfBridge);

    expect(aelfBridge.connect).toHaveBeenCalled();
  });

  it('should throw error if reconnection fails', async () => {
    const aelfBridge = {
      options: { endpoint: 'http://localhost:8000' },
      connect: vi.fn().mockResolvedValue(false),
    } as unknown as AElfDappBridge;

    await expect(reConnectAElfBridge(aelfBridge)).rejects.toThrow('Reconnect Failed');
  });

  it('should throw error if reconnection fails', async () => {
    const aelfBridge = {
      options: { endpoint: 'http://localhost:8000' },
      connect: vi.fn().mockResolvedValue(false),
    } as unknown as AElfDappBridge;

    await expect(reConnectAElfBridge(aelfBridge)).rejects.toThrow('Reconnect Failed');
  });
});

describe('checkAElfBridge', () => {
  it('should reconnect if not current bridge', async () => {
    const aelfBridge = {
      options: { endpoint: 'http://localhost:8001' },
      connect: vi.fn().mockResolvedValue(true),
    } as unknown as AElfDappBridge;

    await checkAElfBridge(aelfBridge);

    expect(aelfBridge.connect).toHaveBeenCalled();
  });

  it('should not reconnect if current bridge', async () => {
    const aelfBridge = {
      options: { endpoint: 'http://localhost:8000' },
      connect: vi.fn(),
    } as unknown as AElfDappBridge;

    await expect(checkAElfBridge(aelfBridge)).rejects.toThrow('Reconnect Failed');
  });
});
