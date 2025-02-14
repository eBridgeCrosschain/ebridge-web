import { ChainId, TokenInfo } from 'types';
import { getTokenInfoByWhitelist } from './whitelist';
import { timesDecimals } from './calculate';
import { isELFChain } from './aelfUtils';
import { ContractBasic } from './contract';
import { checkApprove } from 'contracts';
import { provider } from 'web3-core';
import { REQ_CODE } from 'constants/misc';
import { getBalanceByWagmi, readContractByWagmi } from './wagmi';
import { POOLS_ABI } from 'constants/abis';

export const addLiquidity = async ({
  symbol,
  account,
  amount,
  chainId,
  poolContract,
  tokenContract,
  library,
  tokenInfo,
}: {
  symbol?: string;
  account: string;
  amount: string;
  chainId: ChainId;
  poolContract: ContractBasic;
  tokenContract?: ContractBasic;
  library: provider;
  tokenInfo?: TokenInfo;
}) => {
  if (!tokenInfo?.symbol) tokenInfo = getTokenInfoByWhitelist(chainId as ChainId, symbol);
  if (!symbol) symbol = tokenInfo?.symbol;
  const bigAmount = timesDecimals(amount, tokenInfo?.decimals).toFixed(0);
  if (!tokenInfo?.isNativeToken) {
    const req = await checkApprove(
      library,
      (isELFChain(chainId) ? tokenInfo?.symbol : tokenInfo?.address) as string,
      account,
      poolContract.address || '',
      bigAmount,
      undefined,
      isELFChain(chainId) ? tokenContract : undefined,
    );

    if (req !== REQ_CODE.Success) throw new Error('Failed to add liquidity.');
  }
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
  tokenInfo,
}: {
  symbol?: string;
  account: string;
  amount: string;
  chainId: ChainId;
  poolContract: ContractBasic;
  tokenInfo?: TokenInfo;
}) => {
  if (!tokenInfo?.symbol) tokenInfo = getTokenInfoByWhitelist(chainId as ChainId, symbol);
  if (!symbol) symbol = tokenInfo?.symbol;
  const bigAmount = timesDecimals(amount, tokenInfo?.decimals).toFixed(0);

  if (isELFChain(chainId)) {
    return poolContract?.callSendMethod('removeLiquidity', account, {
      tokenSymbol: symbol,
      amount: bigAmount,
    });
  }

  return poolContract?.callSendMethod('removeLiquidity', account, [tokenInfo?.address, bigAmount]);
};

export type TGetTotalLiquidityParams = {
  poolContract?: ContractBasic;
  tokenContract?: { address?: string; chainId?: ChainId };
  symbol?: string;
};

export const getTotalLiquidity = async ({ poolContract, tokenContract, symbol }: TGetTotalLiquidityParams) => {
  if (poolContract?.contractType === 'ELF') {
    const req = await poolContract.callViewMethod('GetTokenPoolInfo', {
      tokenSymbol: symbol,
    });
    if (req.error) throw req.error;
    return req.liquidity;
  }

  if (poolContract?.contractType === 'TON') {
    const req = await poolContract.callViewMethod('GetTokenPoolInfo', []);
    if (req.error) throw req.error;
    return req.liquidity;
  }

  const req = await getBalanceByWagmi({
    address: poolContract?.address as any,
    token: tokenContract?.address as any,
    chainId: tokenContract?.chainId,
  });
  return req.value.toString();
};

export type TGetMyLiquidityParams = {
  poolContract?: ContractBasic;
  account?: string;
  tokenInfo?: TokenInfo;
};

export const getMyLiquidity = async ({ poolContract, account, tokenInfo }: TGetMyLiquidityParams) => {
  if (poolContract?.contractType === 'ELF') {
    const req = await poolContract.callViewMethod('GetLiquidity', {
      tokenSymbol: tokenInfo?.symbol,
      provider: account,
    });
    if (req.error) throw req.error;
    return req.value;
  }

  const req = await readContractByWagmi({
    abi: POOLS_ABI,
    functionName: 'getUserLiquidity',
    address: poolContract?.address as string,
    chainId: poolContract?.chainId,
    args: [account, tokenInfo?.address],
  });

  return req?.toString();
};
