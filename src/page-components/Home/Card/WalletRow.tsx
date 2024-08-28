import { Button, Divider, Row } from 'antd';
import clsx from 'clsx';
import Network from 'components/Network';
import WalletIcon from 'components/WalletIcon';
import { NetworkList } from 'constants/index';
import { basicModalView, setAccountModal, setWalletModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { setFromWallet, setToWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import { usePortkey, useWeb3 } from 'hooks/web3';
import { memo, useCallback, useMemo } from 'react';
import { useLanguage } from 'i18n';
import { ChainType, NetworkType, Web3Type } from 'types';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { switchChain } from 'utils/network';
import styles from './styles.module.less';
import { useChain } from 'contexts/useChain';
import { isPortkey, isSelectPortkey } from 'utils/portkey';
import { Accounts, ChainId } from '@portkey/provider-types';
import { formatAddress } from 'utils/chain';
import CommonMessage from 'components/CommonMessage';
import { useWebLogin } from 'aelf-web-login';
import { useHomeContext } from '../HomeContext';
import { IS_ONLY_SIDE_CHAIN_LIST } from 'constants/misc';
import { SupportedELFChainId } from 'constants/chain';

function WalletRow({ wallet, isForm, chainType }: { wallet?: Web3Type; isForm?: boolean; chainType?: ChainType }) {
  const { dispatch } = useWalletActions();
  const { t } = useLanguage();
  const { connector: web3Connector, chainId: web3ChainId, account: web3Account } = useWeb3();
  const { login } = useWebLogin();
  const [{ selectToken }] = useHomeContext();

  const { chainId, account, connector } = wallet || {};
  const portkeyWallet = usePortkey();
  const [{ selectELFWallet }] = useChain();
  const modalDispatch = useModalDispatch();

  const renderRightBtn = useMemo(() => {
    if (account && isPortkey() && isELFChain(chainId)) {
      return null;
    }

    return (
      <>
        <Divider type="vertical" className={styles['wallet-divider']} />
        {account ? (
          <Row
            onClick={() =>
              modalDispatch(
                setAccountModal(true, {
                  accountWalletType: wallet?.walletType,
                  accountChainId: chainId,
                }),
              )
            }
            className={clsx('cursor-pointer', 'flex-row-center', styles['wallet-account-row'])}>
            <WalletIcon connector={connector} className={styles['wallet-icon']} />
            <div className={styles['wallet-address']}>
              {shortenString(isELFChain(chainId) ? formatAddress(chainId, account) : account, 8, 8)}
            </div>
          </Row>
        ) : (
          <Button
            className={styles['wallet-row-btn']}
            type="primary"
            onClick={() => {
              if (chainType === 'ELF') {
                login();
                return;
              }
              modalDispatch(
                setWalletModal(true, {
                  walletWalletType: wallet?.walletType,
                  walletChainType: chainType,
                  walletChainId: chainId,
                }),
              );
            }}>
            {t('Connect')}
          </Button>
        )}
      </>
    );
  }, [account, chainId, chainType, connector, login, modalDispatch, t, wallet?.walletType]);
  const onChange = useCallback(
    async (info: NetworkType['info']) => {
      const _wallet = portkeyWallet;
      const selectPortkey = isSelectPortkey(selectELFWallet);
      if (selectPortkey && _wallet?.isActive && isELFChain(info.chainId)) {
        const accounts = (_wallet as { accounts: Accounts }).accounts;

        if (!accounts?.[info.chainId as ChainId]) {
          modalDispatch(
            basicModalView.setPortketNotConnectModal({
              visible: true,
              chainId: info.chainId,
            }),
          );
          return;
        }
      }
      const setWallet = isForm ? setFromWallet : setToWallet;
      if (typeof info.chainId === 'string') {
        dispatch(
          setWallet({ chainType: 'ELF', chainId: info.chainId, isPortkey: selectPortkey && portkeyWallet.isActive }),
        );
      } else {
        dispatch(setWallet({ chainType: 'ERC' }));
      }
      try {
        await switchChain(info, !isELFChain(info.chainId) ? web3Connector : connector, !!web3Account, web3ChainId);
      } catch (error: any) {
        CommonMessage.error(error.message);
      }
    },
    [
      connector,
      dispatch,
      isForm,
      modalDispatch,
      portkeyWallet,
      selectELFWallet,
      web3Account,
      web3ChainId,
      web3Connector,
    ],
  );

  const networkList = useMemo(() => {
    let _list = NetworkList.filter((item) => !isELFChain(item.info.chainId));
    const selectPortkey = isSelectPortkey(selectELFWallet) && portkeyWallet.isActive;
    if (!selectPortkey || isELFChain(wallet?.chainId)) {
      _list = NetworkList;
    } else if (isELFChain(chainId)) {
      _list = NetworkList.filter((item) => isELFChain(item.info.chainId));
    }
    const isOnlySideChain = IS_ONLY_SIDE_CHAIN_LIST.includes(selectToken?.symbol || '');
    return _list.filter((i) => (isOnlySideChain ? i.info.chainId !== SupportedELFChainId.AELF : true));
  }, [chainId, portkeyWallet.isActive, selectELFWallet, selectToken, wallet?.chainId]);

  return (
    <Row className={styles['wallet-row']}>
      <Network
        className={clsx(styles['network'], { [styles['wallet-connected']]: account })}
        chainId={chainId}
        networkList={networkList}
        onChange={onChange}
      />
      {renderRightBtn}
    </Row>
  );
}

export default memo(WalletRow);
