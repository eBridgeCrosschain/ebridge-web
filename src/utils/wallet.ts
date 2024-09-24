import { SupportedELFChainList } from 'constants/index';

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
