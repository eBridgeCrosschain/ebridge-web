import { request } from 'api';
import { TGetTokenPriceRequest, TGetTokenPriceResult } from 'types/api';

export const getTokenPrice = async (params: TGetTokenPriceRequest): Promise<TGetTokenPriceResult> => {
  const res = await request.common.getTokenPrice({ params });

  return res.data;
};
