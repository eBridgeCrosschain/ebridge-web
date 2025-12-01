import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import eBridgeEventBus, { eventBus } from '../eBridgeEventBus';

describe('Event System', () => {
  let callbackMock: ReturnType<typeof vi.fn>;

  // Before each test, reset mocks and initialize the callback
  beforeEach(() => {
    callbackMock = vi.fn();

    // Ensure no listeners from previous tests
    eventBus.removeAllListeners();
  });

  afterEach(() => {
    // Clean up listeners after every test
    eventBus.removeAllListeners();
  });

  /**
   * Test eventBus functionality separately
   */
  describe('eventBus', () => {
    it('should emit and listen for a custom event', () => {
      const testEvent = 'TEST_EVENT';

      // Register a listener
      eventBus.on(testEvent, callbackMock);

      // Emit the event
      eventBus.emit(testEvent, 'payload');

      // Assert callback was called with the correct payload
      expect(callbackMock).toHaveBeenCalledOnce();
      expect(callbackMock).toHaveBeenCalledWith('payload');
    });

    it('should allow removing a listener', () => {
      const testEvent = 'TEST_EVENT';

      // Register a listener
      const listener = (data: any) => {
        callbackMock(data);
      };
      eventBus.on(testEvent, listener);

      // Remove the listener
      eventBus.removeListener(testEvent, listener);

      // Emit the event (should no longer be handled)
      eventBus.emit(testEvent, 'payload');

      // Assert callback was not called
      expect(callbackMock).not.toHaveBeenCalled();
    });
  });

  /**
   * Test eventsServer generated events
   */
  describe('eventsServer-generated events', () => {
    it('should emit and handle `Unauthorized` event via eBridgeEventBus', () => {
      // Register a listener
      const listener = eBridgeEventBus.Unauthorized.addListener(callbackMock);

      // Emit the event
      eBridgeEventBus.Unauthorized.emit('unauthorized_payload');

      // Assert that the listener was called
      expect(callbackMock).toHaveBeenCalledOnce();
      expect(callbackMock).toHaveBeenCalledWith('unauthorized_payload');

      // Remove the listener
      listener.remove();

      // Emit the event again (should have no effect)
      eBridgeEventBus.Unauthorized.emit('second_payload');
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('should emit and handle multiple events', () => {
      // Register listeners for multiple events
      const authSuccessListener = vi.fn();
      const AelfLogoutSuccessListener = vi.fn();
      const AelfLoginSuccessListener = vi.fn();

      const authListener = eBridgeEventBus.AelfAuthTokenSuccess.addListener(authSuccessListener);
      const logoutListener = eBridgeEventBus.AelfLogoutSuccess.addListener(AelfLogoutSuccessListener);
      const loginListener = eBridgeEventBus.AelfLoginSuccess.addListener(AelfLoginSuccessListener);

      // Emit both events
      eBridgeEventBus.AelfAuthTokenSuccess.emit('auth_token_payload');
      eBridgeEventBus.AelfLogoutSuccess.emit('logout_payload');
      eBridgeEventBus.AelfLoginSuccess.emit('login_payload');

      // Assert both listeners were called with respective payloads
      expect(authSuccessListener).toHaveBeenCalledOnce();
      expect(authSuccessListener).toHaveBeenCalledWith('auth_token_payload');

      expect(AelfLogoutSuccessListener).toHaveBeenCalledOnce();
      expect(AelfLogoutSuccessListener).toHaveBeenCalledWith('logout_payload');

      expect(AelfLoginSuccessListener).toHaveBeenCalledOnce();
      expect(AelfLoginSuccessListener).toHaveBeenCalledWith('login_payload');

      // Remove both listeners
      authListener.remove();
      logoutListener.remove();
      loginListener.remove();

      // Emit events again (should not trigger listeners)
      eBridgeEventBus.AelfAuthTokenSuccess.emit('second_payload');
      eBridgeEventBus.AelfLogoutSuccess.emit('second_payload');
      eBridgeEventBus.AelfLoginSuccess.emit('second_payload');
      expect(authSuccessListener).toHaveBeenCalledTimes(1);
      expect(AelfLogoutSuccessListener).toHaveBeenCalledTimes(1);
      expect(AelfLoginSuccessListener).toHaveBeenCalledTimes(1);
    });

    it('should store event names in uppercase', () => {
      expect(eBridgeEventBus.Unauthorized.name).toBe('UNAUTHORIZED');
      expect(eBridgeEventBus.AelfAuthTokenSuccess.name).toBe('AELFAUTHTOKENSUCCESS');
      expect(eBridgeEventBus.AelfLogoutSuccess.name).toBe('AELFLOGOUTSUCCESS');
      expect(eBridgeEventBus.AelfLoginSuccess.name).toBe('AELFLOGINSUCCESS');
      expect(eBridgeEventBus.GlobalLoading.name).toBe('GLOBALLOADING');
    });
  });

  /**
   * Edge case tests
   */
  describe('Edge cases', () => {
    it('should not crash when emitting an event with no listeners', () => {
      expect(() => eBridgeEventBus.Unauthorized.emit('no_listeners_payload')).not.toThrow();
    });

    it('should behave correctly when adding multiple listeners to the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eBridgeEventBus.Unauthorized.addListener(listener1);
      eBridgeEventBus.Unauthorized.addListener(listener2);

      // Emit the event
      eBridgeEventBus.Unauthorized.emit('payload');

      // Assert both listeners were called
      expect(listener1).toHaveBeenCalledOnce();
      expect(listener1).toHaveBeenCalledWith('payload');
      expect(listener2).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledWith('payload');
    });
  });
});
