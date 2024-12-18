import { ChainId, TokenInfo } from 'types';

/**
 * AElf.CrossChainServer.CrossChain.CrossChainTransferIndexDto
 */
export interface CrossChainItem {
  fromAddress?: string;
  fromChainId?: ChainId;
  id?: string;
  progress?: number;
  progressUpdateTime?: Date;
  receiptId?: string;
  receiveAmount?: number;
  receiveTime?: Date;
  receiveToken?: TokensToken;
  receiveTransactionId?: string;
  status?: number;
  toAddress?: string;
  toChainId?: ChainId;
  transferAmount?: number;
  transferBlockHeight?: number;
  transferTime?: Date;
  transferToken?: TokensToken;
  transferTransactionId?: string;
  type?: number;
}

export interface APICrossChainItem {
  fromAddress?: string;
  fromChainId: string;
  id?: string;
  progress?: number;
  progressUpdateTime?: Date;
  receiptId?: string;
  receiveAmount?: number;
  receiveTime?: Date;
  receiveToken?: TokensToken;
  receiveTransactionId?: string;
  status?: number;
  toAddress?: string;
  toChainId: string;
  transferAmount?: number;
  transferBlockHeight?: number;
  transferTime?: Date;
  transferToken?: TokensToken;
  transferTransactionId?: string;
  type?: number;
}
/**
 * AElf.CrossChainServer.Tokens.TokenDto
 */
export type TokensToken = {
  chainId?: string;
  id?: string;
} & TokenInfo;

export interface APIPoolItem {
  token?: TokensToken;
  chainId: string;
  myTvlInUsd?: string;
  totalTvlInUsd?: string;
  tokenPrice?: string;
}
