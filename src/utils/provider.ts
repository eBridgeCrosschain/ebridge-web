import { ERCChainConstants } from 'constants/ChainConstants';
import { SupportedERCChain } from 'constants/index';
import Web3 from 'web3';
import { getBridgeChainInfo } from './chain';
import { ChainId } from 'types';
const Provider = Object.values(SupportedERCChain).map((i) => {
  return new Web3.providers.HttpProvider(i.CHAIN_INFO.rpcUrl, {
    keepAlive: true,
    withCredentials: false,
    timeout: 20000, // ms
  });
});
const chainKeys = Object.keys(SupportedERCChain);
export const getProvider = (chainId?: number | string) => {
  const index = chainKeys.findIndex((i) => Number(i) === chainId);
  if (index !== -1) return Provider[index];
};

export function isUserDenied(m: string) {
  return typeof m === 'string' && m.includes('User denied');
}

export const getDefaultProvider = () => {
  const defaultProvider = new Web3.providers.HttpProvider(ERCChainConstants.constants.CHAIN_INFO.rpcUrl, {
    keepAlive: true,
    withCredentials: false,
    timeout: 20000, // ms
  });
  return defaultProvider;
};

export const getDefaultProviderByChainId = (chainId: ChainId) => {
  const defaultProvider = new Web3.providers.HttpProvider(getBridgeChainInfo(chainId)?.CHAIN_INFO?.rpcUrl, {
    keepAlive: true,
    withCredentials: false,
    timeout: 20000, // ms
  });
  return defaultProvider;
};
