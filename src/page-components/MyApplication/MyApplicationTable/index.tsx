import CommonTable from 'components/CommonTable';
import clsx from 'clsx';
import { formatSymbol } from 'utils/token';
import styles from './styles.module.less';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';
import { TMyApplicationItem } from 'types/api';
import { getApplicationDisplayInfo } from '../utils';
import { NO_APPLICATION } from 'constants/listingApplication';
import { DEFAULT_NULL_VALUE } from 'constants/misc';
import DisplayImage from 'components/DisplayImage';
import { TablePagination } from 'page-components/Transactions/components';
import IconFont from 'components/IconFont';
import { getChainIdByAPI, getChainName, getIconByChainId } from 'utils/chain';

const MyApplicationTableColumns = [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (symbol: string, item: TMyApplicationItem) => {
      const { chainTokenInfo } = getApplicationDisplayInfo(item);
      return (
        <div className="flex-row-center gap-4">
          <DisplayImage width={24} height={24} name={symbol} src={chainTokenInfo?.icon || ''} />
          <span className={clsx(styles['token-symbol'])}>{formatSymbol(symbol)}</span>
        </div>
      );
    },
  },
  {
    title: 'Chain',
    dataIndex: 'networkName',
    key: 'networkName',
    render: (_: any, item: TMyApplicationItem) => {
      const { chainTokenInfo } = getApplicationDisplayInfo(item);
      const iconProps = getIconByChainId(getChainIdByAPI(chainTokenInfo?.chainId || ''));
      return chainTokenInfo?.chainId ? (
        <div className="flex-row-center gap-4">
          <IconFont className={styles['network-icon']} type={iconProps?.type || ''} />
          <div>{getChainName(getChainIdByAPI(chainTokenInfo?.chainId))}</div>
        </div>
      ) : (
        DEFAULT_NULL_VALUE
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '112px',
    render: (_: any, item: TMyApplicationItem) => {
      const { chainTokenInfo, failReason } = getApplicationDisplayInfo(item);
      return chainTokenInfo?.status ? (
        <StatusBox status={chainTokenInfo?.status} failReason={failReason} />
      ) : (
        DEFAULT_NULL_VALUE
      );
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    align: 'right' as any,
    render: (_: any, item: TMyApplicationItem) => {
      const { chainTokenInfo } = getApplicationDisplayInfo(item);
      return chainTokenInfo?.status && chainTokenInfo.chainId ? (
        <ActionBox
          status={chainTokenInfo.status}
          symbol={item.symbol}
          tokenIcon={chainTokenInfo.icon}
          chainId={chainTokenInfo.chainId}
        />
      ) : (
        DEFAULT_NULL_VALUE
      );
    },
  },
];

export default function MyApplicationTable({
  applicationList,
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
}: {
  applicationList: TMyApplicationItem[];
  totalCount: number;
  maxResultCount: number;
  skipPageCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
}) {
  return (
    <>
      <CommonTable
        className={styles['my-application-table']}
        rowKey={'id'}
        dataSource={applicationList}
        columns={MyApplicationTableColumns}
        scroll={{ x: 670 }}
        emptyText={NO_APPLICATION}
        pagination={{ hideOnSinglePage: true, pageSize: maxResultCount }}
      />
      {totalCount > maxResultCount && (
        <TablePagination
          current={skipPageCount + 1}
          onChange={tableOnChange}
          pageSize={maxResultCount}
          total={totalCount}
          showSizeChanger={false}
        />
      )}
    </>
  );
}
