import { Pagination, PaginationProps, Select, SelectProps } from 'antd';
import clsx from 'clsx';
import CommonSelect from 'components/CommonSelect';
import useMediaQueries from 'hooks/useMediaQueries';
import { useLanguage } from 'i18n';
import { useTranslation } from 'react-i18next';
import { NetworkType } from 'types';
import { CrossChainStatus } from 'types/misc';
import styles from './styles.module.less';
const statusList = Object.entries(CrossChainStatus)
  .filter(([, value]) => typeof value !== 'number')
  .map(([value, title]) => ({ value, title }));

export function StatusSelect(props: SelectProps) {
  const { t } = useLanguage();
  return (
    <CommonSelect allowClear className={styles.select} placeholder={t('Transaction Status')} {...props}>
      {statusList.map((i) => {
        return (
          <Select.Option key={i.value} value={i.value}>
            {t(i.title as string)}
          </Select.Option>
        );
      })}
    </CommonSelect>
  );
}

export function NetworkSelect({
  networkList,
  ...props
}: SelectProps & {
  networkList: NetworkType[];
}) {
  return (
    <CommonSelect className={styles.select} {...props} allowClear>
      {networkList.map((i) => {
        return (
          <Select.Option key={i.info.chainId} value={i.info.chainId}>
            {i.title}
          </Select.Option>
        );
      })}
    </CommonSelect>
  );
}

export function TablePagination(props: PaginationProps) {
  const isMd = useMediaQueries('md');
  const { t } = useTranslation();
  return (
    <div className={clsx(styles.pagination, 'flex-row-center', isMd ? 'flex-center' : 'flex-row-between')}>
      {!isMd && <div className={styles['pagination-total']}>{t('records in total', { total: props.total })}</div>}
      <Pagination {...props} />
    </div>
  );
}
