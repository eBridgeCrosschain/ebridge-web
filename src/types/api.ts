import { WhitelistMap } from 'contexts/useWhitelist/actions';
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

export type TGetApplicationTokenListRequest = {
  symbol?: string;
};

export type TGetApplicationTokenListResult = {
  tokenList: TApplicationTokenItem[];
};

export type TApplicationTokenItem = {
  tokenName: string;
  symbol: string;
  tokenImage: string;
  totalSupply: number;
  status: TApplicationTokenStatus;
};

export enum TApplicationTokenStatus {
  Listed = 'Listed',
  Integrating = 'Integrating',
  Available = 'Available',
}

export type TGetApplicationTokenDetailRequest = {
  symbol: string;
};

export type TGetApplicationTokenDetailResult = {
  liquidityInUsd: string;
  holders: number;
};

export type TCommitTokenInfoRequest = {
  symbol: string;
  officialWebsite?: string;
  officialTwitter?: string;
  title?: string;
  personName?: string;
  telegramHandler?: string;
  email: string;
};

export type TCommitTokenInfoResult = boolean;

export type TGetApplicationTokenInfoRequest = {
  symbol: string;
};

export type TGetApplicationTokenInfoResult = {
  symbol: string;
  userAddress: string;
  officialWebsite: string;
  officialTwitter: string;
  title: string;
  personName: string;
  telegramHandler: string;
  email: string;
};

export type TGetApplicationChainStatusListRequest = {
  symbol: string;
};

export type TGetApplicationChainStatusListResult = {
  chainList: TApplicationChainStatusItem[];
};

export type TApplicationChainStatusItem = {
  chainId: string;
  chainName: string;
  status: ApplicationChainStatusEnum;
  checked: boolean;
  totalSupply: number;
  decimals: number;
  contractAddress: string;
  symbol: string;
  tokenName: string;
  icon: string;
  poolAddress: string;
  bindingId?: string;
  thirdTokenId?: string;
};

export enum ApplicationChainStatusEnum {
  Unissued = 'Unissued',
  Issuing = 'Issuing',
  Issued = 'Issued',
  PoolInitializing = 'PoolInitializing',
  PoolInitialized = 'PoolInitialized',
  Complete = 'Complete',
  Failed = 'Failed',
}

export type TAddApplicationChainRequest = {
  chainIds?: string[];
  symbol: string;
};

export type TAddApplicationChainResult = {
  chainList?: TAddApplicationChainResultChainItem[];
};

export type TAddApplicationChainResultChainItem = {
  id: string;
  chainId: string;
};

export type TPrepareBindIssueRequest = {
  address: string;
  symbol: string;
  chainId: string;
  contractAddress: string;
  supply: string;
};

export type TPrepareBindIssueResult = {
  bindingId: string;
  thirdTokenId: string;
};

export type TGetApplicationIssueRequest = {
  bindingId: string;
  thirdTokenId: string;
  mintToAddress: string;
};

export type TGetApplicationIssueResult = boolean;

export type TGetMyApplicationListRequest = {
  skipCount?: number;
  maxResultCount?: number;
};

export type TGetMyApplicationListResult = {
  items: TMyApplicationItem[];
  totalCount: number;
};

export type TMyApplicationItem = {
  id: string;
  symbol: string;
  status: ApplicationChainStatusEnum;
  updateTime: number;
  failedTime?: number; // status === ApplicationChainStatusEnum.Failed
  failedReason?: string; // status === ApplicationChainStatusEnum.Failed
  chainTokenInfo: TMyApplicationChainTokenInfo;
};

export type TMyApplicationChainTokenInfo = {
  chainId: string;
  chainName: string;
  tokenName: string;
  icon: string;
  poolAddress: string;
  status: ApplicationChainStatusEnum;
};

export type TGetApplicationDetailRequest = {
  id: string;
  symbol: string;
  network?: string;
};

export type TGetApplicationDetailResult = TApplicationDetailItem[];

export type TApplicationDetailItem = {
  id: string;
  symbol: string;
  userAddress: string;
  status: ApplicationChainStatusEnum;
  createTime: number;
  updateTime: number;
  chainTokenInfo?: TApplicationDetailItemChainTokenInfo;
};

export type TApplicationDetailItemChainTokenInfo = {
  chainId: string;
  chainName: string;
  tokenName: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  icon: string;
  poolAddress: string;
  contractAddress: string;
  status: ApplicationChainStatusEnum;
  minAmount: string; // min amount usd
  dailyLimit: string;
  rateLimit: string;
};

export type TGetTokenConfigRequest = {
  symbol: string;
};

export type TGetTokenConfigResult = {
  liquidityInUsd: string;
  holders: number;
};

export interface APIPoolItem {
  token?: TokensToken;
  chainId: string;
  myTvlInUsd?: string;
  totalTvlInUsd?: string;
  tokenPrice?: string;
}

export type TPoolOverview = {
  totalTvlInUsd: string | number;
  myTotalTvlInUsd: string | number;
  poolCount: number;
  tokenCount: number;
};

export type TGetTokenPriceRequest = {
  symbol: string;
  amount: string;
};

export type TGetTokenPriceResult = {
  symbol: string;
  tokenAmountInUsd: number;
};

export type TGetTokenWhiteListResult = WhitelistMap;
