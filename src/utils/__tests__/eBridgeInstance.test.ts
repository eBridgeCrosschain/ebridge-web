import { describe, it, expect, beforeEach } from 'vitest';
import { EBridgeInstance } from '../eBridgeInstance';

describe('EBridgeInstance', () => {
  let instance: EBridgeInstance;

  beforeEach(() => {
    // Recreate a fresh instance for each test
    instance = new EBridgeInstance();
  });

  /**
   * Test Initialization
   */
  it('should initialize with default values', () => {
    expect(instance.unauthorized).toBe(false);
    expect(instance.obtainingSignature).toBe(false);
  });

  /**
   * Test setUnauthorized
   */
  it('should set unauthorized correctly', () => {
    instance.setUnauthorized(true);
    expect(instance.unauthorized).toBe(true);

    instance.setUnauthorized(false);
    expect(instance.unauthorized).toBe(false);
  });

  /**
   * Test setObtainingSignature
   */
  it('should set obtainingSignature correctly', () => {
    instance.setObtainingSignature(true);
    expect(instance.obtainingSignature).toBe(true);

    instance.setObtainingSignature(false);
    expect(instance.obtainingSignature).toBe(false);
  });
});
