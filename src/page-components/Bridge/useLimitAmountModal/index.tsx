import React, { useCallback, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { useLanguage } from 'i18n';
import BigNumber from 'bignumber.js';
import { ICrossInfo, LimitDataProps, tokenFormat } from './constants';
import { useBridgeOutContract, useLimitContract } from 'hooks/useContract';
import { useWallet } from 'contexts/useWallet/hooks';
import { isELFChain } from 'utils/aelfUtils';
import { getShortNameByChainId } from 'utils/chain';
import { getReceiptLimit, getSwapLimit, getSwapId } from 'utils/crossChain';
import { getLimitData } from './api';
import { useHomeContext } from '../HomeContext';
import { divDecimals } from 'utils/calculate';

import styles from './styles.module.less';
import { CrossChainItem } from 'types/api';
import { ChainId } from 'types';
import { useGetTokenInfoByWhitelist } from 'hooks/token';

const calculateMinValue = (
  input1: LimitDataProps | undefined,
  input2: LimitDataProps | undefined,
): LimitDataProps | undefined => {
  if (!input1) {
    return;
  }

  if (!input2) {
    if (input1.isEnable) {
      input1.checkMaxCapcity = true;
      input1.checkCurrentCapcity = true;
    }
    return input1;
  }

  input1.checkMaxCapcity = true;
  input1.checkCurrentCapcity = true;

  if (input1.remain.gt(input2.remain)) {
    input1.remain = input2.remain;
  }

  if (input1.isEnable && input2.isEnable) {
    if (input1.maxCapcity.gt(input2.maxCapcity)) {
      input1.maxCapcity = input2.maxCapcity;
    }
  } else if (input2.isEnable) {
    input1.maxCapcity = input2.maxCapcity;
    input1.checkCurrentCapcity = false;
  } else if (!input1.isEnable) {
    input1.checkMaxCapcity = false;
    input1.checkCurrentCapcity = false;
  }

  return input1;
};

const formatToken = (input: BigNumber, symbol?: string): string => {
  if (!symbol || typeof tokenFormat[symbol] === 'undefined') {
    return '';
  }
  return input.dp(tokenFormat[symbol], BigNumber.ROUND_DOWN).toFormat();
};

const calculateTime = (input: BigNumber, currentCapcity: BigNumber, fillRate: BigNumber): string =>
  input.minus(currentCapcity).div(fillRate).idiv(60).plus(1).toFormat();

const getLimitDataByGQL = async (crossInfo: ICrossInfo, decimals?: number): Promise<LimitDataProps | undefined> => {
  const response = await getLimitData(crossInfo);

  if (!response) {
    return;
  }

  return {
    remain: divDecimals(response.remain, decimals),
    maxCapcity: divDecimals(response.maxCapcity, decimals),
    currentCapcity: divDecimals(response.currentCapcity, decimals),
    fillRate: divDecimals(response.fillRate, decimals),
    isEnable: response.isEnable,
  };
};

export default function useLimitAmountModal() {
  const { t } = useLanguage();

  const [visible, setVisible] = useState<boolean>(false);
  const [modalTxt, setModalTxt] = useState<string>('');

  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId } = fromWallet || {};
  const { chainId: toChainId } = toWallet || {};

  const [{ selectToken }] = useHomeContext();

  const limitContract = useLimitContract(fromChainId, toChainId);
  const bridgeOutContract = useBridgeOutContract(toChainId, toWallet?.isPortkey);

  const getTokenInfoByWhitelist = useGetTokenInfoByWhitelist();

  const getTokenInfo = useCallback(
    (chainId?: ChainId) => {
      if (!chainId) return;
      return selectToken?.[chainId];
    },
    [selectToken],
  );

  const getLimitDataByContract = useCallback(
    async function (
      type: 'transfer' | 'swap',
      crossInfo: ICrossInfo,
      decimals?: number,
    ): Promise<LimitDataProps | undefined> {
      let response: LimitDataProps | undefined;

      if (type === 'transfer') {
        response = await getReceiptLimit({
          limitContract,
          ...crossInfo,
        });
      } else {
        const swapId = await getSwapId({ bridgeOutContract, ...crossInfo });
        response = await getSwapLimit({ limitContract, ...crossInfo, swapId });
      }

      if (response) {
        response = {
          remain: divDecimals(response.remain, decimals),
          maxCapcity: divDecimals(response.maxCapcity, decimals),
          currentCapcity: divDecimals(response.currentCapcity, decimals),
          fillRate: divDecimals(response.fillRate, decimals),
          isEnable: response.isEnable,
        };
      }

      return response;
    },
    [bridgeOutContract, limitContract],
  );

  const getElfLimitDataFn = useCallback((type: 'transfer' | 'swap', crossInfo: ICrossInfo): Array<any> => {
    return [getLimitDataByGQL(crossInfo, crossInfo?.fromDecimals)];
  }, []);

  const getEvmLimitDataFn = useCallback(
    (type: 'transfer' | 'swap', crossInfo: ICrossInfo): Array<any> => {
      return [getLimitDataByContract(type, crossInfo, crossInfo?.fromDecimals)];
    },
    [getLimitDataByContract],
  );

  const checkDailyLimit = useCallback(
    function (input: BigNumber, { remain }: LimitDataProps, { fromChainId, toChainId, symbol }: ICrossInfo): boolean {
      if (remain.isZero()) {
        setModalTxt(
          t('have reached the daily limit', {
            fromChain: getShortNameByChainId(fromChainId),
            toChain: getShortNameByChainId(toChainId),
            tokenSymbol: symbol,
          }),
        );
        return true;
      }

      if (remain.lt(input)) {
        const amount = formatToken(remain, symbol);
        setModalTxt(
          t('have a daily limit and your current transaction', {
            fromChain: getShortNameByChainId(fromChainId),
            toChain: getShortNameByChainId(toChainId),
            tokenSymbol: symbol,
            amount,
          }),
        );
        return true;
      }

      return false;
    },
    [t],
  );

  const checkCapacity = useCallback(
    function (
      input: BigNumber,
      { maxCapcity, currentCapcity, fillRate, checkMaxCapcity, checkCurrentCapcity }: LimitDataProps,
      { fromChainId, toChainId, symbol }: ICrossInfo,
    ): boolean {
      if (maxCapcity.lt(input) && checkMaxCapcity) {
        const amount = formatToken(maxCapcity, symbol);
        setModalTxt(
          t(`Your current transaction exceeds the capacity and can't be processed`, {
            fromChain: getShortNameByChainId(fromChainId),
            toChain: getShortNameByChainId(toChainId),
            tokenSymbol: symbol,
            amount,
          }),
        );
        return true;
      }

      if (currentCapcity.lt(input) && checkCurrentCapcity) {
        const amount = formatToken(currentCapcity, symbol);
        const time = calculateTime(input, currentCapcity, fillRate);
        setModalTxt(
          t('have a maximum capacity and your current transaction exceeds the available capacity', {
            fromChain: getShortNameByChainId(fromChainId),
            toChain: getShortNameByChainId(toChainId),
            tokenSymbol: symbol,
            amount,
            time,
          }),
        );
        return true;
      }

      return false;
    },
    [t],
  );

  const checkLimitAndRate = useCallback(
    async function (
      type: 'transfer' | 'swap',
      amount?: BigNumber | string | number | null,
      receiveItem?: CrossChainItem,
    ): Promise<boolean> {
      if ((!amount && type === 'transfer') || (type === 'swap' && !receiveItem)) {
        return true;
      }

      const input = new BigNumber(amount || receiveItem?.transferAmount || 0);

      let crossInfo: ICrossInfo;

      if (type === 'transfer') {
        const fromTokenInfo = getTokenInfo(fromChainId);
        const toTokenInfo = getTokenInfo(toChainId);
        crossInfo = {
          toChainId: toChainId,
          toSymbol: toTokenInfo?.symbol,
          toDecimals: toTokenInfo?.decimals,
          fromChainId: fromChainId,
          fromDecimals: fromTokenInfo?.decimals,
          fromSymbol: fromTokenInfo?.symbol,
          symbol: fromTokenInfo?.symbol,
        };
      } else {
        const fromTokenInfo = getTokenInfoByWhitelist(receiveItem?.fromChainId, receiveItem?.transferToken?.symbol);
        const toTokenInfo = getTokenInfoByWhitelist(receiveItem?.toChainId, receiveItem?.transferToken?.symbol);
        crossInfo = {
          fromChainId: receiveItem?.fromChainId,
          fromDecimals: fromTokenInfo?.decimals,
          fromSymbol: fromTokenInfo?.symbol,
          toChainId: receiveItem?.toChainId,
          toDecimals: toTokenInfo?.decimals,
          toSymbol: toTokenInfo?.symbol,
          symbol: receiveItem?.transferToken?.symbol,
        };
      }

      const promistList = isELFChain(fromChainId)
        ? getElfLimitDataFn(type, crossInfo)
        : getEvmLimitDataFn(type, crossInfo);
      const results: Array<LimitDataProps> = await Promise.all(promistList);
      if (results.some((item) => !item)) {
        return true;
      }

      const limitAndRateData = calculateMinValue(results[0], results[1]);
      if (!limitAndRateData) {
        return true;
      }

      if (checkCapacity(input, limitAndRateData, crossInfo) || checkDailyLimit(input, limitAndRateData, crossInfo)) {
        setVisible(true);
        return true;
      }

      return false;
    },
    [
      checkCapacity,
      checkDailyLimit,
      fromChainId,
      getElfLimitDataFn,
      getEvmLimitDataFn,
      getTokenInfo,
      getTokenInfoByWhitelist,
      toChainId,
    ],
  );

  const closeModal = () => setVisible(false);

  const limitAmountModal = useMemo(() => {
    return (
      <CommonModal
        open={visible}
        onCancel={closeModal}
        title={t('Please Notice')}
        className={styles['limit-amount-modal']}>
        <Row gutter={[0, 24]} justify="center">
          <Col span={24} className={styles['text']}>
            {modalTxt}
          </Col>
          <Col span={24} className={styles['confirm-btn-box']}>
            <CommonButton type="primary" onClick={closeModal} className={styles['confirm-btn']}>
              {t('OK')}
            </CommonButton>
          </Col>
        </Row>
      </CommonModal>
    );
  }, [visible, t, modalTxt]);

  return [limitAmountModal, checkLimitAndRate] as const;
}
