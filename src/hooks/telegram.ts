import { useRef, useState, useEffect } from 'react';
import { TelegramPlatform } from 'utils/telegram/telegram';

export function useIsTelegramPlatform() {
  const getTelegramPlatformCount = useRef(0);
  const getTelegramPlatformTimer = useRef<NodeJS.Timeout | number>();
  const [isTelegramPlatform, setIsTelegramPlatform] = useState(false);
  useEffect((): any => {
    setIsTelegramPlatform(TelegramPlatform.isTelegramPlatform());
    getTelegramPlatformTimer.current = setInterval(() => {
      if (getTelegramPlatformCount.current <= 10) {
        setIsTelegramPlatform(TelegramPlatform.isTelegramPlatform());
        getTelegramPlatformCount.current++;
        console.log('>>>>>> isTelegramPlatform interval in _app.tsx', TelegramPlatform.isTelegramPlatform());
      } else {
        clearInterval(getTelegramPlatformTimer.current);
        getTelegramPlatformCount.current = 0;
      }
    }, 1000);
    return () => {
      clearInterval(getTelegramPlatformTimer.current);
      getTelegramPlatformTimer.current = undefined;
      getTelegramPlatformCount.current = 0;
    };
  }, []);

  return isTelegramPlatform;
}
