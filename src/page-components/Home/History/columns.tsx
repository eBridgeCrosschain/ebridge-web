import { Progress } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import clsx from 'clsx';
import CommonLink from 'components/CommonLink';
import TokenLogo from 'components/TokenLogo';
import { Trans } from 'react-i18next';
import { useHover } from 'react-use';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { CrossChainStatus } from 'types/misc';
import { formatNativeToken, getExploreLink, shortenString } from 'utils';
import { getShortNameByChainId, shortenAddressByAPI } from 'utils/chain';
import { unitConverter } from 'utils/converter';
import { formatTime } from 'utils/time';
import styles from './styles.module.less';
import { formatSymbol } from 'utils/token';

function Address({ address, chainId }: { address?: string; chainId: ChainId }) {
  return (
    <CommonLink isTagA href={getExploreLink(address || '', 'address', chainId)}>
      {shortenAddressByAPI(address || '', chainId)}
    </CommonLink>
  );
}

function Transaction({ transactionId, chainId }: { transactionId: string; chainId?: ChainId }) {
  return (
    <CommonLink isTagA href={getExploreLink(transactionId, 'transaction', chainId)}>
      {shortenString(transactionId, 6)}
    </CommonLink>
  );
}

function Amount({ amount, chainId, token }: { amount?: number; chainId?: ChainId; token?: TokenInfo }) {
  const { symbol, decimals } = token || {};
  const tmpSymbol = formatNativeToken(symbol);
  return (
    <div className={clsx('row-center')}>
      <TokenLogo style={{ height: 20, width: 20, marginRight: '4px' }} chainId={chainId} symbol={tmpSymbol} />
      <div>
        {unitConverter({ num: amount, minDecimals: decimals })} {formatSymbol(tmpSymbol)}
      </div>
    </div>
  );
}

function FromTo({ items }: { items: CrossChainItem; isHeterogeneous?: boolean }) {
  const { progress, fromChainId, toChainId, status } = items;
  const [hoverable] = useHover((hovered: boolean) => {
    const success = status === CrossChainStatus.Received;
    return (
      <div
        className={clsx('row-center', 'cursor-pointer', {
          [styles['from-to']]: !hovered,
          [styles['from-to-hovered']]: hovered,
          [styles['from-to-success']]: success,
          [styles['from-to-hovered-success']]: hovered && success,
        })}>
        {hovered ? (
          <div className="flex-column">
            {Math.floor(progress ?? 0)} %
            <Progress className={styles.progress} showInfo={false} percent={progress} size="small" />
            {/* <div className={styles.tip}>
              {isHeterogeneous ? (
                <Trans tOptions={{ time: CrossChainTime.heterogeneous }}>
                  Estimated time of heterogenous cross-chain arrival is
                </Trans>
              ) : (
                <Trans tOptions={{ time: CrossChainTime.homogeneous }}>
                  Estimated time of homogeneous cross-chain arrival is
                </Trans>
              )}
            </div> */}
          </div>
        ) : (
          `${getShortNameByChainId(fromChainId)} - ${getShortNameByChainId(toChainId)}`
        )}
      </div>
    );
  });
  return hoverable;
}

const receiptID: ColumnType<any> = {
  title: 'Receipt ID',
  dataIndex: 'id',
  key: 'id',
  fixed: 'left',
  render: (id: string) => id.slice(25),
};

const sendAmount: ColumnType<CrossChainItem> = {
  title: () => <Trans>Amount</Trans>,
  key: 'Send amount',
  width: 140,
  dataIndex: 'fromChainId',
  render: (fromChainId, item) => (
    <Amount amount={item.transferAmount} token={item.transferToken} chainId={fromChainId} />
  ),
};

const acceptedAmount: ColumnType<CrossChainItem> = {
  title: () => <Trans>Amount Received</Trans>,
  key: 'Accepted amount',
  width: 140,
  dataIndex: 'toChainId',
  render: (toChainId, item) => {
    if (!item.receiveAmount) return null;
    return <Amount amount={item.receiveAmount} token={item.receiveToken} chainId={toChainId} />;
  },
};

const sendingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>From Address</Trans>,
  key: 'Sending address',
  width: 140,
  dataIndex: 'fromChainId',
  render: (fromChainId, item) => <Address address={item.fromAddress} chainId={fromChainId} />,
};

const receivingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>To Address</Trans>,
  key: 'Receiving address',
  width: 140,
  dataIndex: 'toChainId',
  render: (toChainId, item) => <Address address={item.toAddress} chainId={toChainId} />,
};
const sendTime: ColumnType<CrossChainItem> = {
  title: () => <Trans>Sent At</Trans>,
  dataIndex: 'transferTime',
  key: 'Send time',
  width: 110,
  render: (transferTime) => {
    if (!transferTime) return null;
    return formatTime(transferTime);
  },
};
const receivingTime: ColumnType<CrossChainItem> = {
  title: () => <Trans>Received At</Trans>,
  dataIndex: 'receiveTime',
  key: 'Receiving time',
  width: 110,
  render: (receiveTime) => {
    if (!receiveTime) return null;
    return formatTime(receiveTime);
  },
};
const sendTransaction: ColumnType<CrossChainItem> = {
  title: () => <Trans>Sending TXID</Trans>,
  dataIndex: 'transferTransactionId',
  key: 'Send transaction',
  width: 130,
  render: (transferTransactionId, item) => (
    <Transaction transactionId={transferTransactionId} chainId={item.fromChainId} />
  ),
};
const receiveTransaction: ColumnType<CrossChainItem> = {
  title: () => <Trans>Receiving TXID</Trans>,
  dataIndex: 'receiveTransactionId',
  key: 'Receive transaction',
  width: 140,
  render: (receiveTransactionId, item) => <Transaction transactionId={receiveTransactionId} chainId={item.toChainId} />,
};

const fromTo = (isHeterogeneous?: boolean): ColumnType<CrossChainItem> => {
  return {
    title: () => (
      <>
        <Trans>From</Trans> - <Trans>To</Trans>
      </>
    ),
    dataIndex: 'id',
    key: 'From - To',
    width: 150,
    render: (_, items) => {
      return <FromTo items={items} isHeterogeneous={isHeterogeneous} />;
    },
  };
};
const columns = {
  receiptID,
  sendAmount,
  acceptedAmount,
  receivingAddress,
  sendingAddress,
  sendTime,
  receivingTime,
  sendTransaction,
  receiveTransaction,
  fromTo,
};

export default columns;
