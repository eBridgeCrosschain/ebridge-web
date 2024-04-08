import type { HttpProvider } from 'web3-core';
import type { AElfDappBridge } from '@aelf-react/types';
import type { Web3ContextType } from '@web3-react/core';
import type { AElfContextType } from '@aelf-react/core/dist/types';
import { AElfNodes } from 'constants/aelf';
import { CHAIN_NAME } from 'constants/index';
import type { Connector } from '@web3-react/types';
import { Accounts } from '@portkey/provider-types';

export type ChainId = keyof typeof CHAIN_NAME;
export type ChainType = 'ERC' | 'ELF';

export type WalletType = 'PORTKEY' | 'NIGHTELF' | 'ERC';

export type NetworkType = {
  title: string;
  info: {
    chainId: ChainId;
    exploreUrl: string;
    rpcUrl: string;
  };
};

export type AelfInstancesKey = keyof typeof AElfNodes;

export type Web3Type = {
  chainId?: ChainId;
  library?: HttpProvider | any;
  aelfInstance?: AElfDappBridge;
  provider?: any;
  isActive?: boolean;
  account?: string;
  connector?: Web3ContextType['connector'] | string;
  deactivate?: AElfContextType['deactivate'];
  aelfInstances?: { [key in AelfInstancesKey]: AElfDappBridge };
  isPortkey?: boolean;
  walletType?: WalletType;
  accounts?: Accounts;
};
export type TokenInfo = {
  decimals: number;
  symbol: string;
  tokenName?: string;
  address?: string;
  issueChainId?: number;
  issuer?: string;
  isBurnable?: boolean;
  totalSupply?: number;
  isNativeToken?: boolean;
  onlyForm?: boolean;
  onlyTo?: boolean;
};

export enum CrossChainType {
  homogeneous = 'homogeneous',
  heterogeneous = 'heterogeneous',
}

export interface WalletInfo {
  connector: Connector | string;
  name: string;
  description: string;
  href: string | null;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  iconType: string;
  version?: string;
}
