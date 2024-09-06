import { useMemo } from 'react';
import { useHomeContext } from '.';

export function useHomeActions() {
  const [, actions] = useHomeContext();
  return useMemo(() => actions, [actions]);
}
