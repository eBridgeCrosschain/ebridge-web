import { BRIDGE_TOKEN_MAP, DefaultWhitelistMap } from 'constants/index';
import { ChainId, TokenInfo } from 'types';
export function getDecimalByWhitelist(chainId: ChainId, symbol: string) {
  return (DefaultWhitelistMap as any)[symbol]?.[chainId].decimals;
}

export function getAddressByWhitelist(chainId: ChainId, symbol: string) {
  return (DefaultWhitelistMap as any)[symbol]?.[chainId].address;
}

export function getTokenInfoByWhitelist(chainId?: ChainId, symbol?: string): undefined | TokenInfo {
  if (!chainId || !symbol) {
    return;
  }
  return (DefaultWhitelistMap as any)[BRIDGE_TOKEN_MAP?.[symbol] || symbol]?.[chainId];
}
