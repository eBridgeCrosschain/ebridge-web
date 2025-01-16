import TonWeb from 'tonweb';
import { Address, beginCell, toNano } from '@ton/core';
import { base58ToChainId } from './chain';
import { ChainId } from 'types';
import AElf from 'aelf-sdk';
import { ZERO } from 'constants/misc';
import { CHAIN, SendTransactionRequest } from '@tonconnect/ui-react';
import { getTONJettonMinter, packCreateReceiptBody, tonWeb } from './ton';
export class TonContractCallData {
  static async createReceipt(contractAddress: string, account: string, paramsOption: any[]) {
    const forwardTonAmount = '0.15';
    const feeAmount = '0.2';
    const tokenJettonAddress = paramsOption[0];

    const jettonMinter = getTONJettonMinter(tokenJettonAddress);

    const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(account));

    const createReceiptPayload = packCreateReceiptBody(
      base58ToChainId(paramsOption[2].slice(-4) as ChainId), // paramsOption[2]
      // to address
      AElf.utils.base58.decode(paramsOption[3]),
      Address.parse(tokenJettonAddress),
    );

    const payload = beginCell()
      .storeUint(0xf8a7ea5, 32) // op transfer
      .storeUint(0, 64) // queryId
      .storeCoins(ZERO.plus(paramsOption[1]).toNumber()) // transaction amount
      .storeAddress(Address.parse(contractAddress)) // contract address
      .storeAddress(Address.parse(account)) // TON wallet destination address response excess destination
      .storeMaybeRef(beginCell().storeUint(0, 1).endCell())
      .storeCoins(toNano(forwardTonAmount)) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
      .storeMaybeRef(createReceiptPayload)
      .endCell();

    const transaction: SendTransactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 360, // 360 sec
      network: CHAIN.TESTNET,
      messages: [
        {
          address: jettonWalletAddress.toString(), // eg: USDT wallet address
          // unit is nanoton. for contract calls, the transaction amount is usually 0
          // for jetton transaction, the amount is the max ton coins fee
          amount: toNano(feeAmount).toString(),
          payload: payload.toBoc().toString('base64'),
        },
      ],
    };
    return transaction;
  }
}

export class CallTonContract {
  static async getReceiptDailyLimit(contractAddress: string, paramsOption: any[]) {
    const req = await tonWeb.provider.call(contractAddress, 'get_receipt_daily_limit', [
      ['num', base58ToChainId(paramsOption[1].slice(-4) as ChainId)],
    ]);
    return {
      tokenAmount: ZERO.plus(req.stack[0][1]),
      refreshTime: ZERO.plus(req.stack[1][1]),
      dailyLimit: ZERO.plus(req.stack[2][1]),
    };
  }
  static async getCurrentReceiptTokenBucketState(contractAddress: string, paramsOption: any[]) {
    const req = await tonWeb.provider.call(contractAddress, 'get_receipt_rate_limit_state', [
      ['num', base58ToChainId(paramsOption[1].slice(-4) as ChainId)],
    ]);

    return {
      currentTokenAmount: ZERO.plus(req.stack[0][1]),
      refreshTime: ZERO.plus(req.stack[1][1]),
      tokenCapacity: ZERO.plus(req.stack[2][1]),
      isEnable: ZERO.plus(req.stack[3][1]).toNumber() === -1,
      rate: ZERO.plus(req.stack[4][1]),
    };
  }
}
