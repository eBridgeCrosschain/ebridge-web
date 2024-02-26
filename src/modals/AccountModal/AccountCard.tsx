import { Button, Card, Col, Row } from 'antd';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
import { useCallback, useMemo } from 'react';
import { injected } from '../../walletConnectors';
import { getExploreLink, shortenString } from '../../utils';
import Copy from '../../components/Copy';
import CommonLink from '../../components/CommonLink';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { isELFChain } from 'utils/aelfUtils';
import WalletIcon from 'components/WalletIcon';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
import { useChainDispatch } from 'contexts/useChain';
import { setSelectERCWallet, setSelectTRCWallet } from 'contexts/useChain/actions';
import { clearWCStorageByDisconnect } from 'utils/localStorage';
import { formatAddress } from 'utils/chain';
import CommonMessage from 'components/CommonMessage';
import { isChainSupportedByTRC } from 'utils/common';

function AccountCard() {
  const adapter = new TronLinkAdapter();
  const [{ accountWallet, accountChainId }, { dispatch }] = useModal();
  const chainDispatch = useChainDispatch();
  const handleDisconnect = () => {
    if (window.tronWeb) {
      window.tronWeb.defaultAddress = { ...window.tronWeb.defaultAddress };
    }
    localStorage.setItem('isTronDisconnected', JSON.stringify(true));
    window.location.reload();
  };

  const { connector, account, chainId, deactivate, aelfInstance, walletType, defaultAddress } = accountWallet || {};
  const filter = useCallback(
    (k: string) => {
      const isMetaMask = !!window.ethereum?.isMetaMask;
      return (
        SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      );
    },
    [connector],
  );
  adapter.on('disconnect', handleDisconnect);
  const connection = useMemo(() => {
    if (!connector || typeof connector === 'string') return;
    return getConnection(connector);
  }, [connector]);
  const formatConnectorName = useMemo(() => {
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter((k) => filter(k))
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return `Connected with ${name}`;
  }, [filter]);
  const onDisconnect = useCallback(async () => {
    if (typeof connector !== 'string') {
      try {
        await connection?.connector?.deactivate?.();
        await connection?.connector?.resetState?.();
      } catch (error) {
        console.log('error: ', error);
      } finally {
        if (isChainSupportedByTRC(accountChainId)) {
          adapter.disconnect();
          chainDispatch(setSelectTRCWallet(undefined));
        } else {
          chainDispatch(setSelectERCWallet(undefined));
        }
        clearWCStorageByDisconnect();
      }
    } else {
      deactivate?.();
    }
    if (!isChainSupportedByTRC(chainId)) {
      dispatch(
        basicModalView.setWalletModal(true, {
          walletWalletType: walletType,
          walletChainType: walletType === 'ERC' ? 'ERC' : 'ELF',
          walletChainId: chainId,
        }),
      );
    }
  }, [connector, dispatch, walletType, chainId, connection?.connector, chainDispatch, deactivate]);

  const getAddress = (walletAccount: string) => {
    if (isChainSupportedByTRC(chainId)) {
      return defaultAddress.base58.toString();
    } else {
      return walletAccount;
    }
  };

  const changeWallet = useCallback(async () => {
    try {
      return dispatch(
        basicModalView.setWalletModal(true, {
          walletWalletType: walletType,
          walletChainType: walletType === 'ERC' ? 'ERC' : walletType === 'TRC' ? 'TRC' : 'ELF',
          walletChainId: chainId,
        }),
      );
    } catch (error: any) {
      console.debug(`connection error: ${error}`);
      CommonMessage.error(`connection error: ${error.message}`);
    }
  }, [chainId, dispatch, walletType]);
  const isELF = isELFChain(chainId);
  const isTRC = isChainSupportedByTRC(chainId);

  return (
    <>
      <p>{formatConnectorName}</p>
      <Card className="account-modal-card">
        <div className="account-modal-card-box">
          {account && <WalletIcon className="account-modal-card-box-icon" connector={connector} />}
          <div>
            <Row>
              <Col span={24}>
                <Row gutter={[8, 0]}>
                  {account ? (
                    <Col className="flex-row-center account-modal-account">
                      {shortenString(isELF ? formatAddress(accountChainId, account) : getAddress(account), 8, 9)}
                    </Col>
                  ) : null}
                  {account ? (
                    <Col>
                      <Copy
                        className="account-modal-copy cursor-pointer"
                        toCopy={isELF ? formatAddress(accountChainId, account) : getAddress(account)}></Copy>
                    </Col>
                  ) : null}
                </Row>
              </Col>
              <Col>
                {accountChainId && account ? (
                  <CommonLink
                    showIcon={false}
                    className="account-modal-card-box-link"
                    href={getExploreLink(getAddress(account), 'address', accountChainId)}>
                    {isELF
                      ? `View on ${new URL(getExploreLink(account, 'address', accountChainId)).host}`
                      : isTRC
                      ? 'View on Tronscan'
                      : 'View on Etherscan'}
                  </CommonLink>
                ) : null}
              </Col>
            </Row>
          </div>
        </div>
      </Card>
      {aelfInstance?.connect ? null : (
        <Col span={24}>
          <Row justify={isTRC ? 'end' : 'space-between'} className="account-modal-button">
            <Button type="primary" onClick={onDisconnect}>
              Disconnect
            </Button>
            {!isTRC && (
              <Button type="primary" onClick={changeWallet}>
                Change
              </Button>
            )}
          </Row>
        </Col>
      )}
    </>
  );
}

export default AccountCard;
