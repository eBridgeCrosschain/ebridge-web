import CommonTable from 'components/CommonTable';
import styles from './styles.module.less';
import Columns from './columns';
import { ColumnsType } from 'antd/lib/table';
import { APIPoolItem } from 'types/api';
import { useRouter } from 'next/router';
import { usePoolList } from 'hooks/pools';
import { useMemo } from 'react';
import { ZERO } from 'constants/misc';
const columns: ColumnsType<any> = [Columns.token, Columns.network, Columns.yourLiquidity, Columns.totalLiquidity];

const Pagination = { hideOnSinglePage: true, pageSize: 100 };

export default function PoolList() {
  const { push } = useRouter();

  const { poolList } = usePoolList();
  const sortList = useMemo(
    () =>
      poolList?.items.sort((a, b) =>
        ZERO.plus(b.totalTvlInUsd ?? 0)
          .minus(a.totalTvlInUsd ?? 0)
          .toNumber(),
      ),
    [poolList?.items],
  );
  return (
    <CommonTable
      pagination={Pagination}
      rowKey={(item: APIPoolItem) => item?.chainId + item?.token?.symbol}
      className={styles.table}
      columns={columns}
      dataSource={sortList}
      scroll={{ x: 700 }}
      onRow={(record: APIPoolItem) => {
        return {
          onClick: () => push(`pool/${record.chainId}/${record.token?.symbol}`),
        };
      }}
    />
  );
}
