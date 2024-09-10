import type { ColumnType } from 'antd/lib/table';
import CommonLink from 'components/CommonLink';
import { Trans } from 'react-i18next';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { formatNativeToken, getExploreLink, shortenString } from 'utils';
import { getShortNameByChainId, shortenAddressByAPI } from 'utils/chain';
import { unitConverter } from 'utils/converter';
import { formatTime } from 'utils/time';
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
    <div>
      {unitConverter({ num: amount, minDecimals: decimals })} {formatSymbol(tmpSymbol)}
    </div>
  );
}

function FromTo({ items }: { items: CrossChainItem }) {
  const { fromChainId, toChainId } = items;
  return (
    <div>
      {getShortNameByChainId(fromChainId)} - {getShortNameByChainId(toChainId)}
    </div>
  );
}

const sendAmount: ColumnType<CrossChainItem> = {
  title: () => <Trans>Amount</Trans>,
  key: 'Send amount',
  width: 100,
  ellipsis: true,
  dataIndex: 'fromChainId',
  render: (fromChainId, item) => (
    <Amount amount={item.transferAmount} token={item.transferToken} chainId={fromChainId} />
  ),
};

const acceptedAmount: ColumnType<CrossChainItem> = {
  title: () => <Trans>Amount Received</Trans>,
  key: 'Accepted amount',
  width: 100,
  ellipsis: true,
  dataIndex: 'toChainId',
  render: (toChainId, item) => {
    if (!item.receiveAmount) return null;
    return <Amount amount={item.receiveAmount} token={item.receiveToken} chainId={toChainId} />;
  },
};

const sendingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>From Address</Trans>,
  key: 'Sending address',
  width: 100,
  ellipsis: true,
  dataIndex: 'fromChainId',
  render: (fromChainId, item) => <Address address={item.fromAddress} chainId={fromChainId} />,
};

const receivingAddress: ColumnType<CrossChainItem> = {
  title: () => <Trans>To Address</Trans>,
  key: 'Receiving address',
  width: 100,
  ellipsis: true,
  dataIndex: 'toChainId',
  render: (toChainId, item) => <Address address={item.toAddress} chainId={toChainId} />,
};
const sendTime: ColumnType<CrossChainItem> = {
  title: () => <Trans>Sent At</Trans>,
  dataIndex: 'transferTime',
  key: 'Send time',
  width: 100,
  ellipsis: true,
  render: (transferTime) => {
    if (!transferTime) return null;
    return formatTime(transferTime);
  },
};
const receivingTime: ColumnType<CrossChainItem> = {
  title: () => <Trans>Receive At</Trans>,
  dataIndex: 'receiveTime',
  key: 'Receiving time',
  width: 100,
  ellipsis: true,
  render: (receiveTime) => {
    if (!receiveTime) return null;
    return formatTime(receiveTime);
  },
};
const sendTransaction: ColumnType<CrossChainItem> = {
  title: () => <Trans>Sending TXID</Trans>,
  dataIndex: 'transferTransactionId',
  key: 'Send transaction',
  width: 100,
  ellipsis: true,
  render: (transferTransactionId, item) => (
    <Transaction transactionId={transferTransactionId} chainId={item.fromChainId} />
  ),
};
const receiveTransaction: ColumnType<CrossChainItem> = {
  title: () => <Trans>Receiving TXID</Trans>,
  dataIndex: 'receiveTransactionId',
  key: 'Receive transaction',
  width: 100,
  ellipsis: true,
  render: (receiveTransactionId, item) => <Transaction transactionId={receiveTransactionId} chainId={item.toChainId} />,
};

const fromTo = (): ColumnType<CrossChainItem> => {
  return {
    title: () => (
      <>
        <Trans>From Chain</Trans> - <Trans>To Chain</Trans>
      </>
    ),
    dataIndex: 'id',
    key: 'From - To',
    width: 100,
    ellipsis: true,
    render: (_, items) => {
      return <FromTo items={items} />;
    },
  };
};
const columns = {
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
