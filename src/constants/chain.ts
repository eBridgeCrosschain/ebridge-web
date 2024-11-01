import { IconInfo } from 'types/misc';
export enum SupportedChainId {
  MAINNET = 1,
  GORELI = 5,
  KOVAN = 42,
  BSC_MAINNET = 56,
  BSC_TESTNET = 97,
  HECO_MAINNET = 128,
  HECO_TESTNET = 256,
  OEC_MAINNET = 66,
  OEC_TESTNET = 65,
  POLYGON_MAINNET = 137,
  POLYGON_TESTNET = 80001,
  SEPOLIA = 11155111,
  BASE_SEPOLIA = 84532,
  BASE = 8453,
}

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export const CHAIN_ID_MAP = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.BSC_MAINNET]: 'BSC',
  [SupportedELFChainId.AELF]: 'MainChain_AELF',
  [SupportedELFChainId.tDVV]: 'SideChain_tDVV',
  [SupportedELFChainId.tDVW]: 'SideChain_tDVW',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_TESTNET]: 'BSCTest',
  [SupportedChainId.SEPOLIA]: 'Sepolia',
  [SupportedChainId.BASE_SEPOLIA]: 'BaseSepolia',
  [SupportedChainId.BASE]: 'Base',
};

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number',
) as SupportedChainId[];

export const DEFAULT_CHAIN_ICON: { [chainId in SupportedChainId | SupportedELFChainId]: IconInfo } = {
  [SupportedChainId.MAINNET]: {
    type: 'Ethereum',
  },
  [SupportedChainId.KOVAN]: {
    type: 'Ethereum',
  },
  [SupportedChainId.GORELI]: {
    type: 'Ethereum',
  },
  [SupportedChainId.BSC_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.BSC_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.HECO_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.HECO_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.OEC_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.OEC_TESTNET]: {
    type: 'Binance',
  },
  [SupportedChainId.POLYGON_MAINNET]: {
    type: 'Binance',
  },
  [SupportedChainId.POLYGON_TESTNET]: {
    type: 'Binance',
  },
  [SupportedELFChainId.AELF]: {
    type: 'MainChain',
  },
  [SupportedELFChainId.tDVV]: {
    type: 'dAppChain',
  },
  [SupportedELFChainId.tDVW]: {
    type: 'dAppChain',
  },
  [SupportedChainId.SEPOLIA]: {
    // type: 'SEPOLIA',
    type: 'Ethereum',
  },
  [SupportedChainId.BASE_SEPOLIA]: {
    // type: 'BASE_SEPOLIA',
    type: 'BaseChain',
  },
  [SupportedChainId.BASE]: {
    // type: 'BASE_SEPOLIA',
    type: 'BaseChain',
  },
};

export const DEFAULT_CHAIN_NAME: { [chainId in SupportedChainId | SupportedELFChainId]: string } = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_MAINNET]: 'Binance Smart Chain',
  [SupportedChainId.BSC_TESTNET]: 'Binance Smart Chain Testnet',
  [SupportedChainId.HECO_MAINNET]: 'HECO',
  [SupportedChainId.HECO_TESTNET]: 'HECO Testnet',
  [SupportedChainId.OEC_MAINNET]: 'OEC',
  [SupportedChainId.OEC_TESTNET]: 'OEC Testnet',
  [SupportedChainId.POLYGON_MAINNET]: 'Polygon',
  [SupportedChainId.POLYGON_TESTNET]: 'Polygon Testnet',
  [SupportedELFChainId.AELF]: 'aelf MainChain',
  [SupportedELFChainId.tDVV]: 'aelf dAppChain',
  [SupportedELFChainId.tDVW]: 'aelf dAppChain',
  [SupportedChainId.SEPOLIA]: 'Sepolia Testnet',
  [SupportedChainId.BASE_SEPOLIA]: 'Base Sepolia',
  [SupportedChainId.BASE]: 'Base',
};

export const CHAIN_SHORT_NAME = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.BSC_MAINNET]: 'Binance',
  [SupportedELFChainId.AELF]: 'AELF',
  [SupportedELFChainId.tDVV]: 'tDVV',
  [SupportedELFChainId.tDVW]: 'tDVW',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.GORELI]: 'Goerli',
  [SupportedChainId.BSC_TESTNET]: 'Binance',
  [SupportedChainId.SEPOLIA]: 'Sepolia',
  [SupportedChainId.BASE_SEPOLIA]: 'BaseSepolia',
  [SupportedChainId.BASE]: 'Base',
};
