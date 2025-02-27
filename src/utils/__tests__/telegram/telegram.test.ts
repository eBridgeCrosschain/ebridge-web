import { afterEach, describe, it, expect } from 'vitest';
import { TelegramPlatform } from '../../telegram/telegram';

// Mocking the browser `window` object
declare const window: Window & typeof globalThis & { Telegram?: any };

describe('TelegramPlatform', () => {
  // Clean up `window.Telegram` after each test
  afterEach(() => {
    delete window.Telegram;
  });

  /**
   * Test `getTelegram` method
   */
  describe('getTelegram', () => {
    it('should return `undefined` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.getTelegram();

      expect(result).toBeUndefined();
    });

    it('should return `window.Telegram` if it is defined', () => {
      const mockTelegram = { WebApp: { platform: 'web' } };
      window.Telegram = mockTelegram;

      const result = TelegramPlatform.getTelegram();

      expect(result).toBe(mockTelegram);
    });
  });

  /**
   * Test `getWebApp` method
   */
  describe('getWebApp', () => {
    it('should return `undefined` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.getWebApp();

      expect(result).toBeUndefined();
    });

    it('should return the `Telegram.WebApp` object if `window.Telegram` is defined', () => {
      const mockWebApp = { platform: 'web' };
      const mockTelegram = { WebApp: mockWebApp };
      window.Telegram = mockTelegram;

      const result = TelegramPlatform.getWebApp();

      expect(result).toBe(mockWebApp);
    });

    it('should return `undefined` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      const result = TelegramPlatform.getWebApp();

      expect(result).toBeUndefined();
    });
  });

  /**
   * Test `isTelegramPlatform` method
   */
  describe('isTelegramPlatform', () => {
    it('should return `false` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.isTelegramPlatform();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      const result = TelegramPlatform.isTelegramPlatform();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'unknown' } };

      const result = TelegramPlatform.isTelegramPlatform();

      expect(result).toBe(false);
    });

    it('should return `true` if `Telegram.WebApp.platform` is not "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'web' } };

      const result = TelegramPlatform.isTelegramPlatform();

      expect(result).toBe(true);
    });
  });

  describe('isTelegramPlatformWeb', () => {
    it('should return `false` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.isTelegramPlatformWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      const result = TelegramPlatform.isTelegramPlatformWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'unknown' } };

      const result = TelegramPlatform.isTelegramPlatformWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is not "android"', () => {
      window.Telegram = { WebApp: { platform: 'android' } };

      const result = TelegramPlatform.isTelegramPlatformWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "web"', () => {
      window.Telegram = { WebApp: { platform: 'web' } };

      const result = TelegramPlatform.isTelegramPlatformWeb();

      expect(result).toBe(true);
    });
  });

  describe('isTelegramPlatformAndNotWeb', () => {
    it('should return `false` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.isTelegramPlatformAndNotWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      const result = TelegramPlatform.isTelegramPlatformAndNotWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'unknown' } };

      const result = TelegramPlatform.isTelegramPlatformAndNotWeb();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "web"', () => {
      window.Telegram = { WebApp: { platform: 'web' } };

      const result = TelegramPlatform.isTelegramPlatformAndNotWeb();

      expect(result).toBe(false);
    });

    it('should return `true` if `Telegram.WebApp.platform` is "android"', () => {
      window.Telegram = { WebApp: { platform: 'android' } };

      const result = TelegramPlatform.isTelegramPlatformAndNotWeb();

      expect(result).toBe(true);
    });
  });

  describe('isTelegramPlatformDesktop', () => {
    it('should return `false` if `window.Telegram` is not defined', () => {
      const result = TelegramPlatform.isTelegramPlatformDesktop();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      const result = TelegramPlatform.isTelegramPlatformDesktop();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'unknown' } };

      const result = TelegramPlatform.isTelegramPlatformDesktop();

      expect(result).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "web"', () => {
      window.Telegram = { WebApp: { platform: 'web' } };

      const result = TelegramPlatform.isTelegramPlatformDesktop();

      expect(result).toBe(false);
    });

    it('should return `true` if `Telegram.WebApp.platform` is "desktop"', () => {
      window.Telegram = { WebApp: { platform: 'desktop' } };

      const result = TelegramPlatform.isTelegramPlatformDesktop();

      expect(result).toBe(true);
    });
  });
});
