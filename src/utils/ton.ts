import { IS_MAINNET } from 'constants/index';
import TonWeb from 'tonweb';
import * as TON_TESTNET from 'constants/platform/TON_Test';
import { Address, beginCell, Cell } from '@ton/core';
import { SendTransactionResponse } from '@tonconnect/ui-react';

export const mainnetTonWeb = new TonWeb();

export const testnetTonWeb = new TonWeb(new TonWeb.HttpProvider(TON_TESTNET.CHAIN_INFO.rpcUrl));

export const tonWeb = IS_MAINNET ? mainnetTonWeb : testnetTonWeb;

export const getTONJettonMinter = (tokenContractAddress: string) => {
  const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {
    address: tokenContractAddress,
  } as any);
  return jettonMinter;
};

export const getTonChainBalance = async (contractAddress: string, address: string) => {
  const jettonMinter = getTONJettonMinter(contractAddress);
  const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(address));
  const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonWeb.provider, {
    address: jettonWalletAddress,
  });
  const res = await jettonWallet.getData();
  return res.balance.toString();
};

export const packCreateReceiptBody = (targetChainId: number, targetAddress: Buffer, jettonAddress: Address) => {
  const payload = beginCell()
    .storeUint(0x71a12142, 32) // 0x71a12142
    .storeUint(targetChainId, 32)
    .storeBuffer(targetAddress, 32)
    .storeAddress(jettonAddress)
    .endCell();
  return payload;
};

export async function getTransactionResponseHash(result: SendTransactionResponse) {
  const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(result.boc)).hash();
  return TonWeb.utils.bytesToBase64(bocCellBytes);
}
