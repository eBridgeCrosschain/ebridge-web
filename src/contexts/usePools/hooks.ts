import { useCallback } from 'react';
import { usePools } from '.';

export function usePoolsDispatch() {
  const [, { dispatch }] = usePools();
  return useCallback(dispatch, [dispatch]);
}
