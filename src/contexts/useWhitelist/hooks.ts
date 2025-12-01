import { useMemo } from 'react';
import { useWhitelist } from '.';

export function useWhitelistActions() {
  const [, actions] = useWhitelist();
  return useMemo(() => actions, [actions]);
}
