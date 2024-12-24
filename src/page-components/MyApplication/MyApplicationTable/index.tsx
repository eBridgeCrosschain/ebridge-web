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
import { useMemo } from 'react';
import { TablePagination } from 'page-components/Transactions/components';
import IconFont from 'components/IconFont';
import { getChainIdByAPI, getIconByChainId } from 'utils/chain';

export default function MyApplicationTable({
  applicationList,
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
  onResetList,
}: {
  applicationList: TMyApplicationItem[];
  totalCount: number;
  maxResultCount: number;
  skipPageCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
  onResetList?: () => Promise<void>;
}) {
  const MyApplicationTableColumns = useMemo(() => {
    return [
      {
        title: 'Token',
        dataIndex: 'symbol',
        key: 'symbol',
        render: (symbol: string, item: TMyApplicationItem) => {
          const { chainTokenInfo } = getApplicationDisplayInfo(item);
          return (
            <div className="flex-row-center gap-8">
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
          // TODO
          const iconProps = getIconByChainId(getChainIdByAPI(chainTokenInfo?.chainId || ''));
          return chainTokenInfo?.chainId ? (
            <div className="flex-row-center gap-8">
              <IconFont className={styles['network-icon']} type={iconProps?.type || ''} />
              {/* TODO */}
              {/* <div>{getChainName(getChainIdByAPI(chainTokenInfo?.chainId))}</div> */}
              <span>{chainTokenInfo?.chainName}</span>
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
        render: (_: any, item: TMyApplicationItem) => {
          const { chainTokenInfo, aelfChainIds, otherChainId, failTime } = getApplicationDisplayInfo(item);
          return chainTokenInfo?.status &&
            chainTokenInfo?.icon &&
            chainTokenInfo.chainId &&
            chainTokenInfo.chainName ? (
            <ActionBox
              status={chainTokenInfo.status}
              symbol={item.symbol}
              tokenIcon={chainTokenInfo.icon}
              aelfChainIds={aelfChainIds}
              otherChainId={otherChainId}
              chainName={chainTokenInfo.chainName}
              id={item.id}
              filedTime={failTime}
              resetList={onResetList}
            />
          ) : (
            DEFAULT_NULL_VALUE
          );
        },
      },
    ];
  }, [onResetList]);

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
