'use client';

// import '../../utils/telegram/telegram-web-app';
import { WebLoginProvider, init } from '@aelf-web-login/wallet-adapter-react';
import { config } from './webLoginV2Config';
import { useEffect, useState } from 'react';

export default function WebLoginV2Providers({ children }: { children: React.ReactNode }) {
  const bridgeAPI = init(config); // upper config

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    document.body.appendChild(script);

    script?.addEventListener('load', (res) => {
      console.log('>>>>>> Telegram web app script - load', res);
      setIsLoaded(true);
      return;
    });

    script?.addEventListener('error', (error) => {
      console.warn('>>>>>> Telegram web app script - error', error);
      setIsLoaded(false);
      return;
    });
  }, []);

  return isLoaded ? <WebLoginProvider bridgeAPI={bridgeAPI}>{children}</WebLoginProvider> : null;
}
