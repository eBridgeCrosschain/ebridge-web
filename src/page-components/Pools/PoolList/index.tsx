import CommonTable from 'components/CommonTable';
import styles from './styles.module.less';
import Columns from './columns';
import { ColumnsType } from 'antd/lib/table';
import { APIPoolItem } from 'types/api';
import { useRouter } from 'next/router';
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
  {
    token: {
      chainId: 'Sepolia',
      address: '0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab',
      symbol: 'ELF',
      decimals: 8,
      id: '3a0c374c-2162-b126-e6fe-671d21a7bd37',
    },
    chainId: 'Sepolia',
    myTvlInUsd: '100',
    totalTvlInUsd: '100',
    tokenPrice: '1',
  },
];

const Pagination = { hideOnSinglePage: true, pageSize: 100 };

export default function PoolList() {
  const { push } = useRouter();
  return (
    <CommonTable
      pagination={Pagination}
      rowKey={'totalTvlInUsd'}
      className={styles.table}
      columns={columns}
      dataSource={MockList}
      scroll={{ x: 700 }}
      onRow={(record: APIPoolItem) => {
        return {
          onClick: () => push(`pool/${record.chainId}/${record.token?.symbol}`),
        };
      }}
    />
  );
}
