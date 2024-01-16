import { Button, message } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';
import clsx from 'clsx';
import { useAEflConnect, usePortkeyConnect } from 'hooks/web3';
import { Connector } from '@web3-react/types';
import { useChainDispatch } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectELFWallet, setSelectERCWallet, setSelectTRCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { TronLink } from '@web3-react/tron-link';

import { DEFAULT_ERC_CHAIN_INFO } from 'constants/index';
import { DEFAULT_TRC_CHAIN_INFO } from 'constants/index';
import { switchChain } from 'utils/network';
import { sleep } from 'utils';
import { isPortkey, isPortkeyConnector } from 'utils/portkey';
import { MetaMask } from '@web3-react/metamask';
export default function WalletList() {
  const [{ walletWallet, walletChainType }] = useModal();
  const { chainId, connector: connectedConnector, account } = walletWallet || {};
  const connect = useAEflConnect();
  const portkeyConnect = usePortkeyConnect();
  const [loading, setLoading] = useState<any>();
  const dispatch = useModalDispatch();
  const chainDispatch = useChainDispatch();
  const onCancel = useCallback(() => {
    setLoading(undefined);
    dispatch(basicModalView.setWalletModal(false));
  }, [dispatch]);
  const tryActivation = useCallback(
    async (connector: Connector | string, key: string) => {
      if (loading) return;
      setLoading({ [key]: true });
      try {
        switch (key) {
          case 'Coinbase Wallet':
            if (connector instanceof CoinbaseWallet) {
              await sleep(500);
              await switchChain(DEFAULT_ERC_CHAIN_INFO as any, connector, true);
            }
            break;
          case 'TRONLINK':
            if (connector instanceof TronLink) {
              await sleep(500);
              await switchChain(DEFAULT_TRC_CHAIN_INFO as any, connector, true);
            }
            break;
          default:
            if (typeof connector === 'string') {
              if (isPortkeyConnector(connector)) {
                await portkeyConnect();
                chainDispatch(setSelectELFWallet('PORTKEY'));
              } else {
                await connect();
                chainDispatch(setSelectELFWallet('NIGHTELF'));
              }
            } else {
              try {
                delete (connector as any).eagerConnection;
              } catch (error) {
                // fix network error
              }

              await connector.activate();
              chainDispatch(setSelectERCWallet(getConnection(connector)?.type));
            }
        }

        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        message.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, connect, loading, onCancel, portkeyConnect],
  );

  const walletList = useMemo(
    () =>
      Object.keys(SUPPORTED_WALLETS).filter((key) => {
        const option = SUPPORTED_WALLETS[key];
        const isStringConnector = typeof option.connector === 'string';
        const isStringChain = typeof chainId === 'string' || walletChainType === 'ELF';
        if (isPortkey()) {
          if (isStringChain) return isPortkeyConnector(option.connector as string);
          if (!isStringConnector) return !(option.connector instanceof MetaMask);
          if (!isStringConnector) return !(option.connector instanceof TronLink);
        }
        return isStringConnector ? isStringChain : !isStringChain;
      }),
    [chainId, walletChainType],
  );

  return (
    <>
      {walletList.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        const disabled = !!(account && option.connector && option.connector === connectedConnector);
        return (
          <Button
            className={clsx(disabled && 'selected')}
            disabled={disabled}
            loading={loading?.[option.name]}
            key={option.name}
            onClick={() => {
              tryActivation(option.connector, option.name);
            }}>
            <div>{option.name}</div>
            <IconFont className="wallet-icon" type={option.iconType} />
          </Button>
        );
      })}
    </>
  );
}
