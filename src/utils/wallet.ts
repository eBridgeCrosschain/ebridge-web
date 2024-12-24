import { SupportedELFChainList } from 'constants/index';
import { BlockchainNetworkType } from 'constants/network';

export type TAccounts = Record<string, string[]>;

export const getPortkeySDKAccount = (accounts?: Record<string, string>): TAccounts => {
  if (!accounts) throw new Error('getPortkeyV2SDKAccount: accounts invalid');
  const _accounts: TAccounts = {};
  const address = Object.values(accounts)[0] || '';
  SupportedELFChainList.forEach((chain) => {
    const _chainId = chain.CHAIN_INFO.chainId as string;
    _accounts[_chainId] = [`ELF_${address}_${_chainId}`];
  });
  return _accounts;
};

export const isEVMChain = (network: string) => {
  if (
    network === BlockchainNetworkType.Arbitrum ||
    network === BlockchainNetworkType.Avax ||
    network === BlockchainNetworkType.BASE ||
    network === BlockchainNetworkType.Binance ||
    network === BlockchainNetworkType.Ethereum ||
    network === BlockchainNetworkType.Optimism ||
    network === BlockchainNetworkType.Polygon ||
    network === BlockchainNetworkType.SETH ||
    network === BlockchainNetworkType.TBinance
  ) {
    return true;
  }
  return false;
};

export const isTONChain = (network: string) => {
  if (network === BlockchainNetworkType.TON) {
    return true;
  }
  return false;
};
