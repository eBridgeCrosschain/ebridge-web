import { IS_MAINNET } from 'constants/index';
import TonWeb from 'tonweb';
import * as TON_TESTNET from 'constants/platform/TON_Test';
import * as TON_MAINNET from 'constants/platform/TON';
import { Address, beginCell } from '@ton/core';
import { SendTransactionResponse } from '@tonconnect/ui-react';
const mainnetTonWeb = new TonWeb(new TonWeb.HttpProvider(TON_MAINNET.CHAIN_INFO.rpcUrl));
const testnetTonWeb = new TonWeb(new TonWeb.HttpProvider(TON_TESTNET.CHAIN_INFO.rpcUrl));
const defaultGetBalanceTonWeb = IS_MAINNET ? new TonWeb() : testnetTonWeb;

export const TON_WEB = IS_MAINNET ? mainnetTonWeb : testnetTonWeb;
export const getTONJettonMinter = (tokenContractAddress: string, inlineTonWeb?: TonWeb) => {
  const jettonMinter = new TonWeb.token.jetton.JettonMinter((inlineTonWeb || TON_WEB).provider, {
    address: tokenContractAddress,
  } as any);
  return jettonMinter;
};

export const getTonChainBalance = async (contractAddress: string, address: string) => {
  const jettonWalletAddress = await getJettonWalletAddress(contractAddress, address, defaultGetBalanceTonWeb);
  const jettonWallet = new TonWeb.token.jetton.JettonWallet(defaultGetBalanceTonWeb.provider, {
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

export function isTonAddress(addr: string) {
  return Address.isFriendly(addr) || Address.isAddress(addr);
}

const JettonWalletAddressMap: any = {};

export async function getJettonWalletAddress(tokenContractAddress: string, account: string, inlineTonWeb?: TonWeb) {
  const key = (inlineTonWeb || TON_WEB).provider.host + tokenContractAddress + account;

  if (!JettonWalletAddressMap[key]) {
    const jettonMinter = getTONJettonMinter(tokenContractAddress, inlineTonWeb);
    JettonWalletAddressMap[key] = (await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(account))) as any;
  }
  return JettonWalletAddressMap[key];
}
