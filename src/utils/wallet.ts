import { CHAIN_ID_MAP, SupportedChainId, SupportedTONChainId } from 'constants/chain';
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

export const isEVMChain = (network: string) => {
  const evmChainIds = [
    SupportedChainId.MAINNET,
    SupportedChainId.BSC_MAINNET,
    SupportedChainId.KOVAN,
    SupportedChainId.GORELI,
    SupportedChainId.BSC_TESTNET,
    SupportedChainId.SEPOLIA,
    SupportedChainId.BASE_SEPOLIA,
    SupportedChainId.BASE,
  ] as const;

  return evmChainIds.some((chainId) => CHAIN_ID_MAP[chainId] === network);
};

export const isTONChain = (network: string) => {
  const tonChainIds = [SupportedTONChainId.TESTNET] as const;

  return tonChainIds.some((chainId) => CHAIN_ID_MAP[chainId] === network);
};
