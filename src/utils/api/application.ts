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
  TGetApplicationTokenListRequest,
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
} from 'types/api';

export const getApplicationTokenList = async (
  params: TGetApplicationTokenListRequest,
): Promise<TGetApplicationTokenListResult> => {
  const res = await request.application.getTokenList({ params });
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
  const res = await request.application.getTokenConfig({ params });
  return res.data;
};
