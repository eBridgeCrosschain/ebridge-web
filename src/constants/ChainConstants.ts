import { AelfInstancesKey, ChainType, Web3Type } from 'types';
import type { provider } from 'web3-core';
import { SupportedChainId } from './chain';
import {
  ACTIVE_CHAIN,
  ChainConstantsType,
  ERC_CHAIN_TYPE,
  TRC_CHAIN_TYPE,
  DEFAULT_ERC_CHAIN,
  DEFAULT_TRC_CHAIN,
  SupportedERCChain,
  SupportedTRCChain,
  SupportedELFChain,
} from '.';

type AElfOwnConstants = {
  CONTRACTS?: { [key: string]: string };
  TOKEN_CONTRACT?: string;
  CROSS_CHAIN_CONTRACT?: string;
  BRIDGE_CONTRACT?: string;
  BRIDGE_CONTRACT_OUT?: string;
  LIMIT_CONTRACT?: string;
};

type Constants = ChainConstantsType & AElfOwnConstants;

export class ChainConstants {
  public id: number | string;
  static chainId: number | string;
  static chainType: ChainType;
  constructor(id: number | string) {
    this.id = id;
  }
}

export class ERCChainConstants extends ChainConstants {
  static constants: Constants = SupportedERCChain[DEFAULT_ERC_CHAIN];
  static chainType: ChainType = 'ERC';
  static library?: provider;
  constructor(id: number | string, library?: provider) {
    super(id);
    ERCChainConstants['library'] = library;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    const chainId = (this.id || window.ethereum?.chainId) as ERC_CHAIN_TYPE;
    let attrs;
    if (ACTIVE_CHAIN[chainId]) {
      attrs = SupportedERCChain[chainId];
    } else {
      attrs = SupportedERCChain[DEFAULT_ERC_CHAIN];
    }
    ERCChainConstants['constants'] = attrs;
    ERCChainConstants['chainId'] = attrs?.CHAIN_INFO.chainId;
  }
}

function getChainId() {
  if (!window.tronWeb) return undefined;
  const host = window.tronWeb.fullNode.host;

  if (host.includes('api.trongrid')) {
    return SupportedChainId.TRON_MAINNET;
  } else if (host.includes('https://fb48-202-156-61-238.ngrok-free.app')) {
    return SupportedChainId.TRON_DEVNET;
  } else if (host.includes('api.shasta')) {
    return SupportedChainId.TRON_SHASTA_TESTNET;
  } else if (host.includes('api.nile')) {
    return SupportedChainId.TRON_NILE_TESTNET;
  }
}

export class TRCChainConstants extends ChainConstants {
  static constants: Constants = SupportedTRCChain[DEFAULT_TRC_CHAIN];
  static chainType: ChainType = 'TRC';
  static library?: provider;
  constructor(id: number | string, library?: provider) {
    super(id);
    TRCChainConstants['library'] = library;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    const chainId = (this.id || getChainId()) as TRC_CHAIN_TYPE;
    let attrs;
    if (ACTIVE_CHAIN[chainId]) {
      attrs = SupportedTRCChain[chainId];
    } else {
      attrs = SupportedTRCChain[DEFAULT_ERC_CHAIN];
    }
    TRCChainConstants['constants'] = attrs;
    TRCChainConstants['chainId'] = attrs?.CHAIN_INFO.chainId;
  }
}

export class ELFChainConstants extends ChainConstants {
  static chainType: ChainType = 'ELF';
  static aelfInstances?: Web3Type['aelfInstances'];
  static constants: { [k in AelfInstancesKey]: Constants };
  constructor(id: number | string, aelfInstances?: Web3Type['aelfInstances']) {
    super(id);
    ELFChainConstants['aelfInstances'] = aelfInstances;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    ELFChainConstants['constants'] = SupportedELFChain as any;
  }
}
