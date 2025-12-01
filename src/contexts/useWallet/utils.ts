import { WalletType, Web3Type } from 'types';
import { Options } from './actions';
import { Accounts, ChainId } from '@portkey/provider-types';
import { getELFAddress } from 'utils/aelfUtils';
import { isSelectPortkey } from 'utils/portkey';

export function formatPortkeyWallet(portkeyWallet: Web3Type, chainId: ChainId) {
  const _accounts = portkeyWallet?.accounts as Accounts;
  const chainAccounts = portkeyWallet.isActive ? _accounts?.[chainId as ChainId] : undefined;
  return {
    ...portkeyWallet,
    chainId,
    account: getELFAddress(chainAccounts?.[0]),
  };
}

export function getWalletByOptions(
  aelfWallet: Web3Type,
  web3Wallet: Web3Type,
  portkeyWallet: Web3Type,
  tonWallet: Web3Type,
  options?: Options,
  selectELFWallet?: WalletType,
) {
  const { chainType, chainId } = options || {};
  let wallet: any;

  if (chainType === 'ELF') {
    if (isSelectPortkey(selectELFWallet)) {
      wallet = formatPortkeyWallet(portkeyWallet, chainId as ChainId);
    } else {
      wallet = { ...aelfWallet, chainId };
    }
  } else if (chainType === 'TON') {
    wallet = tonWallet;
  } else {
    wallet = web3Wallet;
  }
  return wallet;
}

export function isChange(stateOptions?: Options, payloadOptions?: Options) {
  const { chainType: stateType, chainId: stateChainId } = stateOptions || {};
  const { chainType, chainId, isPortkey } = payloadOptions || {};

  const isExternalState = stateType !== 'ELF';
  const isExternalPayload = chainType !== 'ELF';

  return (
    (isPortkey && stateType === 'ELF' && chainType === 'ELF') ||
    ((isExternalState || isExternalPayload) && isExternalState === isExternalPayload) ||
    (stateType === 'ELF' && chainType === 'ELF' && stateChainId === chainId)
  );
}
