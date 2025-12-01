import BigNumber from 'bignumber.js';
import { ContractBasic } from '../utils/contract';
import { REQ_CODE } from 'constants/misc';
import { timesDecimals } from 'utils/calculate';
import { isUserDenied } from 'utils/provider';
import CommonMessage from 'components/CommonMessage';
// elf
export const getELFChainBalance = async (tokenContract: ContractBasic, symbol: string, account: string) => {
  const balance = await tokenContract.callViewMethod('GetBalance', {
    symbol: symbol,
    owner: account,
  });
  return balance?.balance ?? balance?.amount ?? 0;
};

export const checkElfChainAllowanceAndApprove = async ({
  tokenContract,
  approveTargetAddress,
  account,
  contractUseAmount,
  pivotBalance,
  symbol,
}: {
  tokenContract: ContractBasic;
  approveTargetAddress: string;
  account: string;
  contractUseAmount?: string | number;
  pivotBalance?: string | number;
  symbol: string;
}): Promise<boolean | any> => {
  const [allowance, info] = await Promise.all([
    tokenContract.callViewMethod('GetAllowance', [symbol, account, approveTargetAddress]),
    tokenContract.callViewMethod('GetTokenInfo', [symbol]),
  ]);
  if (allowance.error) {
    return allowance;
  }
  const allowanceBN = new BigNumber(allowance.allowance ?? allowance.amount ?? 0);
  const pivotBalanceBN = contractUseAmount
    ? new BigNumber(contractUseAmount)
    : timesDecimals(pivotBalance, info.decimals ?? 8);
  if (allowanceBN.lt(pivotBalanceBN)) {
    const approveResult = await tokenContract.callSendMethod('approve', account, [
      approveTargetAddress,
      symbol,
      pivotBalanceBN.toFixed(0),
    ]);
    if (approveResult.error) {
      return approveResult;
    } else {
      return approveResult;
    }
  }
  return true;
};
export const checkELFApprove = async (
  symbol: string,
  account: string,
  approveTargetAddress: string,
  tokenContract: ContractBasic,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
): Promise<boolean | any> => {
  const approveResult = await checkElfChainAllowanceAndApprove({
    tokenContract,
    approveTargetAddress,
    account,
    contractUseAmount,
    pivotBalance,
    symbol: symbol,
  });
  if (typeof approveResult !== 'boolean' && approveResult.error) {
    CommonMessage.error('Approval Failed');
    CommonMessage.error(approveResult.error.message);
    if (isUserDenied(approveResult.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  return REQ_CODE.Success;
};
