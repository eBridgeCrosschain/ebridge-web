import * as MAINNET from '../platform/main';
import * as KOVAN from '../platform/kovan';
import * as GORELI from '../platform/goreli';
import * as AELF_Test from '../platform/AELF_Test';
import * as tDVV_Test from '../platform/tDVV_Test';
import * as tDVW_Test from '../platform/tDVW_Test';
import * as BSC_TESTNET from '../platform/BSC_Test';
import * as SEPOLIA from '../platform/sepolia';
import * as BASE_SEPOLIA from '../platform/base_sepolia';
import DefaultWhitelistMap from './tokenWhitelist.json';
import { DEFAULT_CHAIN_ICON, DEFAULT_CHAIN_NAME, SupportedChainId, SupportedELFChainId } from '../chain';
import { NetworkType } from 'types';
import { IconInfo } from 'types/misc';
import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';

export const MAIN_SIDE_CHAIN_ID = {
  mainChain: SupportedELFChainId.AELF,
  sideChain: SupportedELFChainId.tDVW,
};

export type ChainConstantsType =
  | typeof MAINNET
  | typeof KOVAN
  | typeof AELF_Test
  | typeof tDVV_Test
  | typeof tDVW_Test
  | typeof GORELI
  | typeof SEPOLIA
  | typeof BSC_TESTNET
  | typeof BASE_SEPOLIA;

export type ERC_CHAIN_TYPE = keyof typeof SupportedERCChain;
export type ELF_CHAIN_TYPE = keyof typeof SupportedELFChain;

export const DEFAULT_ELF_CHAIN = SupportedELFChainId.AELF;
export const DEFAULT_ERC_CHAIN = SupportedChainId.SEPOLIA;

export const DEFAULT_MODAL_INITIAL_STATE = {
  fromOptions: { chainType: 'ERC', chainId: DEFAULT_ERC_CHAIN },
  toOptions: { chainType: 'ELF', chainId: DEFAULT_ELF_CHAIN },
  switchChainInConnectPortkey: {
    status: false,
  },
};
export const SupportedERCChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedChainId.MAINNET]: MAINNET,
  [SupportedChainId.KOVAN]: KOVAN,
  [SupportedChainId.GORELI]: GORELI,
  [SupportedChainId.BSC_TESTNET]: BSC_TESTNET,
  [SupportedChainId.SEPOLIA]: SEPOLIA,
  [SupportedChainId.BASE_SEPOLIA]: BASE_SEPOLIA,
};
export const DEFAULT_ERC_CHAIN_INFO = SupportedERCChain[DEFAULT_ERC_CHAIN].CHAIN_INFO;

export type TELFChainConstantsType = typeof AELF_Test | typeof tDVW_Test;
export const SupportedELFChain: { [k: string | number]: TELFChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF_Test,
  [SupportedELFChainId.tDVW]: tDVW_Test,
};

export const ACTIVE_CHAIN: any = {
  [SupportedELFChainId.AELF]: true,
  [SupportedELFChainId.tDVW]: true,
  [SupportedChainId.BSC_TESTNET]: true,
  [SupportedChainId.SEPOLIA]: true,
  [SupportedChainId.BASE_SEPOLIA]: true,
};
export const NATIVE_TOKEN_LIST = ['WETH', 'WBNB'];

export const CHAIN_NAME: { [chainId in SupportedChainId | SupportedELFChainId]: string } = {
  ...DEFAULT_CHAIN_NAME,
  [SupportedELFChainId.AELF]: 'MainChain AELF Testnet',
  [SupportedELFChainId.tDVV]: 'SideChain tDVV Testnet',
  [SupportedELFChainId.tDVW]: 'SideChain tDVW Testnet',
};

export const CHAIN_ICON: { [chainId in SupportedChainId | SupportedELFChainId]: IconInfo } = {
  ...DEFAULT_CHAIN_ICON,
  [SupportedELFChainId.AELF]: {
    type: 'aelfTestnet',
  },
  [SupportedELFChainId.tDVV]: {
    type: 'aelfTestnet',
  },
  [SupportedELFChainId.tDVW]: {
    type: 'aelfTestnet',
  },
};

