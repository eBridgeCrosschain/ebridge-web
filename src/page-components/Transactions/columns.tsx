import { Progress } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import CommonLink from 'components/CommonLink';
import CommonImage from 'components/CommonImage';
import IconFont from 'components/IconFont';
import { Trans } from 'react-i18next';
import { useHover } from 'react-use';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { CrossChainStatus } from 'types/misc';
import { formatNativeToken, getExploreLink, shortenString } from 'utils';
import { shortenAddressByAPI, getIconByChainId } from 'utils/chain';
import { unitConverter } from 'utils/converter';
import { formatTime } from 'utils/time';
import { formatSymbol } from 'utils/token';
import { arrowRightGrayIcon } from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.less';

function Info({
  isFrom = false,
  address,
  chainId,
  transactionId,
}: {
  isFrom?: boolean;
  address?: string;
  chainId: ChainId;
  transactionId?: string;
}) {
  const iconProps = getIconByChainId(chainId);

  return (
    <div className={clsx(styles['info-wrap'], 'flex-row-center', 'flex-row-between')}>
      <div className={clsx(styles['info-content'], 'flex-column')}>
        <div className={clsx(styles['info-address'], 'flex-row-center')}>
          <IconFont className={styles['info-address-icon']} type={iconProps?.type || ''} />
          <CommonLink
            className={styles['info-address-link']}
            isTagA
            href={getExploreLink(address || '', 'address', chainId)}>
            {shortenAddressByAPI(address || '', chainId)}
          </CommonLink>
        </div>
        {transactionId && (
          <div className={clsx(styles['info-txid'])}>
            <span>TXID: </span>
            <CommonLink isTagA href={getExploreLink(transactionId, 'transaction', chainId)}>
              {shortenString(transactionId, 6)}
            </CommonLink>
          </div>
        )}
      </div>
      {isFrom && <CommonImage className={styles['info-arrow']} src={arrowRightGrayIcon} />}
    </div>
  );
}

function Amount({ amount, token }: { amount?: number; token?: TokenInfo }) {
  const { symbol, decimals } = token || {};
  const tmpSymbol = formatNativeToken(symbol);
  return (
    <div>
      {unitConverter({ num: amount, minDecimals: decimals })} {formatSymbol(tmpSymbol)}
    </div>
  );
}

function FromTo({ items }: { items: CrossChainItem }) {
  const { progress, status, transferTime } = items;
  const [hoverable] = useHover((hovered: boolean) => {
    const success = status === CrossChainStatus.Received;
    return (
      <div className={clsx(styles['from-to-wrap'], 'flex-column', 'cursor-pointer')}>
        {transferTime && <div className={styles['transfer-time']}>{formatTime(transferTime)}</div>}
        <div
          className={clsx('flex-row-center', {
            [styles['from-to']]: !hovered,
            [styles['from-to-hovered']]: hovered,
            [styles['from-to-success']]: success,
            [styles['from-to-hovered-success']]: hovered && success,
          })}>
          {hovered ? (
            <div className={styles['progress-wrap']}>
              <div className={styles['progress-text']}>{Math.floor(progress ?? 0)} %</div>
              <Progress className={styles.progress} showInfo={false} percent={progress} size="small" strokeWidth={16} />
            </div>
          ) : (
            <Trans>{success ? 'Success' : 'Confirming'}</Trans>
          )}
        </div>
      </div>
    );
  });
  return hoverable;
}

const sendAmount: ColumnType<CrossChainItem> = {
  title: () => <Trans>Amount</Trans>,
  key: 'Send amount',
  width: 119,
  ellipsis: true,
  dataIndex: 'fromChainId',
  render: (_, item) => <Amount amount={item.transferAmount} token={item.transferToken} />,
};

const sendingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>From Address</Trans>,
  key: 'Sending address',
  width: 236,
  ellipsis: true,
  dataIndex: 'fromChainId',
  render: (fromChainId, item) => (
    <Info address={item.fromAddress} chainId={fromChainId} transactionId={item.transferTransactionId} isFrom />
  ),
};

const receivingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>To Address</Trans>,
  key: 'Receiving address',
  width: 236,
  ellipsis: true,
  dataIndex: 'toChainId',
  render: (toChainId, item) => (
    <Info address={item.toAddress} chainId={toChainId} transactionId={item.receiveTransactionId} />
  ),
};

const fromTo = (): ColumnType<CrossChainItem> => {
  return {
    title: () => <Trans>Sent At</Trans>,
    dataIndex: 'id',
    key: 'From - To',
    width: 236,
    ellipsis: true,
    render: (_, items) => {
      return <FromTo items={items} />;
    },
  };
};
const columns = {
  sendAmount,
  receivingAddress,
  sendingAddress,
  fromTo,
};

export default columns;
