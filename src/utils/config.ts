'use client';
import { getTransactionReceipt, GetTransactionReceiptParameters } from '@wagmi/core';
import { EVMProviderConfig } from 'constants/evm';
import { sleep } from 'utils';
import { handleErrorMessage } from './error';

const PENDING_MESSAGE = 'The Transaction may not be processed on a block yet.';

export async function getTransactionReceiptAutoRetry(
  params: GetTransactionReceiptParameters<any>,
  reGetCount = 0,
  notExistedReGetCount = 0,
) {
  try {
    const req = await getTransactionReceipt(EVMProviderConfig, params);
    if (req.status === 'success') return req;
    if (req.status === 'reverted') throw { message: 'Transaction is reverted', req };
    reGetCount++;
    await sleep(3000);
    return getTransactionReceiptAutoRetry(params, reGetCount, notExistedReGetCount);
  } catch (error: any) {
    if (handleErrorMessage(error)?.includes(PENDING_MESSAGE)) {
      if (notExistedReGetCount > 200) throw error;
      notExistedReGetCount++;
      await sleep(3000);
      return getTransactionReceiptAutoRetry(params, reGetCount, notExistedReGetCount);
    }
    throw error;
  }
}
