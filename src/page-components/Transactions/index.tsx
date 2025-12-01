import { Row, Tabs } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { request } from 'api';
import { NetworkList } from 'constants/index';
import { useWallet } from 'contexts/useWallet/hooks';
import useInterval from 'hooks/useInterval';
import useUrlSearchState from 'hooks/useUrlSearchState';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { usePrevious, useSetState } from 'react-use';
import { ChainId, CrossChainType, NetworkType } from 'types';
import { CrossChainItem } from 'types/api';
import { isELFChain } from 'utils/aelfUtils';
import { getChainIdToMap } from 'utils/chain';
import { parseCrossChainTransfers } from 'utils/transfers';
import Columns from './columns';
import { NetworkSelect, StatusSelect, TablePagination } from './components';
import styles from './styles.module.less';
import CommonTable from 'components/CommonTable';
import { useLanguage } from 'i18n';
import { isPortkey } from 'utils/portkey';
import MainContentHeader from 'components/MainContentHeader';
import clsx from 'clsx';
import useMediaQueries from 'hooks/useMediaQueries';
import PageHead from 'components/PageHead';
type State = {
  fromChainId?: ChainId;
  toChainId?: ChainId;
  status?: number;
  page?: number;
  totalCount?: number;
  list?: CrossChainItem[];
};

const PageSize = 10;

const columns: ColumnsType<any> = [
  Columns.sendAmount,
  Columns.sendingAddress,
  Columns.receivingAddress,
  Columns.fromTo(),
];

const DefaultListState = {
  page: 1,
  totalCount: 0,
  list: [],
};
function Body({
  state,
  selectState,
  setSelect,
  setState,
  networkList,
}: {
  state: State;
  selectState: State;
  setSelect: (v: any) => void;
  setState: (v: any) => void;
  networkList: NetworkType[];
}) {
  const { t } = useLanguage();
  const { page, totalCount, list } = state;
  const { fromChainId, toChainId, status } = selectState;
  return (
    <>
      <Row className="flex-row">
        <StatusSelect
          value={status}
          onChange={(value) => {
            setSelect({ status: value });
            setState(DefaultListState);
          }}
        />
        <NetworkSelect
          value={fromChainId}
          networkList={networkList}
          placeholder={t('From Chain')}
          onChange={(value) => {
            const tmpState: State = { fromChainId: value };
            if (toChainId && toChainId === value) tmpState.toChainId = fromChainId;
            setSelect(tmpState);
            setState(DefaultListState);
          }}
        />
        <NetworkSelect
          value={toChainId}
          networkList={networkList}
          placeholder={t('To Chain')}
          onChange={(value) => {
            const tmpState: State = { toChainId: value };
            if (fromChainId && fromChainId === value) tmpState.fromChainId = toChainId;
            setSelect(tmpState);
            setState(DefaultListState);
          }}
        />
      </Row>
      <CommonTable
        pagination={{ hideOnSinglePage: true, pageSize: PageSize }}
        rowKey={'id'}
        className={styles.table}
        columns={columns}
        dataSource={list}
        scroll={{ x: true }}
      />
      <TablePagination
        current={page ?? 1}
        onChange={(page: number) => setState({ page })}
        pageSize={PageSize}
        total={totalCount}
        showSizeChanger={false}
      />
    </>
  );
}

