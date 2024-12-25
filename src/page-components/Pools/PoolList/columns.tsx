import { Row } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import { Trans } from 'react-i18next';
import { APIPoolItem } from 'types/api';
import { getChainIdByAPI, getChainName, getIconByChainId } from 'utils/chain';
import { formatSymbol } from 'utils/token';
import styles from './styles.module.less';
import TokenLogo from 'components/TokenLogo';
import IconFont from 'components/IconFont';
import { unitConverter } from 'utils/converter';

const token: ColumnType<APIPoolItem> = {
  title: () => <Trans>Token</Trans>,
  width: 150,
  key: 'Token',
  ellipsis: true,
  dataIndex: 'token',
  render: (token, item) => {
    const chainId = getChainIdByAPI(item.chainId);
    return (
      <Row className="flex-row-center">
        <TokenLogo className={styles['token-logo']} chainId={chainId} symbol={token?.symbol} />
        <div>{formatSymbol(token?.symbol)}</div>
      </Row>
    );
  },
};

const network: ColumnType<APIPoolItem> = {
  width: 300,
  title: () => <Trans>Network</Trans>,
  key: 'Network',
  ellipsis: true,
  dataIndex: 'token',
  render: (_, item) => {
    const iconProps = getIconByChainId(getChainIdByAPI(item.chainId));
    return (
      <Row className="flex-row-center">
        <IconFont className={styles['network-icon']} type={iconProps?.type || ''} />
        <div>{getChainName(getChainIdByAPI(item.chainId))}</div>
      </Row>
    );
  },
};

const yourLiquidity: ColumnType<APIPoolItem> = {
  title: () => <Trans>Your Liquidity</Trans>,
  key: 'yourLiquidity',
  ellipsis: true,
  dataIndex: 'myTvlInUsd',
  render: (myTvlInUsd) => {
    return `$${myTvlInUsd}`;
  },
};

const totalLiquidity: ColumnType<APIPoolItem> = {
  align: 'right',
  title: () => <Trans>Total Liquidity</Trans>,
  key: 'totalLiquidity',
  ellipsis: true,
  dataIndex: 'totalTvlInUsd',
  render: (totalTvlInUsd) => {
    return `$${unitConverter(totalTvlInUsd)}`;
  },
};

const columns = {
  token,
  network,
  yourLiquidity,
  totalLiquidity,
};

export default columns;
