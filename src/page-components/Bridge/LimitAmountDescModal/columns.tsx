import { useMemo } from 'react';
import { useLanguage } from 'i18n';
import { ReceiptRateLimitsInfo } from './contants';
import { ChainId } from 'types';

import styles from './styles.module.less';
import BigNumber from 'bignumber.js';
import useMediaQueries from 'hooks/useMediaQueries';
import { formatSymbol } from 'utils/token';

export function useReceiptColumns() {
  const { t } = useLanguage();
  const isMd = useMediaQueries('md');

  return useMemo(
    () => [
      {
        title: t('eBridge limit rules Token'),
        width: isMd ? 86 : 140,
        key: 'token',
        dataIndex: 'token',
        render: (token: string) => <span className={styles['table-data']}>{formatSymbol(token)}</span>,
      },
      {
        title: t('eBridge limit rules Allowance'),
        key: 'allowance',
        dataIndex: 'allowance',
        render: (allowance: number, item: { token: string; allowance: number }) => (
          <span className={styles['table-data']}>
            {t('About allowance', {
              allowance: new BigNumber(allowance).toFormat(),
              tokenSymbol: formatSymbol(item.token),
            })}
          </span>
        ),
      },
    ],
    [isMd, t],
  );
}

export function useSwapColumns() {
  const { t } = useLanguage();
  const isMd = useMediaQueries('md');

  return useMemo(
    () => [
      {
        title: t('Rate limit Token'),
        width: isMd ? 86 : 140,
        key: 'token',
        dataIndex: 'token',
        render: (token: string) => <span className={styles['table-data']}>{formatSymbol(token)}</span>,
      },
      {
        title: t('Rate limit Attributes'),
        key: 'allowance',
        dataIndex: 'allowance',
        render: (fromChain: ChainId, { capacity, token, refillRate, maximumTimeConsumed }: ReceiptRateLimitsInfo) => {
          const bigCapacity = new BigNumber(capacity).toFormat();
          const bigRefillRate = new BigNumber(refillRate).toFormat();
          token = formatSymbol(token);
          return (
            <span className={styles['table-data']}>
              {t('Rate limit capacity', { capacity: bigCapacity, token })}
              <br />
              {t('Rate limit refill rate', { refillRate: bigRefillRate, token })}
              <span className={styles['table-data-sub']}>
                {t('Rate limit refill rate desc', {
                  token,
                  maximumTimeConsumed,
                  capacity: bigCapacity,
                })}
              </span>
            </span>
          );
        },
      },
    ],
    [isMd, t],
  );
}
