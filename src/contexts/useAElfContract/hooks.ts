import { useAElfContractContext } from '.';
import { useMemo } from 'react';
import { ContractBasic } from 'utils/contract';

export function useAElfContractByContext(k: string): ContractBasic | undefined {
  const [contracts] = useAElfContractContext();
  return useMemo(() => contracts?.[k], [contracts, k]);
}
