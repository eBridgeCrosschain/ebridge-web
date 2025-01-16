'use client';
import {
  getTransactionReceipt,
  GetTransactionReceiptParameters,
  getBalance,
  GetBalanceParameters,
  GetTransactionReceiptReturnType,
  readContract,
  ReadContractReturnType,
} from '@wagmi/core';
import { EVMProviderConfig } from 'constants/evm';
import { sleep } from 'utils';
import { handleErrorMessage } from './error';

const PENDING_MESSAGE = 'The Transaction may not be processed on a block yet.';

export async function getTransactionReceiptAutoRetry(
  params: GetTransactionReceiptParameters<any>,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<GetTransactionReceiptReturnType> {
  try {
    const req = await getTransactionReceipt(EVMProviderConfig, params);
    console.log('!! getTransactionReceiptAutoRetry req', req);
    if (req.status === 'success') return req;
    if (req.status === 'reverted') throw { message: 'Transaction is reverted', req };
    reGetCount++;
    await sleep(3000);
    return getTransactionReceiptAutoRetry(params, reGetCount, notExistedReGetCount);
  } catch (error: any) {
    console.log('!! getTransactionReceiptAutoRetry error', error);
    if (handleErrorMessage(error)?.includes(PENDING_MESSAGE)) {
      if (notExistedReGetCount > 200) throw error;
      notExistedReGetCount++;
      await sleep(3000);
      return getTransactionReceiptAutoRetry(params, reGetCount, notExistedReGetCount);
    }
    throw error;
  }
}

export async function getBalanceByWagmi(params: GetBalanceParameters<any>) {
  return getBalance(EVMProviderConfig, params);
}

export type TreadContractByWagmiParams = {
  address: string;
  abi?: any;
  functionName: string;
  args?: any[];
  chainId?: GetBalanceParameters<any>['chainId'];
  blockNumber?: number;
};

export async function readContractByWagmi(params: TreadContractByWagmiParams): Promise<ReadContractReturnType> {
  return readContract(EVMProviderConfig, params as any);
}
