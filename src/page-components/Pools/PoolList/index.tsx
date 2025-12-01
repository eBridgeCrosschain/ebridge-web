import CommonTable from 'components/CommonTable';
import styles from './styles.module.less';
import Columns from './columns';
import { ColumnsType } from 'antd/lib/table';
import { APIPoolItem } from 'types/api';
import { useRouter } from 'next/router';
import { usePoolList } from 'hooks/pools';
import { useMemo, useState } from 'react';
import { ZERO } from 'constants/misc';
import { formatSymbolAndNativeToken } from 'utils/token';
import { Checkbox, Row } from 'antd';
import { useLanguage } from 'i18n';
import clsx from 'clsx';
import { useActiveAddresses } from 'hooks/web3';
const columns: ColumnsType<any> = [Columns.token, Columns.network, Columns.yourLiquidity, Columns.totalLiquidity];

const Pagination = { hideOnSinglePage: true, pageSize: 100 };

export default function PoolList() {
  const { t } = useLanguage();
  const { push } = useRouter();
  const [checked, setChecked] = useState(false);
  const { poolList } = usePoolList();
  const activeAddresses = useActiveAddresses();
  const sortList = useMemo(
    () =>
      poolList?.items.filter((i) => {
        if (checked) return ZERO.lt(i.myTvlInUsd ?? 0);
        return true;
      }),
    [checked, poolList?.items],
  );
  return (
    <>
      <Row className={clsx(styles['check-box-row'], 'flex-row-center')}>
        <Checkbox
          disabled={!activeAddresses}
          className={styles['check-box']}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
          }}
        />
        <div>{t('Only show my positions')}</div>
      </Row>
      <CommonTable
        pagination={Pagination}
        rowKey={(item: APIPoolItem) => item?.chainId + item?.token?.symbol}
        className={clsx(styles.table, Array.isArray(sortList) && sortList.length > 0 ? null : styles['table-empty'])}
        columns={columns}
        dataSource={sortList}
        scroll={{ x: 700 }}
        emptyText={t('You currently don’t have any positions in pools.')}
        onRow={(record: APIPoolItem) => {
          return {
            onClick: () => push(`pool/${record.chainId}/${formatSymbolAndNativeToken(record.token?.symbol)}`),
          };
        }}
      />
    </>
  );
}