export const NetworkList = [
  { title: CHAIN_NAME[SupportedChainId.SEPOLIA], icon: CHAIN_ICON[SupportedChainId.SEPOLIA], info: SEPOLIA.CHAIN_INFO },
  {
    title: CHAIN_NAME[SupportedChainId.BASE_SEPOLIA],
    icon: CHAIN_ICON[SupportedChainId.BASE_SEPOLIA],
    info: BASE_SEPOLIA.CHAIN_INFO,
  },
  // { title: CHAIN_NAME[SupportedChainId.GORELI], icon: CHAIN_ICON[SupportedChainId.GORELI], info: GORELI.CHAIN_INFO },
  // { title: CHAIN_NAME[SupportedChainId.KOVAN], icon: CHAIN_ICON[SupportedChainId.KOVAN], info: KOVAN.CHAIN_INFO },
  {
    title: CHAIN_NAME[SupportedELFChainId.AELF],
    icon: CHAIN_ICON[SupportedELFChainId.AELF],
    info: AELF_Test.CHAIN_INFO,
  },
  // { title: CHAIN_NAME[SupportedELFChainId.tDVV], icon: CHAIN_ICON[SupportedELFChainId.tDVV], info: tDVV.CHAIN_INFO },
  {
    title: CHAIN_NAME[SupportedELFChainId.tDVW],
    icon: CHAIN_ICON[SupportedELFChainId.tDVW],
    info: tDVW_Test.CHAIN_INFO,
  },
  {
    title: CHAIN_NAME[SupportedChainId.BSC_TESTNET],
    icon: CHAIN_ICON[SupportedChainId.BSC_TESTNET],
    info: BSC_TESTNET.CHAIN_INFO,
  },
] as unknown as NetworkType[];

export const AELF_NODES = {
  AELF: AELF_Test.CHAIN_INFO,
  tDVW: tDVW_Test.CHAIN_INFO,
};

export { DefaultWhitelistMap };

export const FormatTokenList = [
  {
    fromChainId: [SupportedChainId.BSC_TESTNET],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    fromSymbol: 'WBNB',
    toSymbol: 'BNB',
  },
  {
    fromChainId: [SupportedChainId.SEPOLIA, SupportedChainId.BASE_SEPOLIA],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    fromSymbol: 'WETH',
    toSymbol: 'ETH',
  },
];

export const CrossChainTimeList = [
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '4',
  },
  {
    fromChainId: SupportedChainId.BSC_TESTNET,
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '10',
  },
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: SupportedChainId.BSC_TESTNET,
    time: '10',
  },
  {
    fromChainId: SupportedChainId.SEPOLIA,
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '40',
  },
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: SupportedChainId.SEPOLIA,
    time: '40',
  },
];

export const BRIDGE_TOKEN_MAP: { [key: string]: string } = {
  'TESTSGR-1': 'SGR',
  'SGR-1': 'SGR',
  WUSDvT1: 'WUSD',
  WUSDTEST: 'WUSD',
};
export const WEB_LOGIN_CONFIG = {
  chainId: SupportedELFChainId.tDVW,
  portkeyV2: {
    networkType: NetworkEnum.TESTNET,
    graphQLUrl: 'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    apiServer: 'https://aa-portkey-test.portkey.finance',
    connectServer: 'https://auth-aa-portkey-test.portkey.finance',
    caContractAddress: {
      AELF: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tDVW: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
    },
  },
};

export const APP_NAME = 'ebridge.exchange';

export const WEBSITE_ICON = 'https://test.ebridge.exchange/favicon.ico';

export const SupportedELFChainList = Object.values(SupportedELFChain);

export const INDEXER_URL = 'https://test.ebridge.exchange';
export const BASE_URL = 'https://test.ebridge.exchange';

export const TELEGRAM_BOT_ID = '7220041137';

export const SHOW_V_CONSOLE = true;
