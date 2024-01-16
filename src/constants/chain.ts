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
  TRON_MAINNET = 728126428,
  TRON_SHASTA_TESTNET = 2494104990,
  TRON_NILE_TESTNET = 3448148188,
  TRON_DEVNET = 9,
}

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export const SUPPORTED_TRON_CHAIN_IDS = [
  SupportedChainId.TRON_DEVNET,
  SupportedChainId.TRON_MAINNET,
  SupportedChainId.TRON_NILE_TESTNET,
  SupportedChainId.TRON_SHASTA_TESTNET,
];

export const SUPPORTED_ELF_CHAIN_IDS = [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW];

// export enum SupportedTRONChainId {
//   TRON_MAINNET = 728126428,
//   TRON_SHASTA_TESTNET = 2494104990,
//   TRON_NILE_TESTNET = 3448148188,
// }

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
  [SupportedChainId.TRON_MAINNET]: 'Tron_Mainnet',
  [SupportedChainId.TRON_SHASTA_TESTNET]: 'Tron_Shasta_Testnet',
  [SupportedChainId.TRON_NILE_TESTNET]: 'Tron_Nile_Testnet',
  [SupportedChainId.TRON_DEVNET]: 'Tron_Devnet',
};

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number',
) as SupportedChainId[];
