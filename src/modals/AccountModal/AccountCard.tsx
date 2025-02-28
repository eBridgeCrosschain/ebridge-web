import { Button, Card, Col, Row } from 'antd';
import { useCallback, useMemo } from 'react';
import { getExploreLink, shortenString } from '../../utils';
import Copy from '../../components/Copy';
import CommonLink from '../../components/CommonLink';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { isELFChain } from 'utils/aelfUtils';
import WalletIcon from 'components/WalletIcon';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { useChainDispatch } from 'contexts/useChain';
import { setSelectERCWallet } from 'contexts/useChain/actions';
import { clearWCStorageByDisconnect } from 'utils/localStorage';
import { formatAddress } from 'utils/chain';
import CommonMessage from 'components/CommonMessage';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useRouter } from 'next/router';
import IconFont from 'components/IconFont';
import { useAelfLogout } from 'hooks/wallet';
import { TelegramPlatform } from 'utils/telegram/telegram';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useConnect } from 'hooks/useConnect';
import { useWeb3 } from 'hooks/web3';
import { EVMConnectorId, TWalletConnectorId } from 'types';

function AccountCard() {
  const [{ accountWallet, accountChainId }, { dispatch }] = useModal();
  const chainDispatch = useChainDispatch();
  const router = useRouter();
  const logoutWebLogin = useAelfLogout();
  const connect = useConnect();
  const [tonConnectUI] = useTonConnectUI();
  const { deactivate } = useWeb3();

  const { connector, connectorId, account, aelfInstance, walletType, loginWalletType } = accountWallet || {};
  const filter = useCallback(
    (k: TWalletConnectorId) => {
      const isMetaMask = !!window.ethereum?.isMetaMask;
      return SUPPORTED_WALLETS[k].connectorId === connectorId && isMetaMask === (k === EVMConnectorId.METAMASK);
    },
    [connectorId],
  );

  const formatConnectorName = useMemo(() => {
    const keys = Object.keys(SUPPORTED_WALLETS) as TWalletConnectorId[];
    const name = keys.filter((k) => filter(k)).map((k) => SUPPORTED_WALLETS[k].name)[0];
    return `Connected with ${name}`;
  }, [filter]);

  const showAelfDisconnectButton = useMemo(() => {
    return !(TelegramPlatform.isTelegramPlatform() && walletType === 'PORTKEY');
  }, [walletType]);

  const onDisconnect = useCallback(async () => {
    if (typeof connector !== 'string') {
      // WEB3
      try {
        await deactivate?.();
        // await connection?.connector?.resetState?.(); // TODO
      } catch (error) {
        console.log('error: ', error);
      } finally {
        chainDispatch(setSelectERCWallet(undefined));
        clearWCStorageByDisconnect();
      }
    } else if (connector === 'TON') {
      tonConnectUI.disconnect?.();
      connect('TON');
    } else {
      // Aelf
      logoutWebLogin?.();
    }
    if (walletType !== 'ERC') {
      dispatch(basicModalView.modalDestroy());
      return;
    }

    dispatch(
      basicModalView.setWalletModal(true, {
        walletWalletType: walletType,
        walletChainType: walletType === 'ERC' ? 'ERC' : 'ELF',
        walletChainId: accountChainId,
      }),
    );
  }, [
    connector,
    walletType,
    dispatch,
    accountChainId,
    deactivate,
    chainDispatch,
    tonConnectUI,
    connect,
    logoutWebLogin,
  ]);

  const changeWallet = useCallback(async () => {
    if (walletType !== 'ERC') {
      onDisconnect();
      return;
    }

    try {
      return dispatch(
        basicModalView.setWalletModal(true, {
          walletWalletType: walletType,
          walletChainType: walletType === 'ERC' ? 'ERC' : 'ELF',
          walletChainId: accountChainId,
        }),
      );
    } catch (error: any) {
      console.debug(`connection error: ${error}`);
      CommonMessage.error(`connection error: ${error.message}`);
    }
  }, [accountChainId, dispatch, onDisconnect, walletType]);

  const isELF = isELFChain(accountChainId);

  const jumpAssets = useCallback(() => {
    dispatch(basicModalView.modalDestroy());
    router.push('/assets');
  }, [dispatch, router]);
  return (
    <>
      <div className="account-modal-info-wrap">
        <div className="account-modal-info-label">{formatConnectorName}</div>
        {loginWalletType === WalletTypeEnum.aa && (
          <div onClick={jumpAssets} className="account-modal-info-assets">
            View Assets
            <IconFont className="account-modal-info-assets-arrow" type="Search" />
          </div>
        )}
      </div>

      <Card className="account-modal-card">
        <div className="account-modal-card-box">
          {account && <WalletIcon className="account-modal-card-box-icon" connectorId={connectorId} />}
          <div>
            <Row>
              <Col span={24}>
                <Row>
                  {account ? (
                    <Col className="flex-row-center account-modal-account">
                      {shortenString(isELF ? formatAddress(accountChainId, account) : account, 8, 8)}
                    </Col>
                  ) : null}
                  {account ? (
                    <Col>
                      <Copy
                        className="account-modal-copy cursor-pointer"
                        toCopy={isELF ? formatAddress(accountChainId, account) : account}></Copy>
                    </Col>
                  ) : null}
                </Row>
              </Col>
              <Col>
                {accountChainId && account ? (
                  <CommonLink
                    showIcon={false}
                    className="account-modal-card-box-link"
                    href={getExploreLink(account, 'address', accountChainId)}>
                    {`View on ${new URL(getExploreLink(account, 'address', accountChainId)).host}`}
                  </CommonLink>
                ) : null}
              </Col>
            </Row>
          </div>
        </div>
      </Card>
      {aelfInstance?.connect ? null : (
        <Col span={24}>
          <Row justify="space-between" className="account-modal-button">
            {showAelfDisconnectButton && (
              <>
                <Button type="primary" onClick={onDisconnect}>
                  Disconnect
                </Button>
                {walletType !== 'TON' && (
                  <Button type="primary" onClick={changeWallet}>
                    Change
                  </Button>
                )}
              </>
            )}
          </Row>
        </Col>
      )}
    </>
  );
}

export default AccountCard;
