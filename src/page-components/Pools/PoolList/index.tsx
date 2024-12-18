import CommonTable from 'components/CommonTable';
import styles from './styles.module.less';
import Columns from './columns';
import { ColumnsType } from 'antd/lib/table';
import { APIPoolItem } from 'types/api';
const columns: ColumnsType<any> = [Columns.token, Columns.network, Columns.yourLiquidity, Columns.totalLiquidity];

export const MockList: APIPoolItem[] = [
  {
    token: {
      chainId: 'SideChain_tDVW',
      address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      symbol: 'USDT',
      decimals: 6,
      id: '3a0c374c-2162-b126-e6fe-671d21a7bd37',
    },
    chainId: 'SideChain_tDVW',
    myTvlInUsd: '100',
    totalTvlInUsd: '100',
    tokenPrice: '1',
  },
  {
    token: {
      chainId: 'SideChain_tDVW',
      address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      symbol: 'ELF',
      decimals: 8,
      id: '3a0c374c-2162-b126-e6fe-671d21a7bd37',
    },
    chainId: 'SideChain_tDVW',
    myTvlInUsd: '100',
    totalTvlInUsd: '100',
    tokenPrice: '1',
  },
];

const Pagination = { hideOnSinglePage: true, pageSize: 100 };

export default function PoolList() {
  return (
    <CommonTable
      pagination={Pagination}
      rowKey={'id'}
      className={styles.table}
      columns={columns}
      dataSource={MockList}
      scroll={{ x: true }}
    />
  );
}
