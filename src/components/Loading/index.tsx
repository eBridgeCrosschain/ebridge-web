import { useState, useCallback, useEffect } from 'react';
import LoadingModal from './LoadingModal';
import eBridgeEventBus from 'utils/eBridgeEventBus';

export default function Loading() {
  const [open, setOpen] = useState(false);

  const setLoadingHandler = useCallback((isLoading: boolean) => {
    setOpen(isLoading);
  }, []);

  useEffect(() => {
    const { remove } = eBridgeEventBus.GlobalLoading.addListener(setLoadingHandler);

    return () => {
      remove();
    };
  });

  return <LoadingModal open={open} hideTitle hideDescription />;
}
