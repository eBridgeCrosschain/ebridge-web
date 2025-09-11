import type { AElfDappBridge } from '@aelf-react/types';
import type { AElfContextType } from '@aelf-react/core/dist/types';
import { AElfNodes } from 'constants/aelf';
import { CHAIN_NAME } from 'constants/index';
import { Accounts } from '@portkey/provider-types';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { Wallet as TonWallet } from '@tonconnect/ui-react';
import { DisconnectMutateAsync } from 'wagmi/query';
import { Connector } from 'wagmi';
import { SupportedChainId } from 'constants/chain';

export type ChainId = keyof typeof CHAIN_NAME;
export type ChainType = 'ERC' | 'ELF' | 'TON';

export type WalletType = 'PORTKEY' | 'NIGHTELF' | 'ERC' | 'TON' | 'FAIRY_VAULT';

export type NetworkType = {
  title: string;
  info: {
    chainId: ChainId;
    exploreUrl: string;
    rpcUrl: string;
  };
};

export type AelfInstancesKey = keyof typeof AElfNodes;

export const METAMASK_WALLET_ID = 'io.metamask'; // 'metaMaskSDK'
export const COINBASE_WALLET_ID = 'coinbaseWalletSDK'; // 'com.coinbase.wallet'
export const WALLET_CONNECT_ID = 'walletConnect';

export enum EVMConnectorId {
  METAMASK = METAMASK_WALLET_ID,
  COINBASE_WALLET = COINBASE_WALLET_ID,
  WALLET_CONNECT = WALLET_CONNECT_ID,
}

export enum AElfConnectorId {
  NIGHTELF = 'NIGHTELF',
  PORTKEY = 'PORTKEY',
  FAIRY_VAULT = 'FAIRY_VAULT',
}

export enum TONConnectorId {
  TON = 'TON',
}

export type TWalletConnectorId = EVMConnectorId | AElfConnectorId | TONConnectorId;

export type Web3Type = {
  chainId?: ChainId;
  aelfInstance?: AElfDappBridge;
  isActive?: boolean;
  account?: string;
  connector?: Connector | string;
  connectorId?: TWalletConnectorId;
  deactivate?: AElfContextType['deactivate'] | DisconnectMutateAsync<unknown>;
  aelfInstances?: { [key in AelfInstancesKey]: AElfDappBridge };
  isPortkey?: boolean;
  walletType?: WalletType;
  loginWalletType?: WalletTypeEnum;
  accounts?: Accounts | readonly [`0x${string}`, ...`0x${string}`[]] | readonly `0x${string}`[];
  baseAccount?: TonWallet['account'];
  getProvider?: (chainId?: SupportedChainId) => Promise<unknown>;
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
  onlyFrom?: boolean;
  onlyTo?: boolean;
  icon?: string;
};

export enum CrossChainType {
  all = 'all',
  homogeneous = 'homogeneous',
  heterogeneous = 'heterogeneous',
}

export enum OperatePool {
  add = 'add',
  remove = 'remove',
}

export interface WalletInfo {
  connectorId: TWalletConnectorId;
  name: string;
  description: string;
  href: string | null;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  iconType: string;
  chainType: ChainType;
}
