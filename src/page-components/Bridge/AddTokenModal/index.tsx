import { Input, Button, Col, message } from 'antd';
import CommonButton from 'components/CommonButton';
import CommonModal from 'components/CommonModal';
import { useWallet } from 'contexts/useWallet/hooks';
import { addWhitelist } from 'contexts/useWhitelist/actions';
import { useWhitelistActions } from 'contexts/useWhitelist/hooks';
import { useTokenContract } from 'hooks/useContract';
import { useUserAddedToken } from 'hooks/whitelist';
import { useLanguage } from 'i18n';
import React, { useCallback, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { unityTokenInfo } from 'utils';
import { isSymbol } from 'utils/reg';
import { useHomeContext } from '../HomeContext';
import { setAddModal, setSelectToken } from '../HomeContext/actions';
import { useHomeActions } from '../HomeContext/hooks';
import { StateTokenInfo, SyncToken, TokenCard } from './components';
import styles from './styles.module.less';
function AddToken() {
  const [loading, setLoading] = useState<boolean>();
  const [symbol, setSymbol] = useState<string>();
  const { fromWallet, toWallet } = useWallet();
  const { dispatch: homoDispatch } = useHomeActions();
  const fromChainId = fromWallet?.chainId;
  const toChainId = toWallet?.chainId;
  const fromTokenContract = useTokenContract(fromChainId);
  const toTokenContract = useTokenContract(toChainId);
  const [tokenInfo, setTokenInfo] = useState<StateTokenInfo>();
  const { dispatch } = useWhitelistActions();
  const getTokenInfo = useCallback(async () => {
    if (!symbol || !isSymbol(symbol) || loading || !fromChainId || !toChainId) return;
    setLoading(true);
    try {
      const [from, to] = await Promise.all([
        fromTokenContract?.callViewMethod('GetTokenInfo', [symbol]),
        toTokenContract?.callViewMethod('GetTokenInfo', [symbol]),
      ]);
      setTokenInfo({
        [fromChainId]: unityTokenInfo(from),
        [toChainId]: unityTokenInfo(to),
      });
    } catch (error) {
      console.debug(error, '====error');
    }
    setLoading(false);
  }, [fromChainId, fromTokenContract, loading, symbol, toChainId, toTokenContract]);

  const tokenOptions = useMemo(() => {
    const fromTokenInfo = fromChainId ? tokenInfo?.[fromChainId] : undefined;
    const toTokenInfo = toChainId ? tokenInfo?.[toChainId] : undefined;
    const tokenNotExist = !!(tokenInfo && fromChainId && toChainId && !fromTokenInfo && !toTokenInfo);
    const currentTokenInfo = fromTokenInfo || toTokenInfo;
    const isSync = !fromTokenInfo || !toTokenInfo;
    return { fromChainId, toChainId, fromTokenInfo, toTokenInfo, tokenNotExist, currentTokenInfo, isSync };
  }, [fromChainId, toChainId, tokenInfo]);
  const { currentTokenInfo, tokenNotExist, isSync } = tokenOptions;
  const isAdded = useUserAddedToken(currentTokenInfo?.symbol || symbol);
  const { t } = useLanguage();
  const addToken = useCallback(
    (symbol: string, tokenInfo: StateTokenInfo) => {
      dispatch(addWhitelist({ [symbol]: { ...tokenInfo } }));
      homoDispatch(setAddModal(false));
      homoDispatch(
        setSelectToken({
          symbol,
          ...tokenInfo,
        }),
      );
      message.success(t('Custom token imported'));
    },
    [dispatch, homoDispatch, t],
  );
  return (
    <>
      <Col span={24} className={styles['input-row']}>
        <div className={styles.title}>Token Symbol</div>
        <div className="flex-row">
          <Col flex={1}>
            <Input
              placeholder={t('Please enter')}
              onChange={(e) => {
                setSymbol(e.target.value);
                tokenInfo && setTokenInfo(undefined);
              }}
            />
          </Col>
          <Col offset={1}>
            <Button disabled={!!isAdded} loading={loading} onClick={getTokenInfo}>
              {isAdded ? t('Added') : t('Confirm2')}
            </Button>
          </Col>
        </div>
        {tokenNotExist ? (
          <div className={styles['error-tip']}>
            <Trans>Custom token does not exist</Trans>
          </div>
        ) : (
          !!currentTokenInfo && (
            <>
              <TokenCard fromTokenInfo={currentTokenInfo} chainId={fromChainId} />
              {isSync ? (
                <SyncToken
                  account={fromWallet?.account || toWallet?.account}
                  tokenOptions={tokenOptions}
                  fromTokenContract={fromTokenContract}
                  toTokenContract={toTokenContract}
                  addToken={addToken}
                />
              ) : (
                <CommonButton
                  className={styles['add-btn']}
                  onClick={() => {
                    if (!currentTokenInfo?.symbol || !tokenInfo) return;
                    addToken(currentTokenInfo?.symbol, tokenInfo);
                  }}
                  type="primary">
                  {t('Import')}
                </CommonButton>
              )}
            </>
          )
        )}
      </Col>
    </>
  );
}
export default function AddTokenModal() {
  const [{ addModal }, { dispatch }] = useHomeContext();
  const { t } = useLanguage();
  return (
    <CommonModal
      className={styles['add-modal']}
      onCancel={() => dispatch(setAddModal(false))}
      visible={addModal}
      title={t('Import custom tokens')}
      width="auto">
      <AddToken />
    </CommonModal>
  );
}
