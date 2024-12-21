import { request } from 'api';
import {
  TAddApplicationChainRequest,
  TAddApplicationChainResult,
  TGetApplicationChainStatusListRequest,
  TGetApplicationChainStatusListResult,
  TGetApplicationDetailRequest,
  TGetApplicationDetailResult,
  TGetApplicationIssueResult,
  TGetApplicationTokenInfoRequest,
  TGetApplicationTokenInfoResult,
  TGetApplicationTokenListResult,
  TCommitTokenInfoRequest,
  TCommitTokenInfoResult,
  TGetMyApplicationListRequest,
  TGetMyApplicationListResult,
  TPrepareBindIssueRequest,
  TPrepareBindIssueResult,
  TGetApplicationIssueRequest,
  TGetTokenConfigRequest,
  TGetTokenConfigResult,
  TChangeAddLiquidityStatusRequest,
  TChangeAddLiquidityStatusResult,
} from 'types/api';

export const getApplicationTokenList = async (): Promise<TGetApplicationTokenListResult> => {
  return {
    tokenList: [
      {
        tokenName: 'TEST DDD',
        symbol: 'TESTDDD',
        tokenImage: 'https://forest-testnet.s3.ap-northeast-1.amazonaws.com/1734339755535-Image1.jpeg',
        liquidityInUsd: '0.90',
        holders: 2,
      },
      {
        tokenName: 'TOKEN CCC',
        symbol: 'TESTCCC',
        tokenImage: 'https://forest-testnet.s3.ap-northeast-1.amazonaws.com/1733825111375-Image2.jpeg',
        liquidityInUsd: '0.02',
        holders: 2,
      },
      {
        tokenName: 'CALLA',
        symbol: 'DFGHJHGFDS',
        tokenImage: 'https://forest-testnet.s3.ap-northeast-1.amazonaws.com/1709202202896-Image3.jpeg',
        liquidityInUsd: '0.00',
        holders: 3,
      },
    ],
  };
  const res = await request.application.getTokenList();
  return res.data;
};

export const commitTokenInfo = async (params: TCommitTokenInfoRequest): Promise<TCommitTokenInfoResult> => {
  const res = await request.application.commitTokenInfo({
    data: params,
  });
  return res.data;
};

export const getApplicationTokenInfo = async (
  params: TGetApplicationTokenInfoRequest,
): Promise<TGetApplicationTokenInfoResult> => {
  return {
    symbol: 'TESTCCC',
    userAddress: 'r4vqggVNAaR55DKxHY39VsRGfyzFPuo59KgweYjsiFnFrCzf',
    officialWebsite: 'https://www.google.com/',
    officialTwitter: 'https://www.google.com/',
    title: 'title12',
    personName: 'name12',
    telegramHandler: '@xxx',
    email: '1234@a.com',
  };
  const res = await request.application.getTokenInfo({
    params,
  });
  return res.data;
};

export const getApplicationChainStatusList = async (
  params: TGetApplicationChainStatusListRequest,
): Promise<TGetApplicationChainStatusListResult> => {
  const res = await request.application.getChainStatus({
    params,
  });
  return res.data;
};

export const addApplicationChain = async (params: TAddApplicationChainRequest): Promise<TAddApplicationChainResult> => {
  const res = await request.application.addChain({
    data: params,
  });
  return res.data;
};

export const prepareBindIssue = async (params: TPrepareBindIssueRequest): Promise<TPrepareBindIssueResult> => {
  const res = await request.application.prepareBindIssue({
    data: params,
  });
  return res.data;
};

export const getApplicationIssue = async (params: TGetApplicationIssueRequest): Promise<TGetApplicationIssueResult> => {
  const res = await request.application.getIssue({ data: params });
  return res.data;
};

export const getMyApplicationList = async (
  params: TGetMyApplicationListRequest,
): Promise<TGetMyApplicationListResult> => {
  const res = await request.application.getMyApplicationList({ params });
  return res.data;
};

export const getApplicationDetail = async (
  params: TGetApplicationDetailRequest,
): Promise<TGetApplicationDetailResult> => {
  const res = await request.application.getApplicationDetail({ params });
  return res.data;
};

export const getApplicationTokenConfig = async (params: TGetTokenConfigRequest): Promise<TGetTokenConfigResult> => {
  return {
    liquidityInUsd: '-1',
    holders: 0,
  };
  const res = await request.application.getTokenConfig({ params });
  return res.data;
};

export const changeAddLiquidityStatus = async (
  params: TChangeAddLiquidityStatusRequest,
): Promise<TChangeAddLiquidityStatusResult> => {
  const res = await request.application.changeAddLiquidityStatus({ data: params });

  return res.data;
};
