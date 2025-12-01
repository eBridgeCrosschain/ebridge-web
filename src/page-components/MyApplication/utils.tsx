import { ApplicationChainStatusEnum, TMyApplicationItem } from 'types/api';

export const getApplicationDisplayInfo = (data: TMyApplicationItem) => {
  const chainTokenInfo = data?.chainTokenInfo;
  if (!chainTokenInfo) {
    return {
      chainTokenInfo: undefined,
      failTime: 0,
      failReason: '',
      chainId: '',
    };
  }

  const getFailResult = () => {
    switch (chainTokenInfo.status) {
      case ApplicationChainStatusEnum.Failed:
        return {
          time: data.failedTime,
          reason: data.failedReason,
        };
      default:
        return {
          time: 0,
          reason: '',
        };
    }
  };

  return {
    chainTokenInfo,
    chainId: chainTokenInfo.chainId,
    failTime: getFailResult().time,
    failReason: getFailResult().reason,
  };
};
