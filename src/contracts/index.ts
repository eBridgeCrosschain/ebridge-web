import { ContractBasic } from 'utils/contract';
import { checkELFApprove } from './elf';
import { checkErcApprove } from './ethereum';
import { ChainId } from 'types';

export const checkApprove = async (
  fromChainId: ChainId,
  // ethereum from token address elf from token symbol
  fromToken: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  // elf token contract
  tokenContract?: ContractBasic,
): Promise<boolean | any> => {
  if (tokenContract)
    return checkELFApprove(fromToken, account, approveTargetAddress, tokenContract, contractUseAmount, pivotBalance);
  return checkErcApprove(fromChainId, fromToken, account, approveTargetAddress, contractUseAmount, pivotBalance);
};
export * from './elf';
export * from './ethereum';
