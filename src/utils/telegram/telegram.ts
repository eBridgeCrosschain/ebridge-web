declare const window: Window &
  typeof globalThis & {
    Telegram?: ITelegram;
  };

export class TelegramPlatform {
  static getTelegram() {
    return typeof window !== 'undefined' ? window?.Telegram : undefined;
  }

  static getWebApp() {
    return TelegramPlatform.getTelegram()?.WebApp;
  }

  static isTelegramPlatform() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
  }

  static isTelegramPlatformWeb() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform === 'web');
  }

  static isTelegramPlatformAndNotWeb() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(
      Telegram &&
      Telegram.WebApp.platform &&
      Telegram.WebApp.platform !== 'unknown' &&
      Telegram.WebApp.platform !== 'web'
    );
  }

  static isTelegramPlatformDesktop() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform.includes('desktop'));
  }
}