function useHistory({ crossChainType }: { crossChainType: CrossChainType }) {
  const [state, setState] = useSetState<State>(DefaultListState);
  const { page } = state;
  const [selectState, setSelect] = useSetState<State>();
  const { fromChainId, toChainId, status } = selectState;
  const { fromWallet, toWallet } = useWallet();
  const { account: fromAccount } = fromWallet || {};
  const { account: toAccount } = toWallet || {};

  const getReceiveList = useCallback(async () => {
    if (!(fromAccount || toAccount)) {
      return setState({ list: [], totalCount: 0 });
    }
    const addresses = [fromAccount, toAccount].filter(Boolean).join(',');
    const skipCount = page ? (page - 1) * PageSize : 0;
    let type;
    if (crossChainType === CrossChainType.homogeneous) {
      type = '0';
    } else if (crossChainType === CrossChainType.heterogeneous) {
      type = '1';
    }
    const req = await request.cross.getCrossChainTransfers({
      params: {
        addresses,
        toChainId: getChainIdToMap(toChainId),
        fromChainId: getChainIdToMap(fromChainId),
        status,
        skipCount,
        type,
        MaxResultCount: PageSize,
      },
    });
    if (req.items) {
      if (Array.isArray(req.items) && req.items.length === 0 && req.totalCount > 0) {
        setState({ page: Math.ceil(req.totalCount / PageSize) });
      } else {
        const list = parseCrossChainTransfers(req);
        setState({ list, totalCount: req.totalCount });
      }
    }
  }, [crossChainType, fromAccount, fromChainId, page, setState, status, toAccount, toChainId]);
  const preFromAccount = usePrevious(fromAccount);
  const preToAccount = usePrevious(toAccount);
  useEffect(() => {
    if (preFromAccount !== fromAccount || preToAccount !== toAccount) setState(DefaultListState);
  }, [fromAccount, preFromAccount, preToAccount, setState, toAccount]);
  useInterval(getReceiveList, [getReceiveList], 10000);
  const isomorphismNetworkList = useMemo(() => NetworkList.filter((i) => isELFChain(i.info.chainId)), []);
  return useMemo(
    () => ({
      networkList: crossChainType === CrossChainType.homogeneous ? isomorphismNetworkList : NetworkList,
      state,
      selectState,
      setSelect,
      setState,
    }),
    [crossChainType, isomorphismNetworkList, selectState, setSelect, setState, state],
  );
}

function History() {
  const [{ historyType = isPortkey() ? CrossChainType.heterogeneous : CrossChainType.all }, setActiveKey] =
    useUrlSearchState();

  const { t } = useLanguage();
  const isMd = useMediaQueries('md');

  const allData = useHistory({ crossChainType: CrossChainType.all });
  const heterogeneousData = useHistory({ crossChainType: CrossChainType.heterogeneous });
  const homogeneousData = useHistory({ crossChainType: CrossChainType.homogeneous });

  const tableData = useMemo(() => {
    switch (historyType) {
      case CrossChainType.heterogeneous:
        return heterogeneousData;
      case CrossChainType.homogeneous:
        return homogeneousData;
      case CrossChainType.all:
      default:
        return allData;
    }
  }, [allData, heterogeneousData, historyType, homogeneousData]);
  return (
    <>
      <PageHead title={t('eBridge: Cross-chain Bridge')} />
      <div className={clsx(styles.history, 'flex-column')}>
        <MainContentHeader
          wrap={isMd}
          title={t('Transactions')}
          tipConfig={{
            label: t('Can’t find your token?'),
            content: (
              <div className={styles['tooltip-content']}>
                <p className={styles['tooltip-title']}>
                  {t('Tips')}
                  {t(':')}
                </p>
                <ol>
                  <li>{t('Check the transaction status from the transaction records.')}</li>
                  <li>{t('For more details, click on the From/To TXID to track its progress on the Explorer.')}</li>
                </ol>
              </div>
            ),
          }}
        />
        <Tabs
          tabBarGutter={16}
          defaultActiveKey={CrossChainType.all}
          activeKey={CrossChainType[historyType as CrossChainType] ? historyType : undefined}
          onChange={(v) => setActiveKey({ historyType: v })}>
          {!isPortkey() && (
            <>
              <Tabs.TabPane tab={t('All Transactions')} key={CrossChainType.all} />
              <Tabs.TabPane tab={t('Homogeneous Chain Cross-Chain History')} key={CrossChainType.homogeneous} />
            </>
          )}
          <Tabs.TabPane tab={t('Heterogeneous Chain Cross-Chain History')} key={CrossChainType.heterogeneous} />
        </Tabs>
        {!(isPortkey() && (historyType === CrossChainType.all || historyType === CrossChainType.homogeneous)) && (
          <div className={styles['table-box']}>
            <Body
              networkList={tableData.networkList}
              state={tableData.state}
              selectState={tableData.selectState}
              setSelect={tableData.setSelect}
              setState={tableData.setState}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default memo(History);
