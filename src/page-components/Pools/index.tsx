import { memo, useMemo } from 'react';
import styles from './styles.module.less';
import { Col, Row } from 'antd';
import clsx from 'clsx';
import PoolOverviewCard, { TPoolOverviewCardProps } from './PoolOverviewCard';
import PoolList from './PoolList';
import useMediaQueries from 'hooks/useMediaQueries';

const OverviewCardList: TPoolOverviewCardProps[] = [
  { title: 'Total TVL', tooltipTitle: 'The total value of all assets locked in liquidity pools across eBridge.' },
  {
    title: 'Your Total Liquidity',
    tooltipTitle: 'The total value of the liquidity you have added to all pools on eBridge.',
  },
  { title: 'Pools', tooltipTitle: 'The number of liquidity pools currently active on eBridge.' },
  {
    title: 'Tokens',
    tooltipTitle: 'The number of different tokens available across all liquidity pools on eBridge.',
  },
];

const Pools = () => {
  const isMd = useMediaQueries('md');
  // MOCK Token Address
  //   const tokenContract = useTokenContract(chainId, '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679');
  //   const poolContract = usePoolContract(chainId);
  //   const { account, library } = useWeb3();

  const overviewCardListMemo = useMemo(() => {
    return OverviewCardList.map((i) => {
      //FIXME: Mock Data
      return { ...i, data: '$2,612.12' };
    });
  }, []);

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
