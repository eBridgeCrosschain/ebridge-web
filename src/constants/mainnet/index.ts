import * as MAINNET from '../platform/main';
import * as AELF from '../platform/AELF';
import * as tDVV from '../platform/tDVV';
import * as BSC from '../platform/BSC';
import * as BASE from '../platform/base';
import DefaultWhitelistMap from './tokenWhitelist.json';

import {
  DEFAULT_CHAIN_ICON,
  DEFAULT_CHAIN_NAME,
  SupportedChainId,
  SupportedELFChainId,
  TBridgeChainId,
} from '../chain';
import { NetworkType } from 'types';
import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';

export const NETWORK_TYPE: NetworkEnum = NetworkEnum.MAINNET;

export const MAIN_SIDE_CHAIN_ID = {
  mainChain: SupportedELFChainId.AELF,
  sideChain: SupportedELFChainId.tDVV,
};

export type ChainConstantsType = typeof MAINNET | typeof AELF | typeof tDVV | typeof BSC | typeof BASE;

export type ERC_CHAIN_TYPE = keyof typeof SupportedERCChain;
export type ELF_CHAIN_TYPE = keyof typeof SupportedELFChain;

export const DEFAULT_ELF_CHAIN = SupportedELFChainId.AELF;
export const DEFAULT_ERC_CHAIN = SupportedChainId.MAINNET;

export const DEFAULT_MODAL_INITIAL_STATE = {
  fromOptions: { chainType: 'ERC', chainId: DEFAULT_ERC_CHAIN },
  toOptions: { chainType: 'ELF', chainId: DEFAULT_ELF_CHAIN },
  switchChainInConnectPortkey: {
    status: false,
  },
};
export const SupportedERCChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedChainId.MAINNET]: MAINNET,
  [SupportedChainId.BSC_MAINNET]: BSC,
  [SupportedChainId.BASE]: BASE,
};
export const DEFAULT_ERC_CHAIN_INFO = SupportedERCChain[DEFAULT_ERC_CHAIN].CHAIN_INFO;

export type TELFChainConstantsType = typeof AELF | typeof tDVV;
export const SupportedELFChain: { [k: string | number]: TELFChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF,
  [SupportedELFChainId.tDVV]: tDVV,
};

export const ACTIVE_CHAIN: any = {
  [SupportedELFChainId.AELF]: true,
  [SupportedELFChainId.tDVV]: true,
  [SupportedChainId.BSC_MAINNET]: true,
  [SupportedChainId.MAINNET]: true,
  [SupportedChainId.BASE]: true,
};
export const NATIVE_TOKEN_LIST = ['WETH', 'WBNB'];

export const CHAIN_NAME: { [chainId in TBridgeChainId]: string } = DEFAULT_CHAIN_NAME;

export const CHAIN_ICON = DEFAULT_CHAIN_ICON;

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
  {
    title: CHAIN_NAME[SupportedChainId.BASE],
    icon: CHAIN_ICON[SupportedChainId.BASE],
    info: BASE.CHAIN_INFO,
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
    fromChainId: [SupportedChainId.MAINNET, SupportedChainId.BASE],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    fromSymbol: 'WETH',
    toSymbol: 'ETH',
  },
];

export const CrossChainTimeList = [
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '8',
  },
  {
    fromChainId: SupportedChainId.MAINNET,
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '40',
  },
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: [SupportedChainId.MAINNET],
    time: '40',
  },
  {
    fromChainId: SupportedChainId.BSC_MAINNET,
    toChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    time: '10',
  },
  {
    fromChainId: [SupportedELFChainId.AELF, SupportedELFChainId.tDVV, SupportedELFChainId.tDVW],
    toChainId: [SupportedChainId.BSC_MAINNET],
    time: '10',
  },
];

export const BRIDGE_TOKEN_MAP: { [key: string]: string } = {
  'SGR-1': 'SGR',
};

export const WEB_LOGIN_CONFIG = {
  chainId: SupportedELFChainId.tDVV,
  portkeyV2: {
    networkType: NetworkEnum.MAINNET,
    graphQLUrl: 'https://indexer-api.aefinder.io/api/app/graphql/portkey',
    apiServer: 'https://aa-portkey.portkey.finance',
    connectServer: 'https://auth-aa-portkey.portkey.finance',
    caContractAddress: {
      AELF: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
      tDVV: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
    },
  },
};

export const APP_NAME = 'ebridge.exchange';

export const WEBSITE_ICON = 'https://ebridge.exchange/favicon.ico';

export const SupportedELFChainList = Object.values(SupportedELFChain);

export const INDEXER_URL = 'https://indexer-api.aefinder.io/api/app/graphql/ebridge_indexer';

export const BASE_URL = 'https://ebridge.exchange';

export const TELEGRAM_BOT_ID = '6932375590';

export const SHOW_V_CONSOLE = false;
