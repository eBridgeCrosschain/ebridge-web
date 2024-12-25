import { request } from 'api';
import { TGetTokenPriceRequest, TGetTokenPriceResult, TGetTokenWhiteListResult } from 'types/api';

export const getTokenPrice = async (params: TGetTokenPriceRequest): Promise<TGetTokenPriceResult> => {
  const res = await request.common.getTokenPrice({ params });

  return res.data;
};

export const getTokenWhiteList = async (): Promise<TGetTokenWhiteListResult> => {
  const res = await request.common.getTokenWhiteList();

  return res.data;
};
