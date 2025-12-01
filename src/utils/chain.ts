import { CHAIN_SHORT_NAME, SupportedELFChainId } from 'constants/chain';
import { CHAIN_ID_MAP } from 'constants/chain';
import { ChainId, ChainType } from 'types';
import { enumToMap, isTonChain, shortenAddress } from 'utils';
import { isELFChain } from './aelfUtils';
import AElf from 'aelf-sdk';
import { CHAIN_ICON, CHAIN_NAME, SupportedELFChain, SupportedERCChain, SupportedTONChain } from 'constants/index';
const { chainIdConvertor } = AElf.utils;
export function getIconByChainId(chainId: ChainId) {
  return CHAIN_ICON[chainId];
}
export function getNameByChainId(chainId?: ChainId) {
  if (!chainId) return 'unknown chain';
  return CHAIN_NAME[chainId];
}
export function getShortNameByChainId(chainId?: ChainId) {
  if (!chainId) return 'unknown chain';
  const name = (CHAIN_SHORT_NAME as any)[chainId];
  if (name) return name;
  return chainId as string;
}

export function getNativeTokenByChainId(chainId?: ChainId) {
  if (!chainId) return 'unknown chain';
  const name = (CHAIN_SHORT_NAME as any)[chainId];
  if (name) return name;
  return chainId as string;
}

const chainMap = enumToMap(CHAIN_ID_MAP);
export function getChainIdByAPI(chainId: string) {
  const elfChainId = chainMap[chainId];
  if (elfChainId) return isNaN(elfChainId) ? elfChainId : (Number(elfChainId) as ChainId);
  return chainId as ChainId;
}
export function getIconByAPIChainId(apiChainId: string) {
  const chainId = getChainIdByAPI(apiChainId);
  return getIconByChainId(chainId);
}
export function getChainIdToMap(chainId?: ChainId) {
  const id = (CHAIN_ID_MAP as any)[chainId as any];
  if (id) return id;
  return chainId;
}
export function base58ToChainId(chainId: ChainId) {
  return chainIdConvertor.base58ToChainId(chainId);
}
export function chainIdToBase58(chainId: number) {
  return chainIdConvertor.chainIdToBase58(chainId);
}
const head = 'ELF_';

export function formatRestoreAddress(chainId: ChainId, address?: string) {
  if (!address) return '';
  const tail = `_${chainId}`;
  return address.replace(new RegExp(head, 'g'), '').replace(new RegExp(tail, 'g'), '');
}

export function formatAddress(chainId?: ChainId, address?: string) {
  if (!address || !chainId) return '';
  address = formatRestoreAddress(chainId, address);
  const tail = `_${chainId}`;
  return head + address + tail;
}

export function shortenAddressByAPI(address?: string, chainId?: ChainId, chars?: number) {
  if (!address || !chainId) {
    return '';
  }
  const isELF = isELFChain(chainId);
  const tmpAddress = isELF ? formatAddress(chainId, address) : address;
  return shortenAddress(tmpAddress, chars, isELF ? 58 : undefined);
}

export const formatNetworkName = (item: string) => {
  switch (item) {
    case SupportedELFChainId.AELF:
      return CHAIN_NAME[SupportedELFChainId.AELF];
    case SupportedELFChainId.tDVV:
      return CHAIN_NAME[SupportedELFChainId.tDVV];
    case SupportedELFChainId.tDVW:
      return CHAIN_NAME[SupportedELFChainId.tDVW];
    default:
      return item;
  }
};

export const getBridgeChainInfo = (chainId?: ChainId) => {
  if (isELFChain(chainId)) return (SupportedELFChain as any)[chainId as any];
  if (isTonChain(chainId)) return (SupportedTONChain as any)[chainId as any];
  return (SupportedERCChain as any)[chainId as any];
};

export const getChainName = (chanId: ChainId) => {
  return CHAIN_NAME[chanId];
};

export const getChainType = (chanId: ChainId): ChainType => {
  if (isELFChain(chanId)) return 'ELF';
  if (isTonChain(chanId)) return 'TON';
  return 'ERC';
};
