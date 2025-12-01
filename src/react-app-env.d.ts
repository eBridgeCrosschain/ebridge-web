/// <reference types="react-scripts" />
interface Window {
  ethereum?: {
    selectedAddress?: string;
    isMetaMask?: true;
    isCoinbaseWallet?: true;
    on?: (...args: unknown[]) => void;
    removeListener?: (...args: unknown[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    request?: (...args: unknown[]) => void;
    chainId?: number;
    providerMap?: any;
  };
  web3?: any;
  plus?: any;
  NightElf?: any;
}
declare module 'aelf-sdk';
declare module 'aelf-sdk-cross-chain';
declare module 'aelf-sdk-cross-chain/src';
declare module '*.less';
declare module '*.module.less';
declare module './styles.module.less';

declare module '*.json';
declare module '*.css';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.ico';
