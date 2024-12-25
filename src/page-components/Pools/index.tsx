import { memo, useMemo } from 'react';
import styles from './styles.module.less';
import { Col, Row } from 'antd';
import clsx from 'clsx';
import PoolOverviewCard, { TPoolOverviewCardProps } from './PoolOverviewCard';
import PoolList from './PoolList';
import useMediaQueries from 'hooks/useMediaQueries';
import { usePoolOverview } from 'hooks/pools';
import { TPoolOverview } from 'types/api';
import { unitConverter } from 'utils/converter';

const OverviewCardList: (TPoolOverviewCardProps & {
  key: keyof TPoolOverview;
})[] = [
  {
    title: 'Total TVL',
    tooltipTitle: 'The total value of all assets locked in liquidity pools across eBridge.',
    key: 'totalTvlInUsd',
  },
  {
    title: 'Your Total Liquidity',
    tooltipTitle: 'The total value of the liquidity you have added to all pools on eBridge.',
    key: 'myTotalTvlInUsd',
  },
  { title: 'Pools', tooltipTitle: 'The number of liquidity pools currently active on eBridge.', key: 'poolCount' },
  {
    title: 'Tokens',
    tooltipTitle: 'The number of different tokens available across all liquidity pools on eBridge.',
    key: 'tokenCount',
  },
];

const Pools = () => {
  const isMd = useMediaQueries('md');
  const { poolOverview } = usePoolOverview();
  const overviewCardListMemo = useMemo(() => {
    return OverviewCardList.map((i) => {
      return { ...i, data: unitConverter(poolOverview?.[i.key]) };
    });
  }, [poolOverview]);

  return (
    <div className={styles['pools-page']}>
      <Col span={24} className={clsx(!isMd && styles['pool-page-component-wrap'], styles['page-overview-row'])}>
        <Row gutter={[12, 12]}>
          {overviewCardListMemo.map((i, key) => {
            return (
              <Col xl={6} key={key} md={12} span={24}>
                <PoolOverviewCard title={i.title} tooltipTitle={i.tooltipTitle} data={i.data} />
              </Col>
            );
          })}
        </Row>
      </Col>

      <div className={styles['pool-page-component-wrap']}>
        <PoolList />
      </div>
    </div>
  );
};

export default memo(Pools);
