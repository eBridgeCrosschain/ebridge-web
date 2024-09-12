import { Dropdown, Menu, Row } from 'antd';
import { useMemo } from 'react';
import { switchNetwork } from '../../utils/network';
import { ChainId, NetworkType } from 'types';
import { getIconByChainId, getNameByChainId } from 'utils/chain';
import IconFont from 'components/IconFont';
import styles from './styles.module.less';
import clsx from 'clsx';
import { arrowIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';

export default function Network({
  networkList,
  overlayClassName,
  onChange,
  className,
  chainId,
}: {
  overlayClassName?: string | undefined;
  networkList: NetworkType[];
  onChange?: (i: NetworkType['info']) => void;
  className?: string;
  chainId?: ChainId;
}) {
  const menu = useMemo(() => {
    return (
      <Menu
        selectedKeys={chainId ? [chainId.toString()] : ['']}
        items={networkList.map((i) => {
          return {
            key: i.info.chainId,
            label: i.title,
            onClick: () => (onChange || switchNetwork)(i.info),
          };
        })}
      />
    );
  }, [chainId, networkList, onChange]);

  const iconProps = useMemo(() => {
    if (!chainId) return undefined;
    return getIconByChainId(chainId);
  }, [chainId]);

  const name = getNameByChainId(chainId);

  return (
    <Dropdown
      className={clsx(styles.dropdown, 'cursor-pointer', 'flex-row-center', className)}
      overlayClassName={clsx(styles['dropdown-overlay'], overlayClassName)}
      overlay={menu}
      trigger={['click']}
      getPopupContainer={(triggerNode) => triggerNode}>
      <Row>
        <IconFont type={iconProps?.type || ''} />
        <div className={styles['network-name']}>{name || 'Wrong Network'}</div>
        <CommonImage priority className={styles['arrow-icon']} src={arrowIcon} />
      </Row>
    </Dropdown>
  );
}
