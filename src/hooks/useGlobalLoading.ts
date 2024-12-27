import { useCallback, useMemo } from 'react';
import { emitLoading } from 'utils/events';

export default function useGlobalLoading() {
  const _setGlobalLoading = useCallback((isLoading: boolean) => emitLoading(isLoading), []);

  return useMemo(() => ({ setGlobalLoading: _setGlobalLoading }), [_setGlobalLoading]);
}
