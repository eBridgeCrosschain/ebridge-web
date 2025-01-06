import { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import CommonLink from 'components/CommonLink';
import DynamicArrow from 'components/DynamicArrow';
import CommonImage from 'components/CommonImage';
import CommonSelectTokenModal from 'components/CommonSelectTokenModal';
import TokenRow from '../../TokenRow';
import { checkFilled16Icon, closeFilled16Icon } from 'assets/images';
import { TTokenConfig, TTokenItem } from 'types/listingApplication';
import { AwakenHost } from 'constants/index';
import { LISTING_TOKEN_TIP } from 'constants/listingApplication';
import styles from './styles.module.less';
import { TApplicationTokenStatus } from 'types/api';

interface ITokenSelectProps {
  className?: string;
  token?: TTokenItem;
  tokenList: TTokenItem[];
  tokenConfig?: TTokenConfig;
  placeholder?: string;
  selectCallback?: (item: TTokenItem) => void;
}

export default function TokenSelect({
  className,
  token,
  tokenList,
  tokenConfig,
  placeholder,
  selectCallback,
}: ITokenSelectProps) {
  const [isShowTokenSelectModal, setIsShowTokenSelectModal] = useState(false);

  const formatTokenList = useMemo(() => {
    const _list: Array<TTokenItem & { isShowSuffix: boolean; disable: boolean }> = [];
    tokenList.forEach((item) => {
      _list.push({
        ...item,
        isShowSuffix: item.status !== TApplicationTokenStatus.Available,
        disable: item.status !== TApplicationTokenStatus.Available,
      });
    }, []);

    return _list;
  }, [tokenList]);

  const getInfoValidateIcon = useCallback((isPass: boolean) => {
    return (
      <CommonImage
        className={styles['token-selected-info-card-row-icon']}
        src={isPass ? checkFilled16Icon : closeFilled16Icon}
      />
    );
  }, []);

  const onSelectToken = useCallback(
    async (item: TTokenItem) => {
      if (item?.status !== TApplicationTokenStatus.Available) {
        return;
      }
      setIsShowTokenSelectModal(false);
      selectCallback?.(item);
    },
    [selectCallback],
  );

  return (
    <>
      <div className={styles['token-selected-wrapper']}>
        <div className={clsx(styles['token-selected'], className)} onClick={() => setIsShowTokenSelectModal(true)}>
          {token ? (
            <TokenRow symbol={token.symbol} name={token.name} icon={token.icon} />
          ) : (
            <span className={styles['token-selected-placeholder']}>{placeholder}</span>
          )}
          <DynamicArrow isExpand={isShowTokenSelectModal} />
        </div>

        {token && (
          <div className={styles['token-selected-info-card']}>
            {!!tokenConfig?.liquidityInUsd && tokenConfig.liquidityInUsd !== '0' && (
              <div className={styles['token-selected-info-card-row']}>
                <div className={styles['token-selected-info-card-row-content']}>
                  {getInfoValidateIcon(
                    !!token?.liquidityInUsd &&
                      parseFloat(token.liquidityInUsd) > parseFloat(tokenConfig.liquidityInUsd),
                  )}
                  <span>{`Liquidity > $${tokenConfig.liquidityInUsd}`}</span>
                </div>
                <CommonLink className={styles['token-selected-info-card-row-link']} showIcon={false} href={AwakenHost}>
                  Add Liquidity
                </CommonLink>
              </div>
            )}
            {!!tokenConfig?.holders && (
              <div className={styles['token-selected-info-card-row']}>
                <div className={styles['token-selected-info-card-row-content']}>
                  {getInfoValidateIcon(!!token?.holders && token.holders > tokenConfig.holders)}
                  <span>{`Holders > ${tokenConfig.holders}`}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CommonSelectTokenModal
        hideAddToken
        remindContent={LISTING_TOKEN_TIP}
        open={isShowTokenSelectModal}
        selectSymbol={token?.symbol}
        tokenList={formatTokenList}
        onSelect={onSelectToken}
        onClose={() => setIsShowTokenSelectModal(false)}
      />
    </>
  );
}
