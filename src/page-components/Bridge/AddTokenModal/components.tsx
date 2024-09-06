import { TransactionResult } from '@aelf-react/types';
import { Row, Col, message, Alert, Steps, Progress } from 'antd';
import { request } from 'api';
import clsx from 'clsx';
import CommonButton from 'components/CommonButton';
import CommonLink from 'components/CommonLink';
import CommonModal from 'components/CommonModal';
import IconFont from 'components/IconFont';
import TokenLogo from 'components/TokenLogo';
import { ZERO } from 'constants/misc';
import { useCrossChainContract } from 'hooks/useContract';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChainId, TokenInfo } from 'types';
import { getExploreLink, shortenString } from 'utils';
import { getChainIdToMap, getNameByChainId } from 'utils/chain';
import { ContractBasic } from 'utils/contract';
import { CrossChainCreateToken, ValidateTokenInfoExists } from 'utils/crossChain';
import { txMessage } from 'utils/message';
import writeText from 'copy-to-clipboard';

import styles from './styles.module.less';
import { Trans } from 'react-i18next';
import { useLanguage } from 'i18n';

const Hundred = ZERO.plus(100);
const InquireTime = 5000;

export type StateTokenInfo = { [key in ChainId]?: TokenInfo };

export function TokenCard({ fromTokenInfo, chainId }: { fromTokenInfo: TokenInfo; chainId?: ChainId }) {
  return (
    <div className={styles['token-row']}>
      <div className={styles.title}>
        <Trans>Verify info</Trans>
      </div>
      <Row className={styles['token-card']}>
        <Col span={10} className="flex-column">
          <div className={styles['card-title']}>Symbol</div>
          {fromTokenInfo.symbol}
        </Col>
        <Col span={8} className="flex-column">
          <div className={styles['card-title']}>Decimals</div>
          {fromTokenInfo.decimals}
        </Col>
        <Col span={6} className="flex-column align-end">
          <div className="flex-column">
            <div className={styles['card-title']}>Logo</div>
            <TokenLogo className={styles['logo']} chainId={chainId} symbol={fromTokenInfo.symbol} />
          </div>
        </Col>
      </Row>
    </div>
  );
}

