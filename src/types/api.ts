import { TBridgeChainId } from 'constants/chain';
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

export type TGetApplicationTokenListResult = {
  tokenList: TApplicationTokenItem[];
};

export type TApplicationTokenItem = {
  tokenName: string;
  symbol: string;
  tokenImage: string;
  liquidityInUsd: string;
  holders: number;
};

export type TCommitTokenInfoRequest = {
  symbol: string;
  officialWebsite: string;
  officialTwitter: string;
  title: string;
  personName: string;
  telegramHandler: string;
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
  otherChainList: TApplicationChainStatusItem[];
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
  LiquidityAdded = 'LiquidityAdded',
  Complete = 'Complete',
  Failed = 'Failed',
}

export type TAddApplicationChainRequest = {
  chainIds?: string[];
  otherChainIds?: string[];
  symbol: string;
};

export type TAddApplicationChainResult = {
  chainList?: TAddApplicationChainResultChainItem[];
  otherChainList?: TAddApplicationChainResultChainItem[];
};

export type TAddApplicationChainResultChainItem = {
  id: string;
  chainId: string;
};

export type TPrepareBindIssueRequest = {
  address: string;
  symbol: string;
  chainId: string;
  otherChainId?: string;
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
  chainTokenInfo?: TMyApplicationChainTokenInfo[];
  otherChainTokenInfo?: TMyApplicationChainTokenInfo;
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
  id?: string;
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
  chainTokenInfo?: TApplicationDetailItemChainTokenInfo[];
  otherChainTokenInfo?: TApplicationDetailItemChainTokenInfo;
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
  tokenContractAddress: string;
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

export type TGetTokenPriceRequest = {
  symbol: string;
  amount: string;
};

export type TGetTokenPriceResult = {
  symbol: string;
  tokenAmountInUsd: number;
};

export type TChangeAddLiquidityStatusRequest = {
  orderId: string;
  chainId: TBridgeChainId;
};

export type TChangeAddLiquidityStatusResult = {
  orderId: string;
  chainId: TBridgeChainId;
  success: boolean;
};
