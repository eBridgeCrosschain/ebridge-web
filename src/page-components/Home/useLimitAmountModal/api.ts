import { gql } from '@apollo/client';
import { ChainId } from 'types';
import { LimitDataProps } from './constants';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { getChainIdToMap, getShortNameByChainId } from 'utils/chain';
import { isELFChain } from 'utils/aelfUtils';
import { requestGql } from 'api';
import CommonMessage from 'components/CommonMessage';

interface LimitDataByGqlProps {
  fromChainId: ChainId;
  toChainId: ChainId;
  symbol: string;
  limitType: 'Receipt' | 'Swap';
  defaultDailyLimit: number;
  refreshTime: string;
  currentDailyLimit: string;
  capacity: string;
  refillRate: string;
  isEnable: boolean;
  currentBucketTokenAmount: string;
  bucketUpdateTime: string;
}

const limitQuery = gql`
  query queryCrossChainLimitInfos($dto: GetCrossChainLimitInfoDto!) {
    queryCrossChainLimitInfos(dto: $dto) {
      totalRecordCount
      totalRecordCount
      dataList: data {
        id
        fromChainId
        toChainId
        symbol
        limitType
        defaultDailyLimit
        refreshTime
        currentDailyLimit
        capacity
        refillRate
        isEnable
        currentBucketTokenAmount
        bucketUpdateTime
      }
    }
  }
`;

export const getLimitData = async ({
  fromChainId,
  toChainId,
  fromSymbol,
  toSymbol,
}: {
  fromChainId?: ChainId;
  fromSymbol?: string;
  toChainId?: ChainId;
  toSymbol?: string;
}): Promise<LimitDataProps | undefined> => {
  try {
    const client = requestGql({
      uri: '/AElfIndexer_eBridge/EbridgeIndexerPluginSchema/graphql',
    });
    const result = await client.query<{
      queryCrossChainLimitInfos: {
        dataList: Array<LimitDataByGqlProps>;
      };
    }>({
      query: limitQuery,
      variables: {
        dto: {
          fromChainId: isELFChain(fromChainId) ? getShortNameByChainId(fromChainId) : getChainIdToMap(fromChainId),
          toChainId: isELFChain(toChainId) ? getShortNameByChainId(toChainId) : getChainIdToMap(toChainId),
          symbol: isELFChain(fromChainId) ? fromSymbol : toSymbol,
          skipCount: 0,
        },
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result?.data?.queryCrossChainLimitInfos?.dataList?.length) {
      return;
    }

    const {
      refreshTime,
      currentDailyLimit,
      capacity,
      currentBucketTokenAmount,
      refillRate,
      bucketUpdateTime,
      defaultDailyLimit,
      isEnable,
    } = result.data.queryCrossChainLimitInfos.dataList[0];

    let currentCapcity = new BigNumber(currentBucketTokenAmount);
    let remain = new BigNumber(currentDailyLimit);
    const fillRate = new BigNumber(refillRate);
    const maxCapcity = new BigNumber(capacity);

    const utcRefreshTime = moment(refreshTime).utc();
    const utcBucketUpdateTime = moment(bucketUpdateTime).utc();
    const utcNow = moment.utc();
    const midnightToday = moment(utcNow.format('YYYY-MM-DD'));

    if (process.env.NEXT_PUBLIC_APP_ENV === 'test1') {
      // test1 Updated hourly
      if (utcRefreshTime.isBefore(utcNow.clone().subtract(1, 'h'))) {
        remain = new BigNumber(defaultDailyLimit);
      }
    } else {
      // Updated every day
      if (utcRefreshTime.isBefore(midnightToday)) {
        remain = new BigNumber(defaultDailyLimit);
      }
    }

    if (utcBucketUpdateTime.isBefore(utcNow)) {
      const differenceTime = new BigNumber(utcNow.valueOf() - utcBucketUpdateTime.valueOf()).idiv(1000);
      const newCurrentCapcity = fillRate.times(differenceTime).plus(currentCapcity);
      currentCapcity = BigNumber.min(capacity, newCurrentCapcity);
    }

    return {
      fillRate,
      maxCapcity,
      remain,
      currentCapcity,
      isEnable,
    };
  } catch (error: any) {
    CommonMessage.error(error.message);
    console.log('error: ', error);
  }
};