const maxProgress = 95;
export function TransactionModal({
  progress = 0,
  transactionResult,
  sendChainID,
}: {
  sendChainID?: ChainId;
  progress?: number;
  transactionResult?: TransactionResult;
}) {
  const { t } = useLanguage();
  const [autoProgress, setAutoProgress] = useState<number>(1);
  useEffect(() => {
    let p = 1;
    const timer = setInterval(() => {
      p = Math.min(p + (p > 60 ? 1 : 2), maxProgress);
      if (p === maxProgress) timer && clearInterval(timer);
      setAutoProgress(p);
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    };
  }, []);
  const tmpProgress = useMemo(
    () => Math.floor(autoProgress > progress ? autoProgress : progress),
    [autoProgress, progress],
  );
  return (
    <>
      <div className="flex-column-center">
        <Trans>{`Transaction is being processed, please don't close this window`}</Trans>
        <div className={styles['progress-row']}>
          <div className={styles['progress-text']} style={{ marginLeft: `${Math.max((tmpProgress ?? 0) - 4, 0)}%` }}>
            {tmpProgress ?? 0}%
          </div>
          <Progress className={styles.progress} width={30} percent={tmpProgress} showInfo={false} />
        </div>
      </div>
      <div className={clsx(styles['transaction-card'], 'flex-row-between')}>
        <div>
          <Trans>Transaction Id</Trans>
        </div>
        <div className="flex-row-center">
          <CommonLink isTagA href={getExploreLink(transactionResult?.TransactionId || '', 'transaction', sendChainID)}>
            {shortenString(transactionResult?.TransactionId || '', 6)}
          </CommonLink>
          <IconFont
            type="copy"
            onClick={() => {
              writeText(transactionResult?.TransactionId || '');
              message.success(t('Copy Success'));
            }}
          />
        </div>
      </div>
    </>
  );
}

export function SyncToken({
  account,
  tokenOptions,
  fromTokenContract,
  toTokenContract,
  addToken,
}: {
  account?: string;
  fromTokenContract?: ContractBasic;
  toTokenContract?: ContractBasic;
  addToken: (symbol: string, tokenInfo: StateTokenInfo) => void;
  tokenOptions: {
    toChainId?: ChainId;
    fromChainId?: ChainId;
    fromTokenInfo: any;
    toTokenInfo: any;
    tokenNotExist: boolean;
    currentTokenInfo?: TokenInfo;
    isSync: boolean;
  };
}) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState<boolean>();
  const [visibleModal, setVisibleModal] = useState<boolean>();
  const [crossChainProgress, setCrossChainProgress] = useState<number>();
  const timer = useRef<NodeJS.Timer>();
  const [transactionResult, setTransactionResult] = useState<TransactionResult>();

  const { currentTokenInfo, fromTokenInfo, toChainId, fromChainId } = tokenOptions;
  const { sendChainID, receiveId, sendTokenContract, receiveTokenContract } = useMemo(() => {
    if (!fromTokenInfo)
      return {
        receiveTokenContract: fromTokenContract,
        sendTokenContract: toTokenContract,
        sendChainID: toChainId,
        receiveId: fromChainId,
      };
    return {
      receiveTokenContract: toTokenContract,
      sendTokenContract: fromTokenContract,
      sendChainID: fromChainId,
      receiveId: toChainId,
    };
  }, [fromChainId, fromTokenContract, fromTokenInfo, toChainId, toTokenContract]);
  const sendCrossChainContract = useCrossChainContract(sendChainID);
  const onGetCrossChainIndexing = useCallback(
    async (sendChainID: ChainId, receiveId: ChainId, height: number) => {
      const progress = await request.cross.getCrossChainIndexing({
        params: {
          fromChainId: getChainIdToMap(sendChainID),
          toChainId: getChainIdToMap(receiveId),
          height: height,
        },
      });
      if (!isNaN(progress)) {
        setCrossChainProgress(progress);
        if (Hundred.lte(progress)) {
          message.success(t('Request submitted. Please synchronize the token info'));
          setVisibleModal(false);
          timer.current && clearInterval(timer.current);
        }
      }
    },
    [t],
  );
  const onValidateTokenInfoExists = useCallback(async () => {
    if (loading || !(sendTokenContract && account && currentTokenInfo && sendChainID && receiveId)) return;
    setLoading(true);
    try {
      const req = await ValidateTokenInfoExists({
        contract: sendTokenContract,
        account,
        tokenInfo: currentTokenInfo,
      });
      if (!req?.error) {
        setTransactionResult(req);
        setCrossChainProgress(0);
        setVisibleModal(true);
        timer.current && clearInterval(timer.current);
        timer.current = setInterval(() => {
          onGetCrossChainIndexing(sendChainID, receiveId, req.BlockNumber);
        }, InquireTime);
      } else {
        txMessage({ req, chainId: sendChainID });
      }
    } catch (error) {
      console.debug(error, '======ValidateTokenInfoExists');
    }
    setLoading(false);
  }, [loading, sendTokenContract, account, currentTokenInfo, sendChainID, receiveId, onGetCrossChainIndexing]);

  const onCrossChainCreateToken = useCallback(async () => {
    if (
      loading ||
      !(
        receiveId &&
        sendCrossChainContract &&
        receiveTokenContract &&
        sendTokenContract &&
        sendChainID &&
        transactionResult
      )
    )
      return;
    setLoading(true);
    try {
      const req = await CrossChainCreateToken({
        transactionId: transactionResult.TransactionId,
        sendChainID,
        sendCrossChainContract,
        receiveTokenContract,
        sendTokenContract,
      });
      txMessage({ req, chainId: receiveId });
      if (!req.error && currentTokenInfo?.symbol) {
        addToken(currentTokenInfo?.symbol, {
          [sendChainID]: currentTokenInfo,
          [receiveId]: currentTokenInfo,
        });
      }
    } catch (error) {
      console.debug(error, '======ValidateTokenInfoExists');
    }
    setLoading(false);
  }, [
    addToken,
    currentTokenInfo,
    loading,
    receiveId,
    receiveTokenContract,
    sendChainID,
    sendCrossChainContract,
    sendTokenContract,
    transactionResult,
  ]);
  useEffect(() => {
    return () => {
      timer.current && clearInterval(timer.current);
    };
  }, []);

  const isCreateToken = transactionResult && Hundred.lte(crossChainProgress ?? 0);
  return (
    <div className={styles['token-row']}>
      <div className={styles.title}>
        <Trans>Synchronize token info</Trans>
      </div>
      <div className={styles['notice-card']}>
        <Alert
          showIcon
          type="warning"
          className={styles['notice-alert']}
          message={`${t('Please note')} ${t('This token does not exist on', { chain: getNameByChainId(receiveId) })}`}
          description={t('To add a new token, you need to initiate 2 transactions here to create the token on', {
            chain: getNameByChainId(receiveId),
          })}
        />
      </div>
      <Steps
        style={language.includes('zh') ? { marginLeft: 40, marginRight: 40 } : {}}
        direction="horizontal"
        className={styles['add-steps']}
        size="small"
        current={isCreateToken ? 1 : 0}>
        <Steps.Step title={`${t('Transaction')} 1`} description={t('Initiate Synchronization')} />
        <Steps.Step title={`${t('Transaction')} 2`} description={t('Synchronize token info')} />
      </Steps>
      <div className={styles['add-tip']}>* {t('Create Tip', { fee: '1 ELF', time: '150 S' })}</div>
      <CommonModal width="auto" className={styles['indexing-modal']} visible={transactionResult && visibleModal}>
        <TransactionModal
          sendChainID={sendChainID}
          progress={crossChainProgress}
          transactionResult={transactionResult}
        />
      </CommonModal>
      <CommonButton
        onClick={transactionResult ? onCrossChainCreateToken : onValidateTokenInfoExists}
        loading={loading}
        className={styles['add-btn']}
        type="primary">
        {isCreateToken ? t('Synchronize token info') : t('Initiate Synchronization')}
      </CommonButton>
    </div>
  );
}
