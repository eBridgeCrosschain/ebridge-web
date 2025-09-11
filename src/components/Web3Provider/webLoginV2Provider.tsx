'use client';
// import '../../utils/telegram/telegram-web-app';
import { useMemo } from 'react';
import { WebLoginProvider } from '@aelf-web-login/wallet-adapter-react';
import { config, didConfig } from './webLoginV2Config';
import { useEffect, useState } from 'react';
import { did } from '@portkey/did';
import { checkConnectedWallet } from 'utils/portkey';

export default function WebLoginV2Providers({ children }: { children: React.ReactNode }) {
  useMemo(() => {
    did.setConfig(didConfig);
    checkConnectedWallet();
  }, []);

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

  return isLoaded ? <WebLoginProvider config={config}>{children}</WebLoginProvider> : null;
}
