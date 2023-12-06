import { Input, Row, Empty } from 'antd';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';
import TokenLogo from 'components/TokenLogo';
import { useWallet } from 'contexts/useWallet/hooks';
import { CurrentWhitelistItem, useCurrentWhitelist } from 'hooks/whitelist';
import { useLanguage } from 'i18n';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { useHomeContext } from '../HomeContext';
import { setSelectModal, setAddModal, setSelectToken, homeModalDestroy } from '../HomeContext/actions';
import styles from './styles.module.less';
function SelectToken() {
  const [{ selectToken }, { dispatch }] = useHomeContext();
  const { fromWallet, isHomogeneous } = useWallet();
  const { chainId, account } = fromWallet || {};
  const [searchList, setSearchList] = useState<CurrentWhitelistItem[]>();
  const [value, setValue] = useState<string>();
  const allWhitelist = useCurrentWhitelist();
  const { t } = useLanguage();

  const onSearchToken = (keyword = '') => {
    if (keyword === undefined) return;
    setSearchList(
      allWhitelist.filter((i) => {
        return typeof keyword === 'string' && i.symbol.toUpperCase().includes(keyword.trim().toUpperCase());
      }),
    );
  };

  useEffect(() => {
    if (value === '') onSearchToken(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWhitelist]);
  return (
    <>
      <Input
        allowClear
        value={value}
        onChange={(e) => {
          onSearchToken(e.target.value);
          setValue(e.target.value);
        }}
        className={styles['input-search']}
        placeholder={t('Select a token')}
      />
      <div className={clsx({ [styles['token-list']]: true, [styles['token-list-add']]: isHomogeneous && account })}>
        {(searchList || allWhitelist).length > 0 ? (
          (searchList || allWhitelist).map((i, k) => {
            return (
              <Row
                onClick={() => {
                  dispatch(setSelectToken(i));
                  dispatch(homeModalDestroy());
                }}
                key={k}
                className={clsx('cursor-pointer', {
                  [styles['token-item']]: true,
                  [styles['token-item-selected']]: i.symbol === selectToken?.symbol,
                })}>
                <TokenLogo className={styles['token-logo']} chainId={chainId} symbol={i.symbol} />
                {i.symbol}
              </Row>
            );
          })
        ) : (
          <div className={styles['empty-container']}>
            <Empty />
          </div>
        )}
      </div>
      {isHomogeneous && account && (
        <div className={styles['bottom-row']}>
          <div className={clsx('flex-center', styles['row-body'])}>
            <div>
              <Trans>{`Can't find your token`}</Trans>
              <a onClick={() => dispatch(setAddModal(true))}>
                <Trans>Import custom tokens</Trans>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SelectTokenModal() {
  const [{ selectModal }, { dispatch }] = useHomeContext();
  const { t } = useLanguage();
  return (
    <CommonModal
      className={styles['select-modal']}
      onCancel={() => dispatch(setSelectModal(false))}
      visible={selectModal}
      title={t('Select a token')}
      width="auto"
      type="pop-bottom">
      <SelectToken />
    </CommonModal>
  );
}
