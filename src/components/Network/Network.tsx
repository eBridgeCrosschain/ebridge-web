import { Dropdown, Menu, Row } from 'antd';
import { useLanguage } from 'i18n';
import { useMemo } from 'react';
import { switchNetwork } from '../../utils/network';
import { ChainId, NetworkType } from 'types';
import { getIconByActiveChainId, getNameByActiveChainId } from 'utils/chain';
import IconFont from 'components/IconFont';
import styles from './styles.module.less';
import clsx from 'clsx';
import useMediaQueries from 'hooks/useMediaQueries';
import CommonMessage from 'components/CommonMessage';
import { isChainSupportedByELF } from 'utils/common';
import { useWallet } from 'contexts/useWallet/hooks';

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
  const { fromWallet, toWallet } = useWallet();
  const allowedNetwork = (allNetwork: NetworkType[]) => {
    if (isChainSupportedByELF(chainId)) {
      if (isChainSupportedByELF(fromWallet?.chainId) && isChainSupportedByELF(toWallet?.chainId)) {
        if (fromWallet?.chainId == chainId) {
          return allNetwork.filter((item) => isChainSupportedByELF(item.info.chainId));
        } else {
          return allNetwork.filter((item) => {
            return !(isChainSupportedByELF(item.info.chainId) && toWallet?.chainId == item.info.chainId);
          });
        }
      } else {
        return allNetwork.filter((item) => isChainSupportedByELF(item.info.chainId));
      }
    } else {
      const AELFChainId = isChainSupportedByELF(fromWallet?.chainId) ? fromWallet?.chainId : toWallet?.chainId;
      return allNetwork.filter((item) => {
        return !(isChainSupportedByELF(item.info.chainId) && AELFChainId == item.info.chainId);
      });
    }
  };
  const { t } = useLanguage();
  const menu = useMemo(() => {
    return (
      <Menu
        selectedKeys={chainId ? [chainId.toString()] : ['']}
        items={allowedNetwork(networkList).map((i) => {
          return {
            key: i.info.chainId,
            label: i.title,
            onClick: () => (onChange || switchNetwork)(i.info),
          };
        })}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, networkList, onChange]);

  const iconProps = useMemo(() => {
    if (!chainId) return undefined;
    return getIconByActiveChainId(chainId);
  }, [chainId]);

  const isMd = useMediaQueries('md');
  const name = getNameByActiveChainId(chainId);

  const IconName = useMemo(() => {
    const props = { nameSize: 14, marginRight: 16 };

    if (isMd) {
      props.nameSize = 12;
      props.marginRight = 8;
    }

    if (!name) {
      CommonMessage.error(t('Invalid evm chain'));
    }

    return (
      <Row className="flex-row-center network-row" style={{ fontSize: props.nameSize }}>
        <IconFont type={iconProps?.type || ''} style={{ marginRight: props.marginRight }} />
        <div className="network-name">{name || 'Select a Network'}</div>
      </Row>
    );
  }, [iconProps?.type, isMd, name, t]);
  return (
    <Dropdown
      className={clsx(styles.dropdown, 'cursor-pointer', className)}
      overlayClassName={clsx(styles['dropdown-overlay'], overlayClassName)}
      overlay={menu}
      trigger={['click']}
      getPopupContainer={(triggerNode) => triggerNode}>
      <Row className="flex-row-center">
        {IconName}
        <div className="network-icon">
          <IconFont type="Search" />
        </div>
      </Row>
    </Dropdown>
  );
}
