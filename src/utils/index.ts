import { SupportedChainId, SupportedELFChainId, SupportedTONChainId } from 'constants/chain';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import { AelfInstancesKey, ChainId, TokenInfo } from 'types';
import { isELFChain } from './aelfUtils';
import { getAddress } from '@ethersproject/address';
import AElf from 'aelf-sdk';
import { BRIDGE_TOKEN_MAP, NATIVE_TOKEN_LIST, SupportedExternalChain } from 'constants/index';
import { isTonAddress } from './ton';

export const sleep = (time: number) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('sleep');
    }, time);
  });
};
export function getExploreLink(
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
  chainId?: ChainId,
): string {
  let prefix;
  if (isELFChain(chainId)) {
    prefix = ELFChainConstants.constants[chainId as AelfInstancesKey]?.CHAIN_INFO?.exploreUrl;
  } else {
    prefix =
      SupportedExternalChain?.[chainId as AelfInstancesKey]?.CHAIN_INFO?.exploreUrl ||
      ERCChainConstants.constants.CHAIN_INFO.exploreUrl;
  }
  const isTON = isTonChain(chainId);
  switch (type) {
    case 'transaction': {
      if (isTON) return `${prefix}transaction/${Buffer.from(data, 'base64').toString('hex')}`;
      return `${prefix}tx/${data}`;
    }
    case 'token': {
      return `${prefix}token/${data}`;
    }
    case 'block': {
      return `${prefix}block/${data}`;
    }
    case 'address':
    default: {
      // TON
      if (isTON) return `${prefix}${data}`;
      return `${prefix}address/${data}`;
    }
  }
}
export function shortenAddress(address: string | null, chars = 4, end = 42): string {
  const parsed = address;
  if (!parsed) throw Error(`Invalid 'address' parameter '${address}'.`);
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(end - chars)}`;
}

export function shortenString(address: string | null, leftChars = 10, rightChars?: number): string {
  const parsed = address;
  if (!parsed) return '';
  if (!rightChars) {
    rightChars = leftChars;
  }
  return `${parsed.substring(0, leftChars)}...${parsed.substring(parsed.length - rightChars)}`;
}

export function unityTokenInfo(tokenInfo?: TokenInfo) {
  if (!tokenInfo) return;
  return {
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    tokenName: tokenInfo.tokenName,
    address: tokenInfo.address,
    issueChainId: tokenInfo.issueChainId,
    issuer: tokenInfo.issuer,
    isBurnable: tokenInfo.isBurnable,
    totalSupply: tokenInfo.totalSupply,
  };
}
type Network = 'ethereum' | 'binance' | 'kovan' | 'AELF' | 'tDVV' | 'tDVW';

function chainIdToNetworkName(chainId?: ChainId): Network {
  switch (chainId) {
    // case SupportedChainId.MAINNET:
    //   return 'ethereum';
    // case SupportedChainId.BSC_MAINNET:
    //   return 'binance';
    case SupportedChainId.KOVAN:
    case SupportedELFChainId.AELF:
    case SupportedELFChainId.tDVV:
    case SupportedELFChainId.tDVW:
    case SupportedChainId.SEPOLIA:
    case SupportedChainId.BSC_TESTNET:
      return 'AELF';
    default:
      return 'AELF';
  }
}
// const networksWithNativeUrls: any = [
//   SupportedChainId.KOVAN,
//   SupportedChainId.GORELI,
//   SupportedELFChainId.AELF,
//   SupportedELFChainId.tDVV,
//   SupportedELFChainId.tDVW,
//   SupportedChainId.BSC_TESTNET,
//   SupportedChainId.SEPOLIA,
// ];

export const getTokenLogoURL = (address?: string | string, chainId?: ChainId) => {
  if (!address) return '';
  const networkName = chainIdToNetworkName(chainId);
  // const repositories = 'trustwallet';
  const repositories = 'eBridgeCrosschain';
  // if (networksWithNativeUrls.includes(chainId)) repositories = 'eBridgeCrosschain';
  return `https://raw.githubusercontent.com/${repositories}/assets/master/blockchains/${networkName}/assets/${address}/logo.png`;
};

export const enumToMap = (v: object) => {
  const newMap: any = {};
  Object.entries(v).forEach(([index, value]) => {
    newMap[index] = value;
    newMap[value] = index;
  });
  return newMap;
};

export function isERCAddress(value: string) {
  try {
    return !!getAddress(value);
  } catch {
    return false;
  }
}
export const isELFAddress = (value: string) => {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
};

export function isAddress(value?: string, chainId?: ChainId) {
  return isChainAddress(value, chainId);
}

export function isChainAddress(address?: string, chainId?: ChainId) {
  if (!address || !chainId) {
    return false;
  }
  console.log(isTonChain(chainId), '====isTonChain(chainId)');

  if (isTonChain(chainId)) return isTonAddress(address);

  if (!isELFChain(chainId)) {
    return isERCAddress(address);
  }
  const reg = new RegExp(`${chainId}$`);
  if (!reg.test(address)) {
    return false;
  }

  return isELFAddress(address);
}

export function formatAddress(value: string) {
  const reg = /.*_([a-zA-Z0-9]*)_.*/;
  return value.replace(reg, '$1');
}

export function formatNativeToken(symbol?: string) {
  if (!symbol) return symbol;
  if (NATIVE_TOKEN_LIST.includes(symbol)) return symbol.slice(1);
  if (BRIDGE_TOKEN_MAP[symbol]) return BRIDGE_TOKEN_MAP[symbol];
  return symbol;
}

export function isIncludesChainId(list: ChainId[] | ChainId, chainId?: ChainId) {
  if (!chainId) return false;
  return Array.isArray(list) ? list.includes(chainId) : chainId === list;
}

export const isTonChain = (chainId?: ChainId) => {
  return typeof chainId === 'number' && chainId === SupportedTONChainId.TESTNET;
};
