import * as MAINNET from '../platform/main';
import * as AELF from '../platform/AELF';
import * as tDVV from '../platform/tDVV';
import * as BSC from '../platform/BSC';
import DefaultWhitelistMap from './tokenWhitelist.json';

import { SupportedChainId, SupportedELFChainId } from '../chain';
import { CHAIN_ICON } from '../chainInfo';
import { NetworkType } from 'types';

export type ChainConstantsType = typeof MAINNET | typeof AELF | typeof tDVV | typeof BSC;

export type ERC_CHAIN_TYPE = keyof typeof SupportedERCChain;
export type ELF_CHAIN_TYPE = keyof typeof SupportedELFChain;

export const DEFAULT_ELF_CHAIN = SupportedELFChainId.AELF;
export const DEFAULT_ERC_CHAIN = SupportedChainId.MAINNET;

export const DEFAULT_MODAL_INITIAL_STATE = {
  fromOptions: { chainType: 'ERC', chainId: DEFAULT_ERC_CHAIN },
  toOptions: { chainType: 'ELF', chainId: DEFAULT_ELF_CHAIN },
};
export const SupportedERCChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedChainId.MAINNET]: MAINNET,
  [SupportedChainId.BSC_MAINNET]: BSC,
};
export const DEFAULT_ERC_CHAIN_INFO = SupportedERCChain[DEFAULT_ERC_CHAIN].CHAIN_INFO;

export const SupportedELFChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF,
  [SupportedELFChainId.tDVV]: tDVV,
  [SupportedELFChainId.tDVW]: tDVV,
};

export const ACTIVE_CHAIN: any = {
  [SupportedELFChainId.AELF]: true,
  [SupportedELFChainId.tDVV]: true,
  [SupportedChainId.BSC_MAINNET]: true,
  [SupportedChainId.MAINNET]: true,
};
export const NATIVE_TOKEN_LIST = ['WETH', 'WBNB'];

export const CHAIN_NAME: { [chainId in SupportedChainId | SupportedELFChainId]: string } = {
  [SupportedChainId.MAINNET]: 'Ethereum Mainnet',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_MAINNET]: 'Binance Smart Chain Mainnet',
  [SupportedChainId.BSC_TESTNET]: 'Binance Smart Chain Testnet',
  [SupportedChainId.HECO_MAINNET]: 'HECO',
  [SupportedChainId.HECO_TESTNET]: 'HECO Testnet',
  [SupportedChainId.OEC_MAINNET]: 'OEC',
  [SupportedChainId.OEC_TESTNET]: 'OEC Testnet',
  [SupportedChainId.POLYGON_MAINNET]: 'Polygon',
  [SupportedChainId.POLYGON_TESTNET]: 'Polygon Testnet',
  [SupportedELFChainId.AELF]: 'MainChain AELF Mainnet',
  [SupportedELFChainId.tDVV]: 'SideChain tDVV Mainnet',
  [SupportedELFChainId.tDVW]: 'SideChain tDVW Mainnet',
  [SupportedChainId.SEPOLIA]: 'Sepolia Testnet',
};

export const NetworkList = [
  {
    title: CHAIN_NAME[SupportedELFChainId.AELF],
    icon: CHAIN_ICON[SupportedELFChainId.AELF],
    info: AELF.CHAIN_INFO,
  },
  {
    title: CHAIN_NAME[SupportedELFChainId.tDVV],
    icon: CHAIN_ICON[SupportedELFChainId.tDVV],
    info: tDVV.CHAIN_INFO,
  },
  { title: CHAIN_NAME[SupportedChainId.MAINNET], icon: CHAIN_ICON[SupportedChainId.MAINNET], info: MAINNET.CHAIN_INFO },
  {
    title: CHAIN_NAME[SupportedChainId.BSC_MAINNET],
    icon: CHAIN_ICON[SupportedChainId.BSC_MAINNET],
    info: BSC.CHAIN_INFO,
  },
] as unknown as NetworkType[];

export const AELF_NODES = {
  AELF: AELF.CHAIN_INFO,
  tDVV: tDVV.CHAIN_INFO,
};

export { DefaultWhitelistMap };

export const FormatTokenList = [
  {
    fromChainId: [SupportedChainId.BSC_MAINNET],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    fromSymbol: 'WBNB',
    toSymbol: 'BNB',
  },
  {
    fromChainId: [SupportedChainId.MAINNET],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    fromSymbol: 'WETH',
    toSymbol: 'ETH',
  },
];
