import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from 'i18n';
import { Trans } from 'react-i18next';
import clsx from 'clsx';
import { Input, Row } from 'antd';
import CommonModal from 'components/CommonModal';
import IconFont from 'components/IconFont';
import TokenLogo from 'components/TokenLogo';
import { formatSymbol } from 'utils/token';
import { TBridgeChainId } from 'constants/chain';
import styles from './styles.module.less';

type TToken<T> = T & {
  symbol: string;
  icon?: string;
  displaySymbol?: string;
};

interface ISelectTokenProps<T> {
  selectSymbol?: string;
  tokenList: TToken<T>[];
  chainId?: TBridgeChainId;
  hideAddToken?: boolean;
  onSelect: (token: TToken<T>) => void;
}

interface ISelectTokenModalProps<T> extends ISelectTokenProps<T> {
  open?: boolean;
  onClose: () => void;
}

function SelectToken<T>({ selectSymbol, tokenList, chainId, hideAddToken, onSelect }: ISelectTokenProps<T>) {
  const [searchList, setSearchList] = useState<TToken<T>[]>();
  const [value, setValue] = useState<string>();
  const { t } = useLanguage();

  const onSearch = useCallback(() => {
    if (value === undefined || typeof value !== 'string') return;
    setSearchList(
      tokenList.filter((i) => {
        return i.symbol.toUpperCase().includes(value.toUpperCase());
      }),
    );
  }, [tokenList, value]);

  useEffect(() => {
    if (value === '') onSearch();
  }, [onSearch, value]);

  return (
    <>
      <Input
        allowClear
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onPressEnter={onSearch}
        className={styles['input-search']}
        placeholder={t('Search token')}
        suffix={<IconFont onClick={onSearch} className="cursor-pointer" type="Icon-search" />}
      />
      <div className={clsx({ [styles['token-list']]: true, [styles['token-list-add-token']]: !hideAddToken })}>
        {(searchList || tokenList).map((item, k) => {
          return (
            <Row
              onClick={() => onSelect(item)}
              key={k}
              className={clsx('cursor-pointer', {
                [styles['token-item']]: true,
                [styles['token-item-selected']]: item.symbol === selectSymbol,
              })}>
              <TokenLogo className={styles['token-logo']} chainId={chainId} src={item.icon} symbol={item.symbol} />
              {formatSymbol(item.displaySymbol || item.symbol)}
            </Row>
          );
        })}
      </div>
      {!hideAddToken && (
        <div className={styles['bottom-row']}>
          <div className={clsx('flex-center', styles['row-body'])}>
            <a onClick={() => void 0}>
              <Trans>Add Token</Trans>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default function CommonSelectTokenModal<T>({ open, onClose, ...selectTokenProps }: ISelectTokenModalProps<T>) {
  const { t } = useLanguage();

  return (
    <CommonModal
      className={styles['select-modal']}
      onCancel={onClose}
      open={open}
      title={t('Select a token')}
      width="auto"
      type="pop-bottom">
      <SelectToken {...selectTokenProps} />
    </CommonModal>
  );
}
