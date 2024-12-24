import { BRIDGE_TOKEN_MAP } from 'constants/index';
import storages from 'constants/storages';
import { ChainId, TokenInfo } from 'types';

export function getTokenInfoByWhitelist(chainId?: ChainId, symbol?: string): undefined | TokenInfo {
  if (!chainId || !symbol) return;
  try {
    const data = localStorage.getItem(storages.useWhitelist);
    if (!data) return;
    const defaultWhitelistMap = JSON.parse(data).defaultWhitelistMap;
    const tokenInfo = (defaultWhitelistMap as any)[BRIDGE_TOKEN_MAP?.[symbol] || symbol]?.[chainId];
    return tokenInfo;
  } catch (error) {
    console.debug(error, 'getTokenInfoByWhitelist');
  }
}
