import React, { useCallback, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { useLanguage } from 'i18n';
import BigNumber from 'bignumber.js';
import { ICrossInfo, LimitDataProps } from './constants';
import { useBridgeOutContract, useLimitContract, usePoolContract } from 'hooks/useContract';
import { useWallet } from 'contexts/useWallet/hooks';
import { isELFChain } from 'utils/aelfUtils';
import { getNameByChainId } from 'utils/chain';
import { getReceiptLimit, getSwapLimit, getSwapId } from 'utils/crossChain';
import { useHomeContext } from '../HomeContext';
import { divDecimals } from 'utils/calculate';

import styles from './styles.module.less';
import { CrossChainItem } from 'types/api';
import { ChainId, TokenInfo } from 'types';
import { calculateMinValue, calculateTime, formatToken, getLimitDataByGQL } from './utils';
import { getTotalLiquidity } from 'utils/pools';

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

  const poolContract = usePoolContract(toChainId, undefined, toWallet?.isPortkey);

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

  const checkDailyLimit = useCallback(
    function (input: BigNumber, { remain }: LimitDataProps, { fromChainId, toChainId, symbol }: ICrossInfo): boolean {
      if (remain.isZero()) {
        setModalTxt(
          t('have reached the daily limit', {
            fromChain: getNameByChainId(fromChainId),
            toChain: getNameByChainId(toChainId),
            tokenSymbol: symbol,
          }),
        );
        return true;
      }

      if (remain.lt(input)) {
        const amount = formatToken(remain, symbol);
        setModalTxt(
          t('have a daily limit and your current transaction', {
            fromChain: getNameByChainId(fromChainId),
            toChain: getNameByChainId(toChainId),
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
            fromChain: getNameByChainId(fromChainId),
            toChain: getNameByChainId(toChainId),
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
            fromChain: getNameByChainId(fromChainId),
            toChain: getNameByChainId(toChainId),
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

  const checkToLiquidity = useCallback(
    async (input: BigNumber, { fromChainId, toChainId, symbol }: ICrossInfo, tokenInfo?: TokenInfo) => {
      try {
        const totalLiquidity = await getTotalLiquidity({
          poolContract,
          tokenContract: {
            address: tokenInfo?.address,
            chainId: toChainId,
          },
          symbol: tokenInfo?.symbol,
        });

        const toLiquidity = divDecimals(totalLiquidity, tokenInfo?.decimals);

        if (toLiquidity.lt(input)) {
          const amount = formatToken(toLiquidity, symbol);
          setModalTxt(
            t(`Insufficient liquidity tip`, {
              fromChain: getNameByChainId(fromChainId),
              toChain: getNameByChainId(toChainId),
              tokenSymbol: symbol,
              amount,
            }),
          );
          return true;
        }
      } catch (error) {
        console.log(error, '=======checkToLiquidity');
      }
    },
    [poolContract, t],
  );

  const checkLimitAndRate = useCallback(
    async function (
      type: 'transfer' | 'swap',
      amount?: BigNumber | string | number | null,
      receiveItem?: CrossChainItem,
    ) {
      if ((!amount && type === 'transfer') || (type === 'swap' && !receiveItem)) {
        return true;
      }

      const input = new BigNumber(amount || receiveItem?.transferAmount || 0);
      const fromTokenInfo = getTokenInfo(fromChainId);
      const toTokenInfo = getTokenInfo(toChainId);
      const crossInfo: ICrossInfo = {
        toChainId: toChainId,
        toSymbol: toTokenInfo?.symbol,
        toDecimals: toTokenInfo?.decimals,
        fromChainId: fromChainId,
        fromDecimals: fromTokenInfo?.decimals,
        fromSymbol: fromTokenInfo?.symbol,
        symbol: fromTokenInfo?.symbol,
      };

      const result = await (isELFChain(fromChainId)
        ? getLimitDataByGQL(crossInfo, crossInfo?.fromDecimals)
        : getLimitDataByContract(type, crossInfo, crossInfo?.fromDecimals));

      const limitAndRateData = calculateMinValue(result);
      if (!limitAndRateData) return true;

      if (
        checkCapacity(input, limitAndRateData, crossInfo) ||
        checkDailyLimit(input, limitAndRateData, crossInfo) ||
        (await checkToLiquidity(input, crossInfo, toTokenInfo))
      ) {
        setVisible(true);
        return true;
      }
    },
    [getTokenInfo, fromChainId, toChainId, getLimitDataByContract, checkCapacity, checkDailyLimit, checkToLiquidity],
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
