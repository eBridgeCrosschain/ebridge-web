import { IconInfo } from 'types/misc';

const IS_MAINNET = process.env.NEXT_PUBLIC_APP_ENV === 'mainnet';

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

export enum SupportedTONChainId {
  TESTNET = IS_MAINNET ? 1101 : 1100,
  MAINNET = IS_MAINNET ? 1100 : 1101,
}

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export type TBridgeChainId = SupportedChainId | SupportedELFChainId | SupportedTONChainId;

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
  [SupportedTONChainId.TESTNET]: 'TonTest',
  [SupportedTONChainId.MAINNET]: 'TON',
};

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number',
) as SupportedChainId[];

export const DEFAULT_CHAIN_ICON: { [chainId in TBridgeChainId]: IconInfo } = {
  [SupportedChainId.MAINNET]: {
    type: 'ETHEREUM-CHAIN',
  },
  [SupportedChainId.KOVAN]: {
    type: 'ETHEREUM-CHAIN',
  },
  [SupportedChainId.GORELI]: {
    type: 'ETHEREUM-CHAIN',
  },
  [SupportedChainId.BSC_MAINNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.BSC_TESTNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.HECO_MAINNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.HECO_TESTNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.OEC_MAINNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.OEC_TESTNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.POLYGON_MAINNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedChainId.POLYGON_TESTNET]: {
    type: 'BINANCE-CHAIN',
  },
  [SupportedELFChainId.AELF]: {
    type: 'AELF-CHAIN',
  },
  [SupportedELFChainId.tDVV]: {
    type: 'tDVV-CHAIN',
  },
  [SupportedELFChainId.tDVW]: {
    type: 'tDVV-CHAIN',
  },
  [SupportedChainId.SEPOLIA]: {
    // type: 'SEPOLIA',
    type: 'ETHEREUM-CHAIN',
  },
  [SupportedChainId.BASE_SEPOLIA]: {
    // type: 'BASE_SEPOLIA',
    type: 'BASE-CHAIN',
  },
  [SupportedChainId.BASE]: {
    // type: 'BASE_SEPOLIA',
    type: 'BASE-CHAIN',
  },
  [SupportedTONChainId.TESTNET]: {
    type: 'TON-CHAIN',
  },
  [SupportedTONChainId.MAINNET]: {
    type: 'TON-CHAIN',
  },
};

export const DEFAULT_CHAIN_NAME: { [chainId in TBridgeChainId]: string } = {
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
  [SupportedTONChainId.MAINNET]: 'TON',
  [SupportedTONChainId.TESTNET]: 'TON Testnet',
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
  [SupportedTONChainId.MAINNET]: 'TON',
  [SupportedTONChainId.TESTNET]: 'TON Testnet',
};
