import { ChainId } from 'types';
import { getTokenInfoByWhitelist } from './whitelist';
import { timesDecimals } from './calculate';
import { isELFChain } from './aelfUtils';
import { ContractBasic } from './contract';
import { checkApprove } from 'contracts';
import { provider } from 'web3-core';
import { REQ_CODE } from 'constants/misc';

export const addLiquidity = async ({
  symbol,
  account,
  amount,
  chainId,
  poolContract,
  tokenContract,
  library,
}: {
  symbol: string;
  account: string;
  amount: string;
  chainId: ChainId;
  poolContract: ContractBasic;
  tokenContract?: ContractBasic;
  library: provider;
}) => {
  const tokenInfo = getTokenInfoByWhitelist(chainId as ChainId, symbol);

  const bigAmount = timesDecimals(amount, tokenInfo?.decimals).toFixed(0);

  const req = await checkApprove(
    library,
    (isELFChain(chainId) ? tokenInfo?.symbol : tokenInfo?.address) as string,
    account,
    poolContract.address || '',
    bigAmount,
    undefined,
    isELFChain(chainId) ? tokenContract : undefined,
  );

  if (req !== REQ_CODE.Success) throw req;
  if (isELFChain(chainId)) {
    return poolContract?.callSendMethod('addLiquidity', account, {
      tokenSymbol: symbol,
      amount: bigAmount,
    });
  }

  return poolContract?.callSendMethod('addLiquidity', account, [tokenInfo?.address, bigAmount], {
    onMethod: 'receipt',
    value: tokenInfo?.isNativeToken ? bigAmount : '0',
  });
};

export const removeLiquidity = async ({
  symbol,
  account,
  amount,
  chainId,
  poolContract,
}: {
  symbol: string;
  account: string;
  amount: string;
  chainId: ChainId;
  poolContract: ContractBasic;
}) => {
  const tokenInfo = getTokenInfoByWhitelist(chainId as ChainId, symbol);

  const bigAmount = timesDecimals(amount, tokenInfo?.decimals).toFixed(0);

  if (isELFChain(chainId)) {
    return poolContract?.callSendMethod('removeLiquidity', account, {
      tokenSymbol: symbol,
      amount: bigAmount,
    });
  }

  return poolContract?.callSendMethod('removeLiquidity', account, [tokenInfo?.address, bigAmount]);
};
